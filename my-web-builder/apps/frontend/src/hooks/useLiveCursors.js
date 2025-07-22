import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { addUserColor } from '../utils/userColors';

/**
 * 실시간 커서 및 선택 상태 관리 훅
 * - 다른 사용자의 커서 위치 표시
 * - 다른 사용자의 선택 상태 표시
 * - 성능 최적화를 위한 쓰로틀링 적용
 */
export function useLiveCursors(awareness, canvasRef, updateActivity) {
  const [otherCursors, setOtherCursors] = useState([]);
  const [otherSelections, setOtherSelections] = useState([]);
  
  // 쓰로틀링을 위한 ref
  const lastUpdateRef = useRef(0);
  const throttleMs = 16; // 60fps

  // 커서 위치 업데이트 함수 (캔버스 콘텐츠 기준 좌표)
  const updateCursorPosition = useCallback((clientX, clientY, zoom = 100, viewport = 'desktop') => {
    if (!awareness || !canvasRef?.current) return;

    // 쓰로틀링 체크
    const now = Date.now();
    if (now - lastUpdateRef.current < throttleMs) return;
    lastUpdateRef.current = now;

    // 사용자 활동 감지
    if (updateActivity) {
      updateActivity();
    }

    // 커서 숨기기
    if (clientX === null || clientY === null) {
      awareness.setLocalStateField('cursor', null);
      return;
    }

    // 캔버스 DOM 요소의 실제 위치 정보
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const currentScale = Math.max(zoom / 100, 0.1);
    
    // 브라우저 좌표를 캔버스 내부 픽셀 좌표로 변환
    const canvasPixelX = clientX - canvasRect.left;
    const canvasPixelY = clientY - canvasRect.top;

    // 캔버스 경계 체크
    if (canvasPixelX < 0 || canvasPixelY < 0 || 
        canvasPixelX > canvasRect.width || canvasPixelY > canvasRect.height) {
      awareness.setLocalStateField('cursor', null);
      return;
    }

    // 캔버스 픽셀 좌표를 콘텐츠 좌표로 변환 (줌 독립적)
    // 현재 줌 레벨을 역산하여 실제 콘텐츠 상의 위치 계산
    const contentX = canvasPixelX / currentScale;
    const contentY = canvasPixelY / currentScale;

    console.log('커서 위치 저장 (콘텐츠 좌표):', {
      브라우저좌표: { clientX, clientY },
      캔버스픽셀좌표: { canvasPixelX, canvasPixelY },
      현재줌: zoom + '%',
      현재스케일: currentScale,
      콘텐츠좌표: { contentX, contentY }
    });

    // 콘텐츠 좌표를 저장 (줌 독립적)
    awareness.setLocalStateField('cursor', {
      x: contentX,
      y: contentY,
      viewport,
      timestamp: now,
    });
  }, [awareness, canvasRef, updateActivity]);

  // 선택 상태 업데이트 함수
  const updateSelection = useCallback((selectedComponentIds, viewport = 'desktop') => {
    if (!awareness) return;

    // 사용자 활동 감지
    if (updateActivity) {
      updateActivity();
    }

    // Awareness에 선택 상태 저장
    awareness.setLocalStateField('selection', {
      componentIds: selectedComponentIds || [],
      viewport,
      timestamp: Date.now(),
    });
  }, [awareness, updateActivity]);

  // 다른 사용자들의 상태 변화 감지
  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const cursors = [];
      const selections = [];
      const now = Date.now();

      states.forEach((state, clientId) => {
        // 자신 제외
        if (clientId === awareness.clientID) return;

        const { user, cursor, selection } = state;

        // 커서 정보 처리 (5초 내 데이터만)
        if (user && cursor && (now - cursor.timestamp) < 5000) {
          cursors.push({
            id: clientId,
            x: cursor.x,
            y: cursor.y,
            user: {
              id: user.id,
              name: user.name,
              color: user.color,
            },
            timestamp: cursor.timestamp,
          });
        }

        // 선택 정보 처리 (10초 내 데이터만)
        if (user && selection && (now - selection.timestamp) < 10000) {
          selections.push({
            id: clientId,
            componentIds: selection.componentIds || [],
            viewport: selection.viewport || 'desktop',
            user: {
              id: user.id,
              name: user.name,
              color: user.color,
            },
            timestamp: selection.timestamp,
          });
        }
      });

      setOtherCursors(cursors);
      setOtherSelections(selections);
    };

    awareness.on('change', handleAwarenessChange);

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  return {
    otherCursors,
    otherSelections,
    updateCursorPosition,
    updateSelection,
  };
}
