import { useEffect, useRef } from 'react';
import { useYjsCollaboration } from './useYjsCollaboration';
import { useLiveCursors } from './useLiveCursors';

/**
 * 통합 협업 훅 - 모든 Y.js 협업 기능을 하나로 관리
 * 
 * 이 훅은 3가지 핵심 협업 시나리오를 모두 제공합니다:
 * 1. 라이브 커서 및 선택 영역 공유
 * 2. 컴포넌트 단위 주석 및 토론
 * 3. 버전 히스토리 및 스냅샷 복원
 */
export function useCollaboration({
  roomId,
  userInfo,
  canvasRef,
  selectedComponentId,
  onComponentsUpdate
}) {
  // Y.js 기본 인프라 설정
  const { ydoc, provider, awareness, isConnected } = useYjsCollaboration(roomId, userInfo);

  // 라이브 커서 관리
  const { 
    otherCursors, 
    otherSelections, 
    updateSelection, 
    updateCursorPosition 
  } = useLiveCursors(awareness, canvasRef);



  // DB 복구 상태 추적
  const hasRestoredRef = useRef(false);

  // DB에서 복구하는 함수
  const restoreFromDatabase = async (roomId, yArray) => {
    try {
      console.log("🔄 Y.js 문서가 비어있음, DB에서 복구 시도...");
      const response = await fetch(`/api/users/pages/room/${roomId}/content`);
      if (response.ok) {
        const data = await response.json();
        if (data.components && data.components.length > 0) {
          console.log("✅ DB에서 복구:", data.components.length, "개 컴포넌트");
          yArray.insert(0, data.components); // Y.js 문서에 직접 삽입
          return true;
        }
      }
    } catch (error) {
      console.log("📝 새 문서 시작 (복구 실패 또는 데이터 없음)");
    }
    return false;
  };

  // 컴포넌트 데이터 동기화를 위한 Y.Array 설정
  const componentsArrayRef = useRef(null);

  useEffect(() => {
    if (!ydoc) return;

    // Y.js에서 컴포넌트 데이터를 관리하는 Y.Array 생성
    const yComponents = ydoc.getArray?.('components');
    console.log("🔍 Y.js 배열 상태:", { yComponents: !!yComponents, length: yComponents?.length });
    if (!yComponents) return;
    componentsArrayRef.current = yComponents;

    // 컴포넌트 변화 감지 및 React 상태 업데이트
    const handleComponentsChange = () => {
      try {
        const componentsData = yComponents.toArray();
        onComponentsUpdate?.(componentsData);
      } catch (error) {
        console.error('컴포넌트 데이터 업데이트 중 오류:', error);
      }
    };

    // 초기 데이터 로드
    handleComponentsChange();

    try {
      yComponents.observe(handleComponentsChange);
    } catch (error) {
      console.error('Y.js 컴포넌트 리스너 등록 실패:', error);
    }

    return () => {
      try {
        yComponents.unobserve(handleComponentsChange);
      } catch (error) {
        console.error('Y.js 컴포넌트 리스너 해제 실패:', error);
      }
    };
  }, [ydoc, onComponentsUpdate, isConnected, roomId]);

  // Y.js 연결 완료 후 복구 처리
  useEffect(() => {
    if (!ydoc || hasRestoredRef.current) return;

    const yComponents = ydoc.getArray?.("components");
    console.log("🔍 Y.js 배열 상태:", { yComponents: !!yComponents, length: yComponents?.length });
    if (!yComponents) return;

    // 약간의 지연 후 복구 시도 (Y.js 초기화 완료 대기)
    setTimeout(() => {
    // 연결 완료 후 Y.js 문서가 비어있으면 복구
    if (yComponents.length === 0) {
      console.log("🔗 Y.js 연결 완료, 복구 시작...");
      hasRestoredRef.current = true;
      restoreFromDatabase(roomId, yComponents);
    }
    }, 1000); // 1초 후 복구 시도
  }, [ydoc, roomId]);

  // 선택된 컴포넌트 변화를 Awareness에 반영
  useEffect(() => {
    if (selectedComponentId) {
      updateSelection([selectedComponentId]);
    } else {
      updateSelection([]);
    }
  }, [selectedComponentId, updateSelection]);

  // 컴포넌트 업데이트 함수 (Y.js 동기화)
  const updateComponent = (componentId, updates) => {
    if (!componentsArrayRef.current) return;

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const componentIndex = components.findIndex(c => c.id === componentId);

    if (componentIndex !== -1) {
      const updatedComponent = { ...components[componentIndex], ...updates };
      yComponents.delete(componentIndex, 1);
      yComponents.insert(componentIndex, [updatedComponent]);
    }
  };

  // 컴포넌트 추가 함수
  const addComponent = (component) => {
    if (!componentsArrayRef.current) return;

    componentsArrayRef.current.push([component]);
  };

  // 컴포넌트 삭제 함수
  const removeComponent = (componentId) => {
    if (!componentsArrayRef.current) return;

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const componentIndex = components.findIndex(c => c.id === componentId);

    if (componentIndex !== -1) {
      yComponents.delete(componentIndex, 1);
    }
  };

  // 전체 컴포넌트 배열 업데이트 (대량 변경 시 사용)
  const updateAllComponents = (newComponents) => {
    if (!componentsArrayRef.current) return;

    const yComponents = componentsArrayRef.current;
    
    // 트랜잭션으로 묶어서 한 번에 업데이트
    ydoc?.transact(() => {
      yComponents.delete(0, yComponents.length);
      yComponents.insert(0, newComponents);
    });
  };

  // 현재 활성 사용자 목록 가져오기
  const getActiveUsers = () => {
    if (!awareness) return [];

    const states = awareness.getStates();
    const users = [];

    states.forEach((state, clientId) => {
      if (state.user && clientId !== awareness.clientID) {
        users.push({
          id: state.user.id,
          name: state.user.name,
          color: state.user.color,
          clientId,
          isActive: true
        });
      }
    });

    return users;
  };

  return {
    // 연결 상태
    isConnected,

    // 라이브 커서 및 선택
    otherCursors,
    otherSelections,
    updateCursorPosition,
    updateSelection,

    // 컴포넌트 동기화
    updateComponent,
    addComponent,
    removeComponent,
    updateAllComponents,

    // 사용자 관리
    getActiveUsers,

    // Y.js 원시 접근 (고급 사용자용)
    ydoc,
    provider,
    awareness
  };
} 