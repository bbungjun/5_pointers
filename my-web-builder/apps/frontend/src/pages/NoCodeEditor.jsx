import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useAutoSave from '../hooks/useAutoSave';
import SaveStatusIndicator from '../components/SaveStatusIndicator';
import { YJS_WEBSOCKET_URL } from '../config';
// 모듈화된 컴포넌트들
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import PreviewModal from './NoCodeEditor/PreviewModal';
import EditorHeader from './NoCodeEditor/components/EditorHeader';
import TemplateModal from './NoCodeEditor/components/TemplateModal';
import InviteModal from './NoCodeEditor/components/InviteModal';
import CanvasComponent from './NoCodeEditor/components/CanvasComponent';
import UserCursor from './NoCodeEditor/components/UserCursor';
import WebSocketConnectionGuide from '../components/WebSocketConnectionGuide';
import ChatBubble from '../components/collaboration/ChatBubble';
import ChatInput from '../components/collaboration/ChatInput';
import ConnectionStatus from '../components/ConnectionStatus';

// 훅들
import { usePageDataManager } from '../hooks/usePageDataManager';
import { useCollaboration } from '../hooks/useCollaboration';
import { useEditorInteractionManager } from '../hooks/useEditorInteractionManager';
import { useComponentActions } from '../hooks/useComponentActions';

// 유틸리티
import { getUserColor } from '../utils/userColors';
import { getComponentDimensions } from './NoCodeEditor/utils/editorUtils';

// 쓰로틀링 유틸리티 함수
const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

function NoCodeEditor({ pageId }) {
  const [searchParams] = useSearchParams();

  // Toast Context를 안전하게 사용
  let showSuccess = null;
  let showError = null;
  try {
    const { useToastContext } = require('../contexts/ToastContext');
    const toastContext = useToastContext();
    showSuccess = toastContext?.showSuccess;
    showError = toastContext?.showError;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showSuccess = (message) => alert(message);
    showError = (message) => alert(message);
  }

  // pageId가 없으면 임시 ID 생성 (하지만 실제로는 pageId가 항상 있어야 함)
  const effectivePageId = pageId || `room-${Date.now()}`;

  // URL 파라미터는 더 이상 사용하지 않음 (페이지의 editingMode 사용)
  const initialViewport = 'desktop'; // 기본값만 설정

  // 템플릿 정보는 더 이상 URL 파라미터로 전달하지 않음
  const templateCategory = null;

  const canvasRef = useRef();
  const containerRef = useRef();
  const [components, setComponents] = useState([]);

  // 다중 선택 관련 상태
  const [selectedIds, setSelectedIds] = useState([]);
  const [clipboard, setClipboard] = useState([]);

  // 멤버 목록 새로고침 함수 (useCallback으로 관리)
  const [refetchMembers, setRefetchMembers] = useState(() => () => {});

  // 1. 데이터 로딩 및 상태 관리
  const {
    designMode,
    setDesignMode,
    canvasHeight,
    setCanvasHeight,
    isLoading,
    isFromTemplate,
    decodeJWTPayload,
    pageTitle,
    setPageTitle,
    updatePageTitle,
  } = usePageDataManager(effectivePageId, initialViewport);

  // 2. 사용자 정보 처리 (단순화)
  const [userInfo] = useState(() => {
    const token = localStorage.getItem('token');
    const payload = decodeJWTPayload(token);

    if (!payload) {
      console.error('토큰이 유효하지 않습니다.');
      return null;
    }

    const userId =
      payload.userId ||
      payload.id ||
      payload.sub ||
      Math.random().toString(36).slice(2, 10);
    const nickname =
      payload.nickname ||
      payload.name ||
      payload.email?.split('@')[0] ||
      '사용자';
    const role = payload.role || 'USER';

    return {
      id: userId,
      name: nickname,
      color: getUserColor(userId),
      role: role,
    };
  });

  // isAdmin 상태 추가
  const isAdmin = userInfo?.role === 'ADMIN';

  // 3. UI 상호작용 관리 (초기 뷰포트 설정 포함)
  const interaction = useEditorInteractionManager(
    designMode,
    setDesignMode,
    initialViewport
  );

  // 4. 협업 동기화 로직 (항상 호출되도록 보장)
  const collaboration = useCollaboration({
    roomId: effectivePageId,
    userInfo: userInfo || {
      id: 'anonymous',
      name: 'Anonymous',
      color: '#000000',
    },
    canvasRef,
    selectedComponentId: interaction.selectedId,
    onComponentsUpdate: setComponents,
    onCanvasSettingsUpdate: (settings) => {
      if (
        settings.canvasHeight !== undefined &&
        settings.canvasHeight !== canvasHeight
      ) {
        console.log('협업을 통해 캔버스 높이 동기화:', settings.canvasHeight);
        setCanvasHeight(settings.canvasHeight);
      }
    },
    viewport: interaction.viewport,
  });

  // 템플릿 시작 시 모든 사용자에게 즉시 동기화 (최초 한 번만)
  const [hasInitialSync, setHasInitialSync] = useState(false);
  useEffect(() => {
    if (
      isFromTemplate &&
      effectivePageId &&
      !isLoading &&
      collaboration.isConnected &&
      components.length > 0 &&
      !hasInitialSync
    ) {
      console.log(
        '🎨 템플릿이 로드되었습니다. 모든 사용자에게 즉시 동기화 준비 완료'
      );
      if (collaboration.updateAllComponents) {
        console.log('🔄 모든 사용자에게 템플릿 동기화 시작...');
        collaboration.updateAllComponents(components);
        setHasInitialSync(true);
        console.log(
          '✅ 템플릿 초기 동기화 완료. 이후 Y.js가 실시간 협업을 처리합니다.'
        );
      }
    }
  }, [
    isFromTemplate,
    effectivePageId,
    isLoading,
    collaboration.isConnected,
    components.length,
    collaboration.updateAllComponents,
    hasInitialSync,
  ]);
  // collaboration이 undefined일 수 있으므로 기본값 제공
  const {
    otherCursors = [],
    otherSelections = [],
    updateCursorPosition = () => {},
    updateSelection = () => {},
    addComponent = () => {},
    updateComponent = () => {},
    updateComponentObject = () => {},
    removeComponent = () => {},
    updateAllComponents = () => {},
    getActiveUsers = () => [],
    undo = () => {},
    redo = () => {},
    getHistory = () => ({ canUndo: false, canRedo: false }),
    setHistory = () => {},
    setComponentDragging = () => {},
    isComponentDragging = () => false,
    syncComponentAfterDrag = () => {},
    // 채팅 관련 기본값
    chatMessages = [],
    isChatInputOpen = false,
    chatInputPosition = { x: 0, y: 0 },
    cursorPosition = { x: 0, y: 0 },
    sendChatMessage = () => {},
    openChatInput = () => {},
    closeChatInput = () => {},
    resetAutoCloseTimer = () => {},
    removeChatMessage = () => {},
    cursorChatMessages = {},
    startTyping = () => {},
    stopTyping = () => {},
    isConnected = false,
    connectionError = null,
  } = collaboration || {};

  // 5. 컴포넌트 액션 관리 (항상 호출되도록 보장)
  const actions = useComponentActions(
    collaboration || {},
    userInfo || { id: 'anonymous', name: 'Anonymous', color: '#000000' },
    components,
    interaction.viewport,
    canvasHeight,
    setCanvasHeight,
    interaction.templateData,
    interaction.setTemplateData,
    interaction.handleTemplateSaveClose
  );

  // 협업 시스템을 통한 컴포넌트 업데이트 함수
  const handleCollaborativeUpdate = useCallback(
    (updatedComponent) => {
      if (isConnected && updateComponentObject) {
        // 협업 모드: Y.js를 통한 동기화
        updateComponentObject(updatedComponent);
      } else {
        // 로컬 모드: 로컬 상태 업데이트
        setComponents((prevComponents) =>
          prevComponents.map((comp) =>
            comp.id === updatedComponent.id ? updatedComponent : comp
          )
        );
      }
    },
    [isConnected, updateComponentObject]
  );

  // 쓰로틀링된 커서 업데이트 함수 (useRef로 관리)
  const throttledUpdateCursorPositionRef = useRef(null);

  useEffect(() => {
    throttledUpdateCursorPositionRef.current = throttle(
      updateCursorPosition,
      16
    );
  }, [updateCursorPosition]);

  const throttledUpdateCursorPosition = useCallback((...args) => {
    if (throttledUpdateCursorPositionRef.current) {
      throttledUpdateCursorPositionRef.current(...args);
    }
  }, []);

  // 컴포넌트 선택 시 스크롤 이동
  useEffect(() => {
    if (!interaction.selectedId || !canvasRef.current || !containerRef.current)
      return;

    const comp = components.find((c) => c.id === interaction.selectedId);
    if (!comp) return;

    const container = containerRef.current;
    container.scrollTo({
      left: Math.max(
        0,
        comp.x - container.clientWidth / 2 + (comp.width || 120) / 2
      ),
      top: Math.max(
        0,
        comp.y - container.clientHeight / 2 + (comp.height || 40) / 2
      ),
      behavior: 'smooth',
    });
  }, [interaction.selectedId, components]);

  // 연결 상태 모니터링
  useEffect(() => {
    if (connectionError) {
      console.error('🔴 협업 연결 오류:', connectionError);
    } else if (isConnected) {
      console.log('🟢 Y.js 협업 연결 성공');
    } else {
      console.log('🟡 Y.js 협업 연결 중...');
    }
  }, [connectionError, isConnected]);

  // 연결 상태 변경 시 데이터 안정성 보장
  useEffect(() => {
    if (isConnected && !hasInitialSync) {
      console.log('🔗 연결 복구 감지, 데이터 안정성 확인...');
      
      // 연결 복구 시 기존 데이터가 있는지 확인
      if (components.length > 0) {
        // 기존 데이터를 YJS에 동기화하여 다른 사용자와 일치시킴
        setTimeout(() => {
          updateAllComponents(components);
        }, 500);
      }
    }
  }, [isConnected, hasInitialSync, components.length, updateAllComponents]);

  // 키보드 단축키 처리 (Delete, Ctrl+C, Ctrl+V)
  useEffect(() => {
    const onKeyDown = (e) => {
      // 텍스트 입력 중이면 무시
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Delete 또는 Backspace 키로 삭제
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          // 다중 선택된 컴포넌트들 삭제
          selectedIds.forEach((id) => {
            actions.handleDelete(id, id, interaction.setSelectedId);
          });
          setSelectedIds([]);
        } else if (interaction.selectedId) {
          // 단일 선택된 컴포넌트 삭제
          actions.handleDelete(
            interaction.selectedId,
            interaction.selectedId,
            interaction.setSelectedId
          );
        }
      }

      // Ctrl+C: 복사
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        const componentsToCopy =
          selectedIds.length > 0
            ? components.filter((comp) => selectedIds.includes(comp.id))
            : interaction.selectedId
              ? [components.find((comp) => comp.id === interaction.selectedId)]
              : [];

        if (componentsToCopy.length > 0) {
          setClipboard(componentsToCopy.map((comp) => ({ ...comp })));
        }
      }

      // Ctrl+V: 붙여넣기
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (clipboard.length > 0) {
          const newComponents = clipboard.map((comp) => ({
            ...comp,
            id: `${comp.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: comp.x + 20,
            y: comp.y + 20,
          }));

          // 협업 시스템의 addComponent 함수 사용
          newComponents.forEach((comp) => {
            addComponent(comp);
          });

          // 새로 붙여넣은 컴포넌트들을 선택
          setSelectedIds(newComponents.map((comp) => comp.id));
          if (newComponents.length === 1) {
            interaction.setSelectedId(newComponents[0].id);
          }
        }
      }

      // Ctrl+A: 전체 선택
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedIds(components.map((comp) => comp.id));
      }

      // Escape: 선택 해제
      if (e.key === 'Escape') {
        setSelectedIds([]);
        interaction.setSelectedId(null);
        // 협업 시스템에 선택 해제 알림
        updateSelection([], interaction.viewport);
      }

      // '/': 채팅 입력 열기
      if (e.key === '/') {
        e.preventDefault();
        // 현재 커서 위치를 사용하여 채팅 입력 열기
        openChatInput(cursorPosition.x, cursorPosition.y);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedIds,
    interaction.selectedId,
    actions,
    components,
    clipboard,
    interaction.setSelectedId,
    addComponent,
  ]);

  // 브라우저 확대/축소 방지
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const preventGesture = (e) => e.preventDefault();

    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    window.addEventListener('keydown', preventKeyZoom);
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', preventWheelZoom);
      window.removeEventListener('keydown', preventKeyZoom);
      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // 드롭 핸들러 (컴포넌트 추가 후 자동 선택)
  const handleDrop = useCallback(
    (e) => {
      const newComponentId = actions.handleDrop(e);
      if (newComponentId) {
        setTimeout(() => interaction.setSelectedId(newComponentId), 100);
      }
    },
    [actions, interaction.setSelectedId]
  );

  // 다중 선택 핸들러
  const handleMultiSelect = useCallback(
    (ids) => {
      console.log('handleMultiSelect 호출:', ids);
      setSelectedIds(ids);
      if (ids.length === 1) {
        interaction.setSelectedId(ids[0]);
      } else {
        interaction.setSelectedId(null);
      }
      // 협업 시스템에 다중 선택 알림
      updateSelection(ids, interaction.viewport);
    },
    [interaction.setSelectedId, interaction.viewport, updateSelection]
  );

  // 컴포넌트 선택 핸들러 (Ctrl+클릭 지원)
  const handleSelect = useCallback(
    (id, isCtrlPressed = false) => {
      if (id === null) {
        // 빈 영역 클릭 시 선택 해제
        setSelectedIds([]);
        interaction.setSelectedId(null);
        // 협업 시스템에 선택 해제 알림
        updateSelection([], interaction.viewport);
        return;
      }

      if (isCtrlPressed) {
        // Ctrl+클릭으로 다중 선택 토글
        if (selectedIds.includes(id)) {
          // 이미 선택된 컴포넌트를 다시 클릭하면 선택 해제
          const newSelectedIds = selectedIds.filter(
            (selectedId) => selectedId !== id
          );
          setSelectedIds(newSelectedIds);
          if (newSelectedIds.length === 1) {
            interaction.setSelectedId(newSelectedIds[0]);
            // 협업 시스템에 단일 선택 알림
            updateSelection(newSelectedIds, interaction.viewport);
          } else if (newSelectedIds.length === 0) {
            interaction.setSelectedId(null);
            // 협업 시스템에 선택 해제 알림
            updateSelection([], interaction.viewport);
          }
        } else {
          // 새로운 컴포넌트를 다중 선택에 추가
          const newSelectedIds = [...selectedIds, id];
          setSelectedIds(newSelectedIds);
          if (newSelectedIds.length === 1) {
            interaction.setSelectedId(id);
          }
          // 협업 시스템에 다중 선택 알림
          updateSelection(newSelectedIds, interaction.viewport);
        }
      } else {
        // 일반 클릭 시 단일 선택 (기존 다중 선택 해제)
        setSelectedIds([id]);
        interaction.setSelectedId(id);
        // 협업 시스템에 단일 선택 알림
        updateSelection([id], interaction.viewport);
      }
    },
    [
      selectedIds,
      interaction.setSelectedId,
      interaction.viewport,
      updateSelection,
    ]
  );

  // 자동저장 훅 (컴포넌트 변경 시에만 저장)
  const { isSaving, lastSaved, saveError, saveCount, saveNow } = useAutoSave(
    pageId, // roomId (페이지 ID)
    components, // 컴포넌트 배열
    canvasHeight, // 현재 캔버스 높이
    2000 // 디바운스 시간 (2초)
  );

  // 컴포넌트 변경 시 자동저장 트리거
  useEffect(() => {
    // 컴포넌트가 변경되면 자동저장 훅이 자동으로 처리
  }, [components]);

  // 컴포넌트 업데이트 핸들러
  const handleComponentsUpdate = useCallback((newComponents) => {
    setComponents(newComponents);
  }, []);

  // 연결 오류 시 로컬 상태 관리 활성화
  useEffect(() => {
    // 연결 오류 처리
  }, [connectionError]);

  // 컴포넌트와 선택된 컴포넌트
  const selectedComp = components.find((c) => c.id === interaction.selectedId);

  // 메모이제이션된 협업 객체
  const collaborationObject = useMemo(
    () => ({
      otherCursors,
      otherSelections,
      updateCursorPosition: throttledUpdateCursorPosition,
      addComponent,
      updateComponent,
      removeComponent,
      updateAllComponents,
      getActiveUsers,
      undo,
      redo,
      getHistory,
      setHistory,
      isConnected,
      syncComponentAfterDrag,
    }),
    [
      otherCursors,
      otherSelections,
      throttledUpdateCursorPosition,
      addComponent,
      updateComponent,
      removeComponent,
      updateAllComponents,
      getActiveUsers,
      undo,
      redo,
      getHistory,
      setHistory,
      isConnected,
      syncComponentAfterDrag,
    ]
  );

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <div style={{ fontSize: '1.2rem', color: '#64748b' }}>
            페이지를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* 헤더 */}
      <EditorHeader
        components={components}
        selectedComp={selectedComp}
        isLibraryOpen={interaction.isLibraryOpen}
        viewport={interaction.viewport}
        designMode={designMode}
        onViewportChange={interaction.handleViewportChange}
        onDesignModeChange={(newDesignMode) =>
          interaction.handleDesignModeChange(
            newDesignMode,
            pageId,
            isFromTemplate
          )
        }
        onPreviewOpen={interaction.handlePreviewOpen}
        onTemplateSaveOpen={interaction.handleTemplateSaveOpen}
        onInviteOpen={interaction.handleInviteOpen}
        pageId={pageId}
        roomId={effectivePageId}
        isConnected={isConnected}
        connectionError={connectionError}
        isAdmin={isAdmin}
        templateCategory={templateCategory}
        isFromTemplate={isFromTemplate}
        onMembersRefetch={(refetchFn) => {
          if (typeof refetchFn === 'function') {
            setRefetchMembers(() => refetchFn);
          }
        }}
        pageTitle={pageTitle}
        onPageTitleChange={updatePageTitle}
      />

      {/* 저장 상태 표시 */}
      <SaveStatusIndicator
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        saveCount={saveCount}
        onSaveNow={saveNow}
      />

      {/* 연결 상태 표시 (헤더 밖) */}
      <div className="absolute top-20 right-6 z-20">
        <ConnectionStatus
          isConnected={isConnected}
          connectionError={connectionError}
        />
      </div>

      {/* 메인 에디터 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 컴포넌트 라이브러리 */}
        <ComponentLibrary
          onDragStart={(e, type) => {
            e.dataTransfer.setData('componentType', type);
          }}
          components={components}
          roomId={effectivePageId}
          isOpen={interaction.isLibraryOpen}
          onToggle={interaction.handleLibraryToggle}
          isReady={true} // 항상 준비 상태로 설정 (Y.js 연결과 독립적)
        />

        {/* 중앙 캔버스 영역 */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <CanvasArea
            containerRef={containerRef}
            canvasRef={canvasRef}
            components={components}
            selectedId={interaction.selectedId}
            selectedIds={selectedIds}
            users={{}}
            nickname={userInfo.name}
            onSelect={handleSelect}
            onMultiSelect={handleMultiSelect}
            onUpdate={handleCollaborativeUpdate}
            onDelete={(id) =>
              actions.handleDelete(
                id,
                interaction.selectedId,
                interaction.setSelectedId
              )
            }
            snapLines={interaction.snapLines}
            setSnapLines={interaction.setSnapLines}
            viewport={interaction.viewport}
            zoom={interaction.zoom}
            onZoomChange={interaction.handleZoomChange}
            canvasHeight={canvasHeight}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              interaction.handleSelect(null);
              setSelectedIds([]);
            }}
            onMouseMove={() => {}}
            onMouseUp={() => {}}
            otherCursors={otherCursors}
            otherSelections={otherSelections}
            collaboration={collaborationObject}
            CanvasComponent={CanvasComponent}
            UserCursor={UserCursor}
            getComponentDimensions={getComponentDimensions}
            updateCursorPosition={throttledUpdateCursorPosition}
            pageId={pageId}
            onAddSection={(sectionY) =>
              actions.handleAddSection(sectionY, containerRef, interaction.zoom)
            }
            openChatInput={openChatInput}
            cursorChatMessages={cursorChatMessages}
            syncComponentAfterDrag={syncComponentAfterDrag}
          />
        </div>

        {/* 속성 인스펙터 */}
        {selectedComp && (
          <Inspector
            selectedComp={selectedComp}
            onUpdate={handleCollaborativeUpdate}
            viewport={interaction.viewport}
          />
        )}
      </div>

      {/* 모달들 */}
      <PreviewModal
        isOpen={interaction.isPreviewOpen}
        onClose={interaction.handlePreviewClose}
        pageId={pageId}
        components={components}
        canvasHeight={canvasHeight}
        editingViewport={interaction.viewport}
        templateCategory={templateCategory}
      />

      <TemplateModal
        isOpen={interaction.isTemplateSaveOpen}
        onClose={interaction.handleTemplateSaveClose}
        templateData={interaction.templateData}
        setTemplateData={interaction.setTemplateData}
        onSave={() => actions.handleSaveAsTemplate(components)}
      />

      <InviteModal
        isOpen={interaction.isInviteOpen}
        onClose={interaction.handleInviteClose}
        pageId={pageId}
        onInviteSuccess={() => {
          // 초대 성공 시 멤버 목록 새로고침
          if (typeof refetchMembers === 'function') {
            refetchMembers();
            console.log('초대 성공! 멤버 목록을 새로고침합니다.');
          }
        }}
      />

      {/* 채팅 UI */}
      {/* 채팅 메시지 버블들 */}
      {chatMessages.map((msg) => (
        <ChatBubble
          key={msg.id}
          x={msg.position?.x || 0}
          y={msg.position?.y || 0}
          user={msg.user}
          message={msg.message}
          timestamp={msg.timestamp}
          onClose={() => removeChatMessage(msg.id)}
          isOwnMessage={msg.user?.id === userInfo?.id}
          followCursor={false}
        />
      ))}

      {/* 커서 채팅 메시지들 (자신의 메시지만 표시) */}
      {Object.entries(cursorChatMessages).map(([userId, message]) => {
        if (!message) return null;

        // 자신의 메시지만 표시
        const isOwnMessage =
          userId === userInfo?.id || userId === String(userInfo?.id);

        // 자신의 메시지가 아니면 표시하지 않음
        if (!isOwnMessage) return null;

        return (
          <ChatBubble
            key={`cursor-chat-${userId}-${message}`}
            x={cursorPosition.x}
            y={cursorPosition.y}
            user={userInfo}
            message={message}
            timestamp={Date.now()}
            onClose={() => {
              // 메시지 제거는 useChat에서 자동으로 처리됨
            }}
            isOwnMessage={true}
            followCursor={true}
          />
        );
      })}

      {/* 채팅 입력 UI */}
      {isChatInputOpen && (
        <ChatInput
          x={cursorPosition.x}
          y={cursorPosition.y}
          user={userInfo}
          onSend={(message) => {
            sendChatMessage(message, cursorPosition);
          }}
          onCancel={closeChatInput}
          onInput={resetAutoCloseTimer}
          onStartTyping={startTyping}
          onStopTyping={stopTyping}
          followCursor={true}
        />
      )}

      {/* WebSocket 연결 안내 UI */}
      {connectionError && (
        <div className="websocket-guide">
          <WebSocketConnectionGuide
            wsUrl={YJS_WEBSOCKET_URL}
            onRetry={() => {
              console.log('🔄 WebSocket 재연결 시도...');

              // 협업 시스템 재연결 시도
              if (collaboration && collaboration.provider) {
                console.log('🔗 Y.js Provider 재연결 시도');
                collaboration.provider.connect();
              }

              // 페이지 새로고침을 통한 강제 재연결
              setTimeout(() => {
                if (!isConnected) {
                  console.log('🔄 페이지 새로고침을 통한 재연결');
                  window.location.reload();
                }
              }, 3000);
            }}
          />
        </div>
      )}

      {/* 줌 슬라이더 - 화면 중앙 하단 */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)', // 정확히 중앙 정렬
          zIndex: 1000,
          background: 'white',
          borderRadius: '8px',
          padding: '8px 12px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e1e5e9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '120px',
        }}
      >
        {/* 줌 레벨 표시 */}
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            minWidth: '35px',
          }}
        >
          {interaction.zoom}%
        </div>

        {/* 줌 슬라이더 */}
        <input
          type="range"
          min="35"
          max="150"
          value={interaction.zoom}
          onChange={(e) => {
            const newZoom = parseInt(e.target.value);
            interaction.handleZoomChange(newZoom);
          }}
          style={{
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            background: '#e1e5e9',
            outline: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#3B4EFF';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#e1e5e9';
          }}
        />
      </div>
    </div>
  );
}

export default NoCodeEditor;
