import { useCallback } from 'react';
import {
  getComponentDimensions,
  clamp,
  resolveCollision,
  GRID_SIZE,
} from '../pages/NoCodeEditor/utils/editorUtils';
import { ComponentDefinitions } from '../pages/components/definitions';
import { API_BASE_URL } from '../config';

/**
 * 컴포넌트 액션 관리 훅
 * - 컴포넌트 추가/수정/삭제 로직
 * - 템플릿 저장 로직
 * - 섹션 추가 로직
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
  const { addComponent, updateComponent, removeComponent } = collaboration;

  // 컴포넌트 드래그 앤 드롭 추가
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('componentType');
      if (type) {
        const compDef = ComponentDefinitions.find((def) => def.type === type);
        if (compDef) {
          const effectiveGridSize = GRID_SIZE;
          const dimensions = getComponentDimensions(type);
          const width = dimensions.defaultWidth;
          const height = dimensions.defaultHeight;

          const snappedX =
            Math.round(e.nativeEvent.offsetX / effectiveGridSize) *
            effectiveGridSize;
          const snappedY =
            Math.round(e.nativeEvent.offsetY / effectiveGridSize) *
            effectiveGridSize;

          const maxX =
            viewport === 'mobile'
              ? Math.max(0, 375 - width)
              : Math.max(0, 1920 - width);
          const maxY = Math.max(0, canvasHeight - height);

          let clampedX = clamp(snappedX, 0, maxX);
          let clampedY = clamp(snappedY, 0, maxY);

          // 유니크한 ID 생성
          const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${userInfo.id}-${Math.random().toString(36).slice(2, 8)}`;

          // 충돌 방지를 위한 임시 컴포넌트 생성
          const tempComponent = {
            id: uniqueId,
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

          clampedX = clamp(clampedX, 0, maxX);
          clampedY = clamp(clampedY, 0, maxY);

          // 새로운 시스템에 맞는 단순한 컴포넌트 구조
          const newComponent = {
            id: uniqueId,
            type,
            x: clampedX,
            y: clampedY,
            width,
            height,
            props: { ...(compDef?.defaultProps || {}) },
            editedViewport: viewport, // 현재 편집 중인 뷰포트 저장
            createdBy: userInfo.id,
            createdAt: Date.now(),
          };

          console.log('🆕 새 컴포넌트 생성:', uniqueId, type, {
            x: clampedX,
            y: clampedY,
          });

          // 협업 기능으로 컴포넌트 추가
          addComponent(newComponent);

          // 추가된 컴포넌트 반환 (선택을 위해)
          return uniqueId;
        }
      }
      return null;
    },
    [addComponent, userInfo, components, viewport, canvasHeight]
  );

  // 컴포넌트 업데이트
  const handleUpdate = useCallback(
    (comp) => {
      console.log('컴포넌트 업데이트 요청:', comp.id, '타입:', comp.type);

      // 기존 컴포넌트 찾기
      const existingComp = components.find((c) => c.id === comp.id);
      if (!existingComp) {
        console.warn('업데이트할 컴포넌트를 찾을 수 없음:', comp.id);
        return;
      }

      // 변경된 속성만 추출
      const updates = {};
      Object.keys(comp).forEach((key) => {
        if (JSON.stringify(existingComp[key]) !== JSON.stringify(comp[key])) {
          updates[key] = comp[key];
          console.log(`속성 변경 감지: ${key}`, {
            기존: existingComp[key],
            새로운: comp[key],
          });
        }
      });
      
      // 편집 뷰포트 정보 유지 (위치나 크기 변경 시)
      if (updates.x !== undefined || updates.y !== undefined || updates.width !== undefined || updates.height !== undefined) {
        updates.editedViewport = viewport;
      }

      // 협업 기능으로 컴포넌트 업데이트
      if (Object.keys(updates).length > 0) {
        console.log('Y.js 업데이트 호출:', comp.id, updates);
        updateComponent(comp.id, updates);
      } else {
        console.log('변경된 속성이 없음');
      }
    },
    [updateComponent, components]
  );

  // 컴포넌트 삭제
  const handleDelete = useCallback(
    (id, selectedId, setSelectedId) => {
      // 협업 기능으로 컴포넌트 삭제
      removeComponent(id);
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [removeComponent]
  );

  // 템플릿으로 저장
  const handleSaveAsTemplate = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/templates/from-components`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            components: components,
            name: templateData.name,
            category: templateData.category,
            tags: templateData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag),
          }),
        }
      );

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
  }, [components, templateData, setIsTemplateSaveOpen, setTemplateData]);

  // 새 섹션 추가
  const handleAddSection = useCallback(
    (sectionY, containerRef, zoom) => {
      // 현재 캔버스 높이에 새 섹션 높이를 추가
      const newCanvasHeight = Math.max(canvasHeight, sectionY + 400);
      console.log('섹션 추가:', {
        currentHeight: canvasHeight,
        sectionY,
        newCanvasHeight,
      });
      setCanvasHeight(newCanvasHeight);

      // 새로 추가된 섹션으로 스크롤
      setTimeout(() => {
        if (containerRef.current) {
          const targetScrollTop = sectionY * (zoom / 100) - 200;
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }, 100);
    },
    [canvasHeight, setCanvasHeight]
  );

  return {
    handleDrop,
    handleUpdate,
    handleDelete,
    handleSaveAsTemplate,
    handleAddSection,
  };
}
