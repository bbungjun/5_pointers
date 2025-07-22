import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useYjsCollaboration } from './useYjsCollaboration';
import { useLiveCursors } from './useLiveCursors';
import { useChat } from './useChat';
import { useMasterSystem } from './useMasterSystem';
import { API_BASE_URL } from '../config';

/**
 * 성능 최적화된 통합 협업 훅
 * 
 * 최적화 사항:
 * 1. 컴포넌트 업데이트 배치 처리
 * 2. 메모이제이션을 통한 불필요한 리렌더링 방지
 * 3. 중복 처리 방지
 * 4. 메모리 누수 방지
 * 5. 초기 데이터 로드 최적화
 * 6. 모든 사용자에게 즉시 동기화
 */
export function useCollaboration({
  roomId,
  userInfo,
  canvasRef,
  selectedComponentId,
  onComponentsUpdate,
  onCanvasSettingsUpdate,
  viewport = 'desktop',
}) {
  // 기본값 보장 - 모든 매개변수가 안전한 값을 가지도록 보장
  const safeUserInfo = userInfo || { id: 'anonymous', name: 'Anonymous', color: '#000000' };
  const safeRoomId = roomId || 'default-room';
  const safeCanvasRef = canvasRef || { current: null };
  const safeSelectedComponentId = selectedComponentId || null;
  const safeOnComponentsUpdate = onComponentsUpdate || (() => {});
  const safeOnCanvasSettingsUpdate = onCanvasSettingsUpdate || (() => {});
  const safeViewport = viewport || 'desktop';
  
  // Y.js 기본 인프라 설정 (항상 호출)
  const { ydoc, provider, awareness, isConnected, connectionError, updateActivity } = useYjsCollaboration(
    safeRoomId,
    safeUserInfo
  );

  // 라이브 커서 관리 (항상 호출)
  const {
    otherCursors,
    otherSelections,
    updateSelection,
    updateCursorPosition,
  } = useLiveCursors(awareness, safeCanvasRef, updateActivity);

  // 채팅 메시지를 커서에 반영하는 상태
  const [cursorChatMessages, setCursorChatMessages] = useState({});

  // 커서 채팅 업데이트 콜백
  const handleCursorChatUpdate = useCallback((userId, message) => {
    setCursorChatMessages(prev => {
      const newState = {
        ...prev,
        [userId]: message
      };
      return newState;
    });
  }, []);

  // 채팅 관리
  const {
    isChatInputOpen,
    chatInputPosition,
    cursorPosition,
    sendChatMessage,
    openChatInput,
    closeChatInput,
    startTyping,
    stopTyping,
    resetAutoCloseTimer,
  } = useChat(awareness, safeUserInfo, handleCursorChatUpdate);

  // 마스터 시스템 관리
  const {
    isMaster,
    masterUserId,
    connectedUsers,
    totalUsers,
    isUserMaster,
    getMasterName,
    getJoinOrder,
    getNextMaster,
    masterJoinOrder,
    myJoinOrder
  } = useMasterSystem(awareness, safeUserInfo);

  // DB 복구 상태 추적
  const hasRestoredRef = useRef(false);
  const isProcessingRef = useRef(false);
  const batchUpdateRef = useRef(null);
  const initialLoadRef = useRef(false);
  const initialSyncRef = useRef(false);

  // 배치 업데이트 함수
  const batchUpdate = useCallback((components) => {
    if (batchUpdateRef.current) {
      clearTimeout(batchUpdateRef.current);
    }
    
    batchUpdateRef.current = setTimeout(() => {
      safeOnComponentsUpdate(components);
      batchUpdateRef.current = null;
    }, 2); // 500fps로 더 빠른 업데이트
  }, [safeOnComponentsUpdate]);

  // DB에서 복구하는 함수 (최적화됨)
  const restoreFromDatabase = useCallback(async (roomId, yArray) => {
    if (isProcessingRef.current) return false;
    isProcessingRef.current = true;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${roomId}/content`
      );
      if (response.ok) {
        const data = await response.json();

        // content 구조 처리 (템플릿과 페이지 구조 모두 지원)
        let components = [];
        if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
          // 새로운 구조: {components: [], canvasSettings: {}}
          components = data.content.components || [];
        } else if (Array.isArray(data.content)) {
          // 기존 구조: 컴포넌트 배열
          components = data.content;
        } else if (Array.isArray(data.components)) {
          // 대체 구조: data.components
          components = data.components;
        }

        if (components.length > 0) {

          // 기존 ID를 유지하되, 없는 경우에만 새로 생성
          const componentsWithIds = components.map((component) => {
            if (!component.id) {
              const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${safeUserInfo.id}`;
              return { ...component, id: uniqueId };
            }
            return component;
          });

          if (yArray) {
            // Y.js 문서에 직접 삽입
            yArray.insert(0, componentsWithIds);
          } else {
            // 로컬 모드: 즉시 업데이트
            safeOnComponentsUpdate(componentsWithIds);
          }
          return true;
        }
      }
    } catch (error) {
      console.error('DB 복구 실패:', error);
    } finally {
      isProcessingRef.current = false;
    }
    return false;
  }, [safeUserInfo, safeOnComponentsUpdate]);

  // 컴포넌트 데이터 동기화를 위한 Y.Array 설정
  const componentsArrayRef = useRef(null);
  
  // 캔버스 설정 동기화를 위한 Y.Map 설정
  const canvasSettingsRef = useRef(null);

  // 템플릿 전용 강제 동기화 함수
  const forceTemplateSync = useCallback(async () => {
    if (!ydoc || !componentsArrayRef.current) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${safeRoomId}/content`
      );
      
      if (response.ok) {
        const data = await response.json();
        let components = [];
        
        // content 구조 처리
        if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
          components = data.content.components || [];
        } else if (Array.isArray(data.content)) {
          components = data.content;
        } else if (Array.isArray(data.components)) {
          components = data.components;
        }

        if (components.length > 0) {
          const yComponents = componentsArrayRef.current;
          
          // 기존 데이터 완전 초기화 후 새 데이터 삽입
          ydoc.transact(() => {
            yComponents.delete(0, yComponents.length);
            yComponents.insert(0, components);
          });
          
          return true;
        }
      }
    } catch (error) {
      console.error('템플릿 강제 동기화 실패:', error);
    }
    
    return false;
  }, [ydoc, safeRoomId]);

  // 초기 데이터를 Y.js로 동기화하는 함수
  const syncInitialDataToYjs = useCallback(async () => {
    if (!ydoc || !componentsArrayRef.current || initialSyncRef.current) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/room/${safeRoomId}/content`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        let components = [];
        
        // content 구조 처리 (템플릿과 페이지 구조 모두 지원)
        if (data.content && typeof data.content === 'object' && !Array.isArray(data.content)) {
          // 새로운 구조: {components: [], canvasSettings: {}}
          components = data.content.components || [];
        } else if (Array.isArray(data.content)) {
          // 기존 구조: 컴포넌트 배열
          components = data.content;
        } else if (Array.isArray(data.components)) {
          // 대체 구조: data.components
          components = data.components;
        }

        if (components.length > 0) {
          const yComponents = componentsArrayRef.current;
          
          // Y.js 트랜잭션으로 초기 데이터 동기화
          ydoc.transact(() => {
            yComponents.delete(0, yComponents.length);
            yComponents.insert(0, components);
          });
          
          initialSyncRef.current = true;
          
          // 모든 사용자에게 즉시 동기화 완료 알림
          setTimeout(() => {
            const componentsData = yComponents.toArray();
            safeOnComponentsUpdate(componentsData);
          }, 100);
        }
      }
    } catch (error) {
      console.error('초기 데이터 동기화 실패:', error);
    }
  }, [ydoc, safeRoomId, safeOnComponentsUpdate]);

  useEffect(() => {
    if (!ydoc) return;

    // Y.js에서 컴포넌트 데이터를 관리하는 Y.Array 생성
    const yComponents = ydoc.getArray('components');
    if (!yComponents) return;
    componentsArrayRef.current = yComponents;
    
    // Y.js에서 캔버스 설정을 관리하는 Y.Map 생성
    const yCanvasSettings = ydoc.getMap('canvasSettings');
    if (!yCanvasSettings) return;
    canvasSettingsRef.current = yCanvasSettings;

    // 컴포넌트 변화 감지 및 React 상태 업데이트 (최적화됨)
    const handleComponentsChange = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const componentsData = yComponents.toArray();

              // 중복 ID 제거 (같은 ID를 가진 첫 번째 컴포넌트만 유지)
      const uniqueComponents = componentsData.filter((comp, index, arr) => {
        const firstIndex = arr.findIndex((c) => c.id === comp.id);
        return firstIndex === index;
      });

      // 초기 로드 시에는 즉시 업데이트, 이후에는 배치 업데이트
      if (!initialLoadRef.current) {
        safeOnComponentsUpdate(uniqueComponents);
        initialLoadRef.current = true;
      } else {
        batchUpdate(uniqueComponents);
      }
      } catch (error) {
        console.error('컴포넌트 데이터 업데이트 중 오류:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    // 캔버스 설정 변화 감지 및 동기화
    const handleCanvasSettingsChange = () => {
      try {
        const settings = yCanvasSettings.toJSON();
        
        // 빈 객체가 아닐 때만 로그 출력
        if (Object.keys(settings).length > 0) {
        }
        
        // 캔버스 높이 변경사항을 부모 컴포넌트에 알림
        if (settings.canvasHeight !== undefined) {
          // 부모 컴포넌트에서 캔버스 높이를 업데이트할 수 있도록 콜백 호출
          safeOnCanvasSettingsUpdate(settings);
        }
      } catch (error) {
        console.error('캔버스 설정 업데이트 중 오류:', error);
      }
    };

    // 초기 데이터 로드 (즉시 실행) - 중복 방지
    if (!initialLoadRef.current) {
      handleComponentsChange();
      handleCanvasSettingsChange();
    }

    try {
      yComponents.observe(handleComponentsChange);
      yCanvasSettings.observe(handleCanvasSettingsChange);
    } catch (error) {
      console.error('Y.js 리스너 등록 실패:', error);
    }

    return () => {
      try {
        yComponents.unobserve(handleComponentsChange);
        yCanvasSettings.unobserve(handleCanvasSettingsChange);
      } catch (error) {
        console.error('Y.js 리스너 해제 실패:', error);
      }
    };
  }, [ydoc, batchUpdate, safeOnComponentsUpdate, safeOnCanvasSettingsUpdate]);

  // Y.js 연결 완료 후 초기 데이터 동기화
  useEffect(() => {
    if (isConnected && ydoc && !initialSyncRef.current) {
      
      // 연결 완료 후 즉시 기존 데이터 확인
      const yComponents = ydoc.getArray('components');
      if (yComponents && yComponents.length > 0) {
        const componentsData = yComponents.toArray();
        safeOnComponentsUpdate(componentsData);
        initialSyncRef.current = true;
        initialLoadRef.current = true;
      } else {
        // 데이터가 없으면 DB에서 복구
        setTimeout(() => {
          syncInitialDataToYjs();
        }, 100);
      }
    }
  }, [isConnected, ydoc, syncInitialDataToYjs, safeOnComponentsUpdate]);

  // Y.js 연결 상태 모니터링 및 강제 동기화 (개선됨)
  useEffect(() => {
    if (isConnected && ydoc && componentsArrayRef.current) {
      const yComponents = componentsArrayRef.current;
      
      // 연결 완료 후 데이터 상태 확인 및 동기화
      const forceSyncTimer = setTimeout(async () => {
        // 이미 동기화가 완료되었으면 건너뜀
        if (initialSyncRef.current) {
          return;
        }

        if (yComponents.length > 0) {
          const componentsData = yComponents.toArray();
          safeOnComponentsUpdate(componentsData);
          initialSyncRef.current = true;
          initialLoadRef.current = true;
        } else {
          // Y.js에 데이터가 없으면 DB에서 복구 시도
          const synced = await forceTemplateSync();
          if (synced) {
            initialSyncRef.current = true;
            initialLoadRef.current = true;
          }
        }
      }, 200); // 더 빠른 동기화
      
      return () => clearTimeout(forceSyncTimer);
    }
  }, [isConnected, ydoc, safeOnComponentsUpdate, forceTemplateSync]);

  // Y.js 연결 완료 후 복구 처리 (개선됨) - 중복 제거
  // useEffect(() => {
  //   if (!ydoc || hasRestoredRef.current) return;

  //   const yComponents = ydoc.getArray('components');
  //   if (!yComponents) return;

  //   // 연결 완료 후 Y.js 문서가 비어있으면 복구
  //   if (yComponents.length === 0) {
  //     hasRestoredRef.current = true;
  //     restoreFromDatabase(roomId, yComponents);
  //   } else {
  //     // 기존 데이터가 있으면 즉시 로드 (중복 방지)
  //     if (!initialLoadRef.current) {
  //       const componentsData = yComponents.toArray();
  //       safeOnComponentsUpdate(componentsData);
  //     }
      
  //     // 템플릿 시작 시 모든 사용자에게 즉시 동기화 (한 번만)
  //     if (isConnected && !initialSyncRef.current) {
  //       setTimeout(() => {
  //         const currentData = yComponents.toArray();
  //         safeOnComponentsUpdate(currentData);
  //         initialSyncRef.current = true;
  //       }, 200);
  //     }
  //   }
  // }, [ydoc, roomId, restoreFromDatabase, safeOnComponentsUpdate, isConnected]);

  // 연결 오류 시 로컬 모드 활성화
  useEffect(() => {
    if (connectionError) {
      // 로컬 상태에서 컴포넌트 데이터를 유지하기 위해 DB에서 복구 시도
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        restoreFromDatabase(roomId, null);
      }
    }
  }, [connectionError, roomId, restoreFromDatabase]);

  // 드래그 상태 추적 (업데이트 충돌 방지)
  const dragStateRef = useRef(new Set()); // 현재 드래그 중인 컴포넌트 ID들

  // 컴포넌트 업데이트 함수들 (메모이제이션됨, 실시간 동기화 개선)
  const updateComponent = useCallback((componentId, updates) => {
    if (!componentsArrayRef.current) {
      return;
    }

    // 사용자 활동 감지
    updateActivity();

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === componentId);

    if (index !== -1) {
      const updatedComponent = { ...components[index], ...updates };
      
      // Y.js 트랜잭션으로 원자적 업데이트
      ydoc.transact(() => {
        yComponents.delete(index, 1);
        yComponents.insert(index, [updatedComponent]);
      });
    }
  }, [ydoc, updateActivity]);

  // 드래그 상태 관리 함수들
  const setComponentDragging = useCallback((componentId, isDragging) => {
    if (isDragging) {
      dragStateRef.current.add(componentId);
    } else {
      dragStateRef.current.delete(componentId);
    }
    
    // 드래그 활동 감지
    updateActivity();
  }, [updateActivity]);

  const isComponentDragging = useCallback((componentId) => {
    return dragStateRef.current.has(componentId);
  }, []);

  // 컴포넌트 업데이트 함수 (전체 컴포넌트 객체로 업데이트) - 드래그 중에도 동기화 허용
  const updateComponentObject = useCallback((updatedComponent) => {
    if (!componentsArrayRef.current) {
      return;
    }

    // 사용자 활동 감지
    updateActivity();

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === updatedComponent.id);

    if (index !== -1) {
      // Y.js 트랜잭션으로 원자적 업데이트 (드래그 중에도 동기화 허용)
      ydoc.transact(() => {
        yComponents.delete(index, 1);
        yComponents.insert(index, [updatedComponent]);
      });
    }
  }, [ydoc, updateActivity]);

  // 드래그 종료 시 최종 상태 동기화 함수
  const syncComponentAfterDrag = useCallback((componentId) => {
    if (!componentsArrayRef.current || !ydoc) {
      return;
    }

    // 드래그 상태에서 제거
    dragStateRef.current.delete(componentId);
    
    // 컴포넌트 배열에서 해당 컴포넌트 찾기
    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === componentId);

    if (index !== -1) {
      // 최종 상태를 YJS에 동기화
      ydoc.transact(() => {
        // 기존 컴포넌트를 최신 상태로 업데이트
        const currentComponent = components[index];
        yComponents.delete(index, 1);
        yComponents.insert(index, [currentComponent]);
      });
    }
  }, [ydoc]);

  const addComponent = useCallback((component) => {
    if (!componentsArrayRef.current) {
      return;
    }

    // 사용자 활동 감지
    updateActivity();

    const yComponents = componentsArrayRef.current;
    const existingComponents = yComponents.toArray();
    
    // 중복 ID 체크 및 제거
    const existingIndex = existingComponents.findIndex(comp => comp.id === component.id);
    if (existingIndex !== -1) {
      ydoc.transact(() => {
        yComponents.delete(existingIndex, 1);
        yComponents.push([component]);
      });
    } else {
      // Y.js 트랜잭션으로 원자적 추가
      ydoc.transact(() => {
        yComponents.push([component]);
      });
    }
  }, [ydoc, updateActivity]);

  const removeComponent = useCallback((componentId) => {
    if (!componentsArrayRef.current) {
      return;
    }

    // 사용자 활동 감지
    updateActivity();

    const yComponents = componentsArrayRef.current;
    const components = yComponents.toArray();
    const index = components.findIndex((comp) => comp.id === componentId);

    if (index !== -1) {
      // Y.js 트랜잭션으로 원자적 삭제
      ydoc.transact(() => {
        yComponents.delete(index, 1);
      });
    }
  }, [ydoc, updateActivity]);

  const updateAllComponents = useCallback((newComponents) => {
    if (!componentsArrayRef.current) {
      return;
    }

    // 사용자 활동 감지
    updateActivity();

    // 중복 ID 제거 (같은 ID를 가진 첫 번째 컴포넌트만 유지)
    const uniqueComponents = newComponents.filter((comp, index, arr) => {
      const firstIndex = arr.findIndex((c) => c.id === comp.id);
      return firstIndex === index;
    });

    const yComponents = componentsArrayRef.current;
    
    // Y.js 트랜잭션으로 원자적 전체 업데이트
    ydoc.transact(() => {
      yComponents.delete(0, yComponents.length);
      yComponents.insert(0, uniqueComponents);
    });
  }, [ydoc, updateActivity]);

  // 캔버스 설정 업데이트
  const updateCanvasSettings = useCallback((settings) => {
    if (!canvasSettingsRef.current) return;

    const yCanvasSettings = canvasSettingsRef.current;
    ydoc.transact(() => {
      Object.entries(settings).forEach(([key, value]) => {
        yCanvasSettings.set(key, value);
      });
    });
  }, [ydoc]);

  // 활성 사용자 목록 가져오기
  const getActiveUsers = useCallback(() => {
    if (!awareness) return [];

    const states = awareness.getStates();
    const users = [];

    states.forEach((state, clientId) => {
      if (clientId === awareness.clientID) return;
      if (state.user) {
        users.push(state.user);
      }
    });

    return users;
  }, [awareness]);

  // 히스토리 관리 (간단한 구현)
  const undo = useCallback(() => {
    if (ydoc) {
      ydoc.undo();
    }
  }, [ydoc]);

  const redo = useCallback(() => {
    if (ydoc) {
      ydoc.redo();
    }
  }, [ydoc]);

  const getHistory = useCallback(() => {
    return {
      canUndo: ydoc ? ydoc.canUndo() : false,
      canRedo: ydoc ? ydoc.canRedo() : false,
    };
  }, [ydoc]);

  const setHistory = useCallback(() => {
    // Y.js는 자동으로 히스토리를 관리하므로 별도 구현 불필요
  }, []);

  // 메모이제이션된 반환값
  const memoizedReturn = useMemo(() => ({
    otherCursors,
    otherSelections,
    updateCursorPosition,
    updateSelection, // 선택 상태 업데이트 함수 추가
    addComponent,
    updateComponent,
    updateComponentObject,
    removeComponent,
    updateAllComponents,
    updateCanvasSettings, // 캔버스 설정 업데이트 함수 추가
    getActiveUsers,
    undo,
    redo,
    getHistory,
    setHistory,
    forceTemplateSync, // 템플릿 강제 동기화 함수 추가
    setComponentDragging, // 드래그 상태 설정
    isComponentDragging, // 드래그 상태 확인
    syncComponentAfterDrag, // 드래그 종료 후 동기화
    // 채팅 관련 함수들
    isChatInputOpen,
    chatInputPosition,
    cursorPosition,
    sendChatMessage,
    openChatInput,
    closeChatInput,
    startTyping,
    stopTyping,
    resetAutoCloseTimer,
    cursorChatMessages, // 커서 채팅 메시지 추가
    isConnected,
    connectionError,
    ydoc,
    provider,
    isMaster,
    masterUserId,
    connectedUsers,
    totalUsers,
    isUserMaster,
    getMasterName,
    getJoinOrder,
    getNextMaster,
    masterJoinOrder,
    myJoinOrder,
  }), [
    otherCursors,
    otherSelections,
    updateCursorPosition,
    updateSelection, // 선택 상태 업데이트 함수 추가
    addComponent,
    updateComponent,
    updateComponentObject,
    removeComponent,
    updateAllComponents,
    updateCanvasSettings, // 캔버스 설정 업데이트 함수 추가
    getActiveUsers,
    undo,
    redo,
    getHistory,
    setHistory,
    forceTemplateSync,
    setComponentDragging,
    isComponentDragging,
    syncComponentAfterDrag, // 드래그 종료 후 동기화 의존성 추가
    // 채팅 관련 의존성
    isChatInputOpen,
    chatInputPosition,
    cursorPosition,
    sendChatMessage,
    openChatInput,
    closeChatInput,
    startTyping,
    stopTyping,
    resetAutoCloseTimer,
    cursorChatMessages, // 커서 채팅 메시지 의존성 추가
    isConnected,
    connectionError,
    ydoc,
    provider,
    isMaster,
    masterUserId,
    connectedUsers,
    totalUsers,
    isUserMaster,
    getMasterName,
    getJoinOrder,
    getNextMaster,
    masterJoinOrder,
    myJoinOrder,
  ]);

  // 정리 함수
  useEffect(() => {
    return () => {
      if (batchUpdateRef.current) {
        clearTimeout(batchUpdateRef.current);
      }
    };
  }, []);

  return memoizedReturn;
}
