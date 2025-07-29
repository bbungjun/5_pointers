import { useCallback } from 'react';
import {
  getComponentDimensions,
  clamp,
  resolveCollision,
  GRID_SIZE,
} from '../pages/NoCodeEditor/utils/editorUtils';
import { ComponentDefinitions } from '../pages/components/definitions';
import { API_BASE_URL } from '../config';
import { useToastContext } from '../contexts/ToastContext';

/**
 * 컴포넌트 액션 관리 훅
 * - 컴포넌트 추가/수정/삭제 로직
 * - 템플릿 저장 로직
 * - 섹션 추가 로직
 * - Page 컴포넌트 자동 페이지 생성 로직
 */
export function useComponentActions(
  collaboration,
  userInfo,
  components,
  viewport,
  canvasHeight,
  setCanvasHeight,
  templateData,
  setTemplateData,
  setIsTemplateSaveOpen
) {
  const {
    addComponent,
    updateComponent,
    removeComponent,
    updateCanvasSettings,
  } = collaboration;
  const { showError, showSuccess } = useToastContext();

  // 유니크한 ID 생성 함수
  const generateUniqueId = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${userInfo.id}-${Math.random().toString(36).slice(2, 8)}`;
  };

  // 드롭 위치 계산 함수
  const calculateDropPosition = (e) => {
    const effectiveGridSize = GRID_SIZE;
    const snappedX =
      Math.round(e.nativeEvent.offsetX / effectiveGridSize) * effectiveGridSize;
    const snappedY =
      Math.round(e.nativeEvent.offsetY / effectiveGridSize) * effectiveGridSize;
    return { snappedX, snappedY };
  };

  // Page 컴포넌트 자동 페이지 생성 로직
  const handlePageComponentDrop = async (e) => {
    try {
      console.log('🆕 Page 컴포넌트 드롭 감지 - 자동 페이지 생성 시작');

      // 1. 드롭 위치 계산
      const { snappedX, snappedY } = calculateDropPosition(e);
      const dimensions = getComponentDimensions('page');
      const width = dimensions.defaultWidth;
      const height = dimensions.defaultHeight;

      const maxX =
        viewport === 'mobile'
          ? Math.max(0, 375 - width)
          : Math.max(0, 1920 - width);
      const maxY = Math.max(0, canvasHeight - height);

      let clampedX = clamp(snappedX, 0, maxX);
      let clampedY = clamp(snappedY, 0, maxY);

      // 충돌 방지
      const tempComponent = {
        id: 'temp',
        type: 'page',
        x: clampedX,
        y: clampedY,
        width,
        height,
      };
      const collisionResult = resolveCollision(
        tempComponent,
        components,
        getComponentDimensions
      );
      clampedX = collisionResult.x;
      clampedY = collisionResult.y;

      // 2. 새 페이지 자동 생성 API 호출
      const currentPageId = window.location.pathname.split('/').pop();
      const componentId = generateUniqueId();

      console.log('📡 페이지 생성 API 호출:', { currentPageId, componentId });

      const response = await fetch(
        `${API_BASE_URL}/users/pages/create-from-component`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            parentPageId: currentPageId,
            componentId: componentId,
            pageName: '새 페이지',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`페이지 생성 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ 페이지 생성 성공:', result);

      // 3. Page 컴포넌트 생성 및 캔버스에 추가
      const pageComponent = {
        id: componentId,
        type: 'page',
        x: clampedX,
        y: clampedY,
        width,
        height,
        props: {
          pageName: result.page.title,
          linkedPageId: result.page.id,
          deployedUrl: `${window.location.origin}/editor/${result.page.id}`,
          autoCreated: true,
          description: '',
          thumbnail: '',
          thumbnailType: 'auto',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          borderColor: '#007bff',
          borderWidth: '2px',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: '500',
        },
        editedViewport: viewport,
        createdBy: userInfo.id,
        createdAt: Date.now(),
      };

      // 4. 협업 시스템에 컴포넌트 추가
      addComponent(pageComponent);

      // 5. 성공 알림
      showSuccess(
        `🎉 새 페이지 "${result.page.title}"가 생성되고 연결되었습니다!`
      );

      console.log('✅ Page 컴포넌트 자동 생성 완료:', {
        componentId: pageComponent.id,
        linkedPageId: result.page.id,
        pageName: result.page.title,
      });

      return pageComponent.id;
    } catch (error) {
      console.error('❌ Page 컴포넌트 생성 실패:', error);
      showError('페이지 생성에 실패했습니다. 다시 시도해주세요.');
      return null;
    }
  };

  const handlePageButtonComponentDrop = async (e) => {
    try {
      console.log('🆕 PageButton 컴포넌트 드롭 감지 - 자동 페이지 생성 시작');
      const { snappedX, snappedY } = calculateDropPosition(e);
      const dimensions = getComponentDimensions('pageButton');
      const width = dimensions.defaultWidth;
      const height = dimensions.defaultHeight;

      const maxX =
        viewport === 'mobile'
          ? Math.max(0, 375 - width)
          : Math.max(0, 1920 - width);
      const maxY = Math.max(0, canvasHeight - height);

      let clampedX = clamp(snappedX, 0, maxX);
      let clampedY = clamp(snappedY, 0, maxY);

      const tempComponent = {
        id: 'temp',
        type: 'pageButton',
        x: clampedX,
        y: clampedY,
        width,
        height,
      };
      const collisionResult = resolveCollision(
        tempComponent,
        components,
        getComponentDimensions
      );
      clampedX = collisionResult.x;
      clampedY = collisionResult.y;

      const currentPageId = window.location.pathname.split('/').pop();
      const componentId = generateUniqueId();

      const response = await fetch(
        `${API_BASE_URL}/users/pages/create-from-component`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            parentPageId: currentPageId,
            componentId: componentId,
            pageName: '새 페이지',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`페이지 생성 실패: ${response.status}`);
      }

      const result = await response.json();

      // PageButton 컴포넌트 생성 및 캔버스에 추가
      const pageButtonComponent = {
        id: componentId,
        type: 'pageButton',
        x: clampedX,
        y: clampedY,
        width,
        height,
        props: {
          buttonText: '페이지 이동',
          icon: '📄',
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: '600',
          linkedPageId: result.page.id,
          deployedUrl: `${window.location.origin}/editor/${result.page.id}`,
        },
        editedViewport: viewport,
        createdBy: userInfo.id,
        createdAt: Date.now(),
      };

      addComponent(pageButtonComponent);

      showSuccess(
        `🎉 새 페이지 "${result.page.title}"가 생성되고 연결되었습니다!`
      );

      return pageButtonComponent.id;
    } catch (error) {
      showError('페이지 생성에 실패했습니다. 다시 시도해주세요.');
      return null;
    }
  };

  // 일반 컴포넌트 드롭 처리
  const handleNormalComponentDrop = (e) => {
    const type = e.dataTransfer.getData('componentType');
    const compDef = ComponentDefinitions.find((def) => def.type === type);

    if (compDef) {
      const { snappedX, snappedY } = calculateDropPosition(e);
      const dimensions = getComponentDimensions(type);
      const width = dimensions.defaultWidth;
      const height = dimensions.defaultHeight;

      const maxX =
        viewport === 'mobile'
          ? Math.max(0, 375 - width)
          : Math.max(0, 1920 - width);
      const maxY = Math.max(0, canvasHeight - height);

      let clampedX = clamp(snappedX, 0, maxX);
      let clampedY = clamp(snappedY, 0, maxY);

      // 충돌 방지
      const tempComponent = {
        id: 'temp',
        type,
        x: clampedX,
        y: clampedY,
        width,
        height,
      };
      const collisionResult = resolveCollision(
        tempComponent,
        components,
        getComponentDimensions
      );
      clampedX = collisionResult.x;
      clampedY = collisionResult.y;

      const uniqueId = generateUniqueId();
      const newComponent = {
        id: uniqueId,
        type,
        x: clampedX,
        y: clampedY,
        width,
        height,
        props: { ...(compDef?.defaultProps || {}) },
        editedViewport: viewport,
        createdBy: userInfo.id,
        createdAt: Date.now(),
      };

      addComponent(newComponent);
      return uniqueId;
    }
    return null;
  };

  // // 컴포넌트 드래그 앤 드롭 추가 (메인 함수)
  // const handleDrop = useCallback(
  //   async (e) => {
  //     e.preventDefault();
  //     const type = e.dataTransfer.getData('componentType');

  //     if (type === 'page') {
  //       // Page 컴포넌트 특별 처리: 자동 페이지 생성
  //       return await handlePageComponentDrop(e);
  //     } else {
  //       // 일반 컴포넌트 처리
  //       return handleNormalComponentDrop(e);
  //     }
  //   },
  //   [addComponent, userInfo, components, viewport, canvasHeight]
  // );

  // 컴포넌트 드래그 앤 드롭 추가 (메인 함수)
  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('componentType');

      if (type === 'page') {
        // Page 컴포넌트 특별 처리: 자동 페이지 생성
        return await handlePageComponentDrop(e);
      } else if (type === 'pageButton') {
        // PageButton 컴포넌트 특별 처리: 자동 페이지 생성
        return await handlePageButtonComponentDrop(e);
      } else {
        // 일반 컴포넌트 처리
        return handleNormalComponentDrop(e);
      }
    },
    [addComponent, userInfo, components, viewport, canvasHeight]
  );

  // 컴포넌트 업데이트 (실시간 동기화 개선)
  const handleUpdate = useCallback(
    (comp) => {
      // 기존 컴포넌트 찾기
      const existingComp = components.find((c) => c.id === comp.id);
      if (!existingComp) {
        console.warn('업데이트할 컴포넌트를 찾을 수 없음:', comp.id);
        return;
      }

      // 변경된 속성만 추출 (성능 최적화)
      const updates = {};
      let hasChanges = false;

      Object.keys(comp).forEach((key) => {
        const existingValue = existingComp[key];
        const newValue = comp[key];

        // 깊은 비교 대신 간단한 비교 사용 (성능 향상)
        if (existingValue !== newValue) {
          updates[key] = newValue;
          hasChanges = true;
        }
      });

      // 편집 뷰포트 정보 유지 (위치나 크기 변경 시)
      if (
        updates.x !== undefined ||
        updates.y !== undefined ||
        updates.width !== undefined ||
        updates.height !== undefined
      ) {
        updates.editedViewport = viewport;
      }

      // 협업 기능으로 컴포넌트 업데이트 (실시간 동기화)
      if (hasChanges && Object.keys(updates).length > 0) {
        console.log('🔄 컴포넌트 업데이트 요청:', comp.id, updates);
        updateComponent(comp.id, updates);
      }
    },
    [updateComponent, components, viewport]
  );

  // 컴포넌트 삭제
  const handleDelete = useCallback(
    (compId) => {
      removeComponent(compId);
    },
    [removeComponent]
  );

  // 템플릿으로 저장
  const handleSaveAsTemplate = useCallback(
    async (selectedComponents) => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          showError('로그인이 필요합니다.');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/templates/from-components`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              components: selectedComponents,
              name: templateData.name,
              category: templateData.category,
              editingMode: viewport === 'mobile' ? 'mobile' : 'desktop', // 현재 뷰포트에 따라 편집 기준 설정
              tags: templateData.tags
                ? templateData.tags.split(',').map((tag) => tag.trim())
                : [],
              canvasSettings: {
                canvasHeight: canvasHeight,
              },
            }),
          }
        );

        if (response.ok) {
          console.log('템플릿 저장 성공');
          showSuccess('템플릿이 성공적으로 저장되었습니다!');
          setTemplateData({ name: '', category: 'etc', tags: '' });
          setIsTemplateSaveOpen(false);
        } else {
          const errorData = await response.text();
          console.error('템플릿 저장 실패:', response.status, errorData);

          if (response.status === 401) {
            showError('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
          } else {
            showError(`템플릿 저장에 실패했습니다: ${response.status}`);
          }
        }
      } catch (error) {
        console.error('템플릿 저장 실패:', error);
        showError('템플릿 저장 중 오류가 발생했습니다.');
      }
    },
    [
      templateData,
      setTemplateData,
      setIsTemplateSaveOpen,
      canvasHeight,
      showError,
      showSuccess,
    ]
  );

  // 섹션 추가
  const handleAddSection = useCallback(
    (sectionY, containerRef, zoom) => {
      const newHeight = Math.max(canvasHeight, sectionY + 200);
      setCanvasHeight(newHeight);

      // 협업 시스템을 통해 캔버스 높이 동기화
      if (updateCanvasSettings) {
        updateCanvasSettings({ canvasHeight: newHeight });
        console.log(
          '🔄 협업 시스템을 통해 캔버스 높이 동기화 요청:',
          newHeight
        );
      } else {
        console.warn(
          '⚠️ updateCanvasSettings 함수가 없습니다. 협업 동기화가 불가능합니다.'
        );
      }

      console.log('섹션 추가:', { 기존높이: canvasHeight, 새높이: newHeight });
    },
    [canvasHeight, setCanvasHeight, updateCanvasSettings]
  );

  return {
    handleDrop,
    handleUpdate,
    handleDelete,
    handleSaveAsTemplate,
    handleAddSection,
  };
}
