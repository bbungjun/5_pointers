import { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';
import { useToastContext } from '../contexts/ToastContext';

/**
 * 에디터 UI 상호작용 관리 훅
 * - UI 상태 관리 (선택, 줌, 패널, 모달 등)
 * - 뷰포트/편집모드 전환 핸들러
 */
export function useEditorInteractionManager(designMode, setDesignMode) {
  // UI 상태 관리
  const [selectedId, setSelectedId] = useState(null);
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });
  const [zoom, setZoom] = useState(100); // 줌 초기값을 60%로 설정
  const [viewport, setViewport] = useState(designMode);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 모달 상태들
  const [isTemplateSaveOpen, setIsTemplateSaveOpen] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    category: 'etc',
    tags: '',
  });
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const { showError } = useToastContext();

  // designMode가 외부(PageDataManager)에서 바뀌면 viewport 동기화
  useEffect(() => {
    setViewport(designMode);
  }, [designMode]);

  // 선택 핸들러
  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  // 줌 변경 핸들러
  const handleZoomChange = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  // 뷰포트 전환 핸들러
  const handleViewportChange = useCallback(
    (newViewport) => {
      console.log(`🔄 뷰포트 변경: ${viewport} → ${newViewport}`);
      setViewport(newViewport);
      // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
      setSelectedId(null);
      // 뷰포트 변경 시 스냅라인 초기화
      setSnapLines({ vertical: [], horizontal: [] });
      console.log('🧹 뷰포트 변경으로 인한 스냅라인 초기화');
    },
    [viewport]
  );

  // 편집 기준 모드 변경 핸들러
  const handleDesignModeChange = useCallback(
    async (newDesignMode, roomId, isFromTemplate = false) => {
      if (newDesignMode === designMode) return;

      // 템플릿으로부터 생성된 페이지인 경우 편집 기준 변경 불가
      if (isFromTemplate) {
        showError('템플릿으로 생성한 페이지에서는 편집 기준을 변경할 수 없습니다.');
        return;
      }

      // 변경 확인 메시지
      const confirmChange = window.confirm(
        `편집 기준을 "${newDesignMode === 'desktop' ? '데스크탑' : '모바일'}"으로 변경하시겠습니까?\n\n이 변경사항은 저장됩니다.`
      );

      if (!confirmChange) return;

      console.log(`🔄 편집 기준 변경: ${designMode} → ${newDesignMode}`);

      try {
        // API 호출하여 DB에 designMode 저장
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/pages/${roomId}/design-mode`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ designMode: newDesignMode }),
        });

        if (!response.ok) {
          throw new Error('편집 기준 변경 실패');
        }

        // API 성공 후 상태 업데이트
        setDesignMode(newDesignMode);
        // 편집 기준이 변경되면 뷰포트를 동일하게 설정
        setViewport(newDesignMode);
        // 선택 해제
        setSelectedId(null);

        console.log(
          `✅ 편집 기준이 ${newDesignMode}으로 성공적으로 변경되었습니다.`
        );
      } catch (error) {
        console.error('편집 기준 변경 실패:', error);
        showError('편집 기준 변경에 실패했습니다. 다시 시도해주세요.');
      }
    },
    [designMode, setDesignMode, showError]
  );

  // 템플릿 저장 관련 핸들러들
  const handleTemplateSaveOpen = useCallback(() => {
    setIsTemplateSaveOpen(true);
  }, []);

  const handleTemplateSaveClose = useCallback(() => {
    setIsTemplateSaveOpen(false);
    setTemplateData({ name: '', category: 'etc', tags: '' });
  }, []);

  // 초대 모달 관련 핸들러들
  const handleInviteOpen = useCallback(() => {
    setIsInviteOpen(true);
  }, []);

  const handleInviteClose = useCallback(() => {
    setIsInviteOpen(false);
  }, []);

  // 미리보기 모달 관련 핸들러들
  const handlePreviewOpen = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  // 라이브러리 토글 핸들러
  const handleLibraryToggle = useCallback(() => {
    setIsLibraryOpen((prev) => !prev);
  }, []);

  return {
    // 상태
    selectedId,
    setSelectedId,
    snapLines,
    setSnapLines,
    zoom,
    viewport,
    isLibraryOpen,
    isPreviewOpen,
    isTemplateSaveOpen,
    templateData,
    setTemplateData,
    isInviteOpen,

    // 핸들러들
    handleSelect,
    handleZoomChange,
    handleViewportChange,
    handleDesignModeChange,
    handleTemplateSaveOpen,
    handleTemplateSaveClose,
    handleInviteOpen,
    handleInviteClose,
    handlePreviewOpen,
    handlePreviewClose,
    handleLibraryToggle,
  };
}
