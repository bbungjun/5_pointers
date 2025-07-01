import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';

// 모듈화된 컴포넌트들
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import PreviewModal from './NoCodeEditor/PreviewModal';
import EditorHeader from './NoCodeEditor/components/EditorHeader';
import TemplateModal from './NoCodeEditor/components/TemplateModal';
import CanvasComponent from './NoCodeEditor/components/CanvasComponent';
import UserCursor from './NoCodeEditor/components/UserCursor';

// 유틸리티 함수들
import { 
  GRID_SIZE, 
  clamp, 
  randomNickname, 
  randomColor, 
  getComponentDimensions,
  resolveCollision,
  calculateSnapLines 
} from './NoCodeEditor/utils/editorUtils';

// 컴포넌트 정의
import { ComponentDefinitions } from './components/definitions';

// 협업 기능 imports
import { useCollaboration } from '../hooks/useCollaboration';

function NoCodeEditor() {
  const { roomId } = useParams();

  // 기본 상태
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });
  const [zoom, setZoom] = useState(100);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewport, setViewport] = useState('desktop');

  // 템플릿 저장 모달 상태
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'wedding',
    tags: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true); // 컴포넌트 라이브러리 토글 상태

  // 사용자 정보
  const [userInfo] = useState(() => ({
    id: Math.random().toString(36).slice(2, 10),
    name: randomNickname(),
    color: randomColor()
  }));
  
  // 사용자 권한 확인
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsAdmin(payload.role === 'ADMIN');
        }
      } catch (error) {
        console.error('사용자 권한 확인 실패:', error);
      }
    };
    checkUserRole();
  }, []);

  // ref
  const canvasRef = useRef();
  const containerRef = useRef();

  // 협업 기능 통합
  const collaboration = useCollaboration({
    roomId,
    userInfo,
    canvasRef,
    selectedComponentId: selectedId,
    onComponentsUpdate: setComponents
  });

  // 협업 상태 구조분해할당
  const {
    isConnected,
    otherCursors,
    otherSelections,
    updateComponent,
    addComponent,
    removeComponent,
    updateCursorPosition,
    getActiveUsers
  } = collaboration;

  // 연결 상태 표시 (선택사항)
  useEffect(() => {
    if (isConnected) {
      console.log('협업 서버에 연결되었습니다.');
    }
  }, [isConnected]);

  // 컴포넌트 선택 시 해당 컴포넌트가 보이도록 스크롤 이동
  useEffect(() => {
    if (!selectedId || !canvasRef.current || !containerRef.current) return;
    const comp = components.find(c => c.id === selectedId);
    if (!comp) return;
    const compRect = {
      left: comp.x,
      top: comp.y,
      right: comp.x + (comp.width || 120),
      bottom: comp.y + (comp.height || 40)
    };
    const container = containerRef.current;
    // 스크롤 이동 (컴포넌트가 중앙에 오도록)
    container.scrollTo({
      left: Math.max(0, compRect.left - container.clientWidth / 2 + ((comp.width || getComponentDimensions(comp.type).defaultWidth) / 2)),
      top: Math.max(0, compRect.top - container.clientHeight / 2 + ((comp.height || getComponentDimensions(comp.type).defaultHeight) / 2)),
      behavior: 'smooth'
    });
  }, [selectedId, components]);

  // 캔버스에서 드래그 앤 드롭으로 컴포넌트 추가
  const handleDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      const compDef = ComponentDefinitions.find(def => def.type === type);
      if (compDef) {
        const effectiveGridSize = GRID_SIZE;
        const dimensions = getComponentDimensions(type);
        const width = dimensions.defaultWidth;
        const height = dimensions.defaultHeight;
        
        const snappedX = Math.round(e.nativeEvent.offsetX / effectiveGridSize) * effectiveGridSize;
        const snappedY = Math.round(e.nativeEvent.offsetY / effectiveGridSize) * effectiveGridSize;
        
        const maxX = viewport === 'mobile' ? Math.max(0, 375 - width) : Math.max(0, 1920 - width);
        const maxY = viewport === 'mobile' ? Math.max(0, 667 - height) : Math.max(0, 1080 - height);
        
        let clampedX = clamp(snappedX, 0, maxX);
        let clampedY = clamp(snappedY, 0, maxY);
        
        const newComponent = {
          id: Math.random().toString(36).slice(2, 10),
          type,
          x: clampedX,
          y: clampedY,
          width,
          height,
          props: { ...compDef.defaultProps }
        };
        
        const collisionResult = resolveCollision(newComponent, components, getComponentDimensions);
        clampedX = collisionResult.x;
        clampedY = collisionResult.y;
        
        clampedX = clamp(clampedX, 0, maxX);
        clampedY = clamp(clampedY, 0, maxY);
        
        // 협업 기능으로 컴포넌트 추가
        addComponent({
          ...newComponent,
          x: clampedX,
          y: clampedY
        });
      }
    }
  };

  // 컴포넌트 선택
  const handleSelect = id => {
    setSelectedId(id);
  };

  // 속성 변경 (스냅라인 포함)
  const handleUpdate = comp => {
    // 협업 기능으로 컴포넌트 업데이트
    updateComponent(comp.id, comp);
      
    // 스냅라인 계산
    const lines = calculateSnapLines(comp, components, zoom, viewport, getComponentDimensions);
    setSnapLines(lines);
  };

  // 컴포넌트 삭제
  const handleDelete = id => {
    // 협업 기능으로 컴포넌트 삭제
    removeComponent(id);
    if (selectedId === id) setSelectedId(null);
  };

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedId, components]);

  // 속성 인스펙터
  const selectedComp = components.find(c => c.id === selectedId);
  
  // 활성 사용자 정보 (디버깅용)
  const activeUsers = getActiveUsers();
  console.log('활성 사용자:', activeUsers.length);

  // 브라우저 전체 확대/축소(Ctrl+스크롤, Ctrl+키, 트랙패드 pinch) 완벽 차단
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.body.addEventListener('wheel', preventWheelZoom, { passive: false });

    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventKeyZoom);
    document.addEventListener('keydown', preventKeyZoom);
    document.body.addEventListener('keydown', preventKeyZoom);

    const preventGesture = (e) => {
      e.preventDefault();
    };
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.body.removeEventListener('wheel', preventWheelZoom, { passive: false });

      window.removeEventListener('keydown', preventKeyZoom);
      document.removeEventListener('keydown', preventKeyZoom);
      document.body.removeEventListener('keydown', preventKeyZoom);

      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // 줌 상태 변경 핸들러
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // 뷰포트 전환 핸들러
  const handleViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
    // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
    setSelectedId(null);
  }, []);
  
  // 템플릿으로 저장
  const handleSaveAsTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/templates/from-components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          components: components, // 현재 에디터 상태
          name: templateData.name,
          category: templateData.category,
          tags: templateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      });
      
      if (response.ok) {
        alert('템플릿으로 저장되었습니다!');
        setIsTemplateSaveOpen(false);
        setTemplateData({ name: '', category: 'wedding', tags: '' });
      } else {
        alert('템플릿 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
      alert('템플릿 저장에 실패했습니다.');
    }
  };

  // 새 섹션 추가 핸들러
  const handleAddSection = useCallback((sectionY) => {
    // 기존 더미 컴포넌트들 확인
    const existingExtenders = components.filter(comp => comp.id.startsWith('canvas-extender-'));
    
    // 새로운 확장 위치 계산
    const newExtenderY = sectionY + 200;
    
    // 기존 확장 영역보다 더 아래에 있는 경우에만 새로운 더미 컴포넌트 추가
    const maxExistingY = existingExtenders.length > 0 
      ? Math.max(...existingExtenders.map(comp => comp.y))
      : 0;
    
    if (newExtenderY > maxExistingY) {
      // 캔버스 높이를 확장하기 위해 투명한 더미 컴포넌트 추가
      const dummyComponent = {
        id: `canvas-extender-${Date.now()}`,
        type: 'text',
        x: 0,
        y: newExtenderY,
        width: 1,
        height: 1,
        props: {
          text: '',
          fontSize: 1,
          color: 'transparent',
          backgroundColor: 'transparent'
        }
      };
      
      // 더미 컴포넌트 추가하여 캔버스 확장
      addComponent(dummyComponent);
    }
    
    // 새로 추가된 섹션으로 스크롤
    setTimeout(() => {
      if (containerRef.current) {
        const targetScrollTop = sectionY * (zoom / 100) - 200;
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, [viewport, zoom, addComponent, components]);

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex',
      background: '#fff', color: '#222', fontFamily: 'Inter, sans-serif', overflow: 'hidden'
    }}>
      {/* 에디터 헤더 */}
      <EditorHeader
        components={components}
        selectedComp={selectedComp}
        isLibraryOpen={isLibraryOpen}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        onPreviewOpen={() => setIsPreviewOpen(true)}
        onTemplateSaveOpen={() => setIsTemplateSaveOpen(true)}
        roomId={roomId}
        isAdmin={isAdmin}
      />

      {/* 좌측: 컴포넌트 라이브러리 (토글 가능) */}
      <ComponentLibrary 
        onDragStart={(e, type) => {
          e.dataTransfer.setData('componentType', type);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        components={components}
        roomId={roomId}
        isOpen={isLibraryOpen}
        onToggle={() => setIsLibraryOpen(!isLibraryOpen)}
      />

      {/* 중앙: 캔버스 */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        height: '100vh', // 전체 화면 높이
        display: 'flex',
        position: 'relative',
        overflow: 'hidden' // 내부 컴포넌트에서 스크롤 처리
      }}>
        <CanvasArea
          containerRef={containerRef}
          canvasRef={canvasRef}
          components={components}
          selectedId={selectedId}
          users={{}} // 기존 users 대신 빈 객체
          nickname={userInfo.name}
          snapLines={snapLines}
          setSnapLines={setSnapLines}
          onDrop={e => { handleDrop(e); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => handleSelect(null)}
          onMouseMove={() => {}} // 커서 추적은 협업 훅에서 처리
          onMouseUp={() => {}}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddSection={handleAddSection} // 새 섹션 추가 핸들러
          CanvasComponent={CanvasComponent}
          UserCursor={UserCursor}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          viewport={viewport}
          isInspectorOpen={!!selectedComp}
          isLibraryOpen={isLibraryOpen} // 라이브러리 상태 전달
          updateCursorPosition={updateCursorPosition} // 협업 커서 위치 업데이트
          // 협업 기능 props 추가
          otherCursors={otherCursors}
          otherSelections={otherSelections}
          getComponentDimensions={getComponentDimensions} // 컴포넌트 크기 함수
        />
      </div>

      {/* 우측: 속성 인스펙터 */}
      {selectedComp && (
        <Inspector
          selectedComp={selectedComp}
          onUpdate={handleUpdate}
          color={userInfo.color}
          nickname={userInfo.name}
          roomId={roomId}
        />
      )}

      {/* 미리보기 모달 */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pageContent={components}
      />
      
      {/* 템플릿 저장 모달 */}
      <TemplateModal
        isOpen={isTemplateSaveOpen}
        onClose={() => {
          setIsTemplateSaveOpen(false);
          setTemplateData({ name: '', category: 'wedding', tags: '' });
        }}
        templateData={templateData}
        setTemplateData={setTemplateData}
        onSave={handleSaveAsTemplate}
      />

      {/* 연결 상태 표시 */}
      {!isConnected && (
        <div style={{
          position: 'fixed',
          bottom: '40px', // 스크롤바 위로 올림
          left: isLibraryOpen ? '260px' : '20px', // 라이브러리 상태에 따라 위치 조정
          padding: '8px 12px',
          backgroundColor: '#ff9800',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 999 // 스크롤바보다 낮은 z-index
        }}>
          협업 서버 연결 중...
        </div>
      )}

      {/* 스타일 태그로 high-contrast, readable 스타일 보장 */}
      <style>{`
        body, html { overflow: hidden !important; height: 100%; }
        input, button { outline: none; }
        ::selection { background: #3B4EFF22; }
      `}</style>
    </div>
  );
}

export default NoCodeEditor;