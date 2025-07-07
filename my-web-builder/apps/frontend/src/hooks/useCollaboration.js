import { useEffect, useRef } from 'react';
import { useYjsCollaboration } from './useYjsCollaboration';
import { useLiveCursors } from './useLiveCursors';
import { API_BASE_URL } from '../config';

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
  onComponentsUpdate,
  viewport = 'desktop'
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
      const response = await fetch(`${API_BASE_URL}/users/pages/room/${roomId}/content`);
      if (response.ok) {
        const data = await response.json();
        if (data.components && data.components.length > 0) {
          console.log("✅ DB에서 복구:", data.components.length, "개 컴포넌트");
          
          // 기존 ID를 유지하되, 없는 경우에만 새로 생성
          const componentsWithIds = data.components.map(component => {
            if (!component.id) {
              const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${userInfo && userInfo.id || anonymous}`;
              return { ...component, id: uniqueId };
            }
            return component;
          });
          
          console.log("복구할 컴포넌트 ID들:", componentsWithIds.map(c => c.id));
          yArray.insert(0, componentsWithIds); // Y.js 문서에 직접 삽입
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
    const yComponents = ydoc && ydoc.getArray ? ydoc.getArray("components") : null;
    if (!yComponents) return;
    componentsArrayRef.current = yComponents;

      // 컴포넌트 변화 감지 및 React 상태 업데이트
  const handleComponentsChange = () => {
    try {
      const componentsData = yComponents.toArray();
      
      // 중복 ID 제거 (같은 ID를 가진 첫 번째 컴포넌트만 유지)
      const uniqueComponents = componentsData.filter((comp, index, arr) => {
        const firstIndex = arr.findIndex(c => c.id === comp.id);
        return firstIndex === index;
      });
      
      if (uniqueComponents.length !== componentsData.length) {
        console.log('중복 컴포넌트 제거:', componentsData.length - uniqueComponents.length, '개');
        // 중복이 있으면 Y.js 배열을 정리
        ydoc && ydoc.transact(() => {
          yComponents.delete(0, yComponents.length);
          yComponents.insert(0, uniqueComponents);
        });
      }
      
      onComponentsUpdate && onComponentsUpdate(uniqueComponents);
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

    const yComponents = ydoc && ydoc.getArray ? ydoc.getArray("components") : null;
    if (!yComponents) return;

    // 약간의 지연 후 복구 시도 (Y.js 초기화 완료 대기)
    setTimeout(() => {
    // 연결 완료 후 Y.js 문서가 비어있으면 복구
    if (yComponents.length === 0) {
      console.log("🔗 Y.js 연결 완료, 복구 시작...");
      hasRestoredRef.current = true;
      restoreFromDatabase(roomId, yComponents);
    } else {
      console.log("🔗 Y.js 연결 완료, 기존 데이터 있음:", yComponents.length, "개 컴포넌트");
      console.log("기존 컴포넌트 ID들:", yComponents.toArray().map(c => c.id));
      // 이미 데이터가 있으면 복구하지 않음
      hasRestoredRef.current = true;
    }
    }, 1000); // 1초 후 복구 시도
  }, [ydoc, roomId]);

  // 선택된 컴포넌트 변화를 Awareness에 반영
  useEffect(() => {
    if (selectedComponentId) {
      updateSelection([selectedComponentId], viewport);
    } else {
      updateSelection([], viewport);
    }
  }, [selectedComponentId, updateSelection, viewport]);

  // 컴포넌트 업데이트 함수 (Y.js 동기화)
  const updateComponent = (componentId, updates) => {
    if (!componentsArrayRef.current) {
      console.warn('Y.js 배열이 초기화되지 않음');
      return;
    }

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    
    const componentIndex = components.findIndex(c => c.id === componentId);

    if (componentIndex !== -1) {
      const existingComponent = components[componentIndex];
      
      // 업데이트할 속성만 병합
      const updatedComponent = { 
        ...existingComponent, 
        ...updates,
        // ID는 변경하지 않음 (고유성 유지)
        id: existingComponent.id
      };
      
      // console.log('Y.js 컴포넌트 업데이트:', componentId, '변경사항:', updates);
      // console.log('기존 컴포넌트:', existingComponent);
      // console.log('업데이트된 컴포넌트:', updatedComponent);
      
      try {
        // 트랜잭션으로 안전하게 업데이트
        ydoc && ydoc.transact(() => {
          yComponents.delete(componentIndex, 1);
          yComponents.insert(componentIndex, [updatedComponent]);
        });
        // console.log('Y.js 업데이트 성공');
      } catch (error) {
        // console.error('Y.js 업데이트 실패:', error);
      }
    } else {
      // console.warn('업데이트할 컴포넌트를 Y.js에서 찾을 수 없음:', componentId);
      // console.log('Y.js에 있는 컴포넌트들:', components);
      
      // 컴포넌트가 Y.js에 없으면 추가 시도
      const componentToAdd = { ...updates, id: componentId };
      addComponent(componentToAdd);
    }
  };

  // 컴포넌트 추가 함수
  const addComponent = (component) => {
    // 이미 ID가 있으면 유지, 없으면 새로 생성
    const componentWithId = component.id ? component : {
      ...component,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${userInfo && userInfo.id || anonymous}`
    };
    
    componentsArrayRef.current.push([componentWithId]);
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
    
    // 각 컴포넌트에 고유한 ID가 있는지 확인하고, 없으면 생성
    const componentsWithUniqueIds = newComponents.map(component => {
      if (!component.id) {
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${userInfo && userInfo.id || anonymous}`;
        return { ...component, id: uniqueId };
      }
      return component;
    });
    
    // 트랜잭션으로 묶어서 한 번에 업데이트
    ydoc && ydoc.transact(() => {
      yComponents.delete(0, yComponents.length);
      yComponents.insert(0, componentsWithUniqueIds);
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