import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 접속 순서 기반 마스터 시스템 (연결 안정화 개선)
 * 1. 가장 먼저 접속한 사람(방 생성자)이 마스터
 * 2. 마스터가 나가면 그 다음 접속한 사람이 마스터
 * 3. 연결 안정화 후 마스터 결정
 */
export function useMasterSystem(awareness, userInfo) {
  const [isMaster, setIsMaster] = useState(false);
  const [masterUserId, setMasterUserId] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  const isInitializedRef = useRef(false);
  const checkTimeoutRef = useRef(null);
  const joinTimeRef = useRef(null);

  // 마스터 결정 로직 (접속 시간 기준)
  const determineMaster = useCallback(() => {
    if (!awareness || !userInfo) return;

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      try {
        const states = awareness.getStates();
        
        // 모든 사용자 수집 (중복 제거 + 접속 시간 포함)
        const userMap = new Map();
        
        states.forEach((state, clientId) => {
          if (state.user && state.user.id) {
            const userId = state.user.id;
            const existingUser = userMap.get(userId);
            
            // joinTime이 없는 경우 현재 시간으로 설정
            const joinTime = state.user.joinTime || Date.now();
            
            // 같은 사용자가 여러 클라이언트에 있으면 가장 이른 접속 시간 사용
            if (!existingUser || joinTime < existingUser.joinTime) {
              userMap.set(userId, {
                userId: userId,
                userName: state.user.name || userId,
                joinTime: joinTime,
                clientId: clientId,
                joinTimeFormatted: new Date(joinTime).toLocaleString(),
                hasOriginalJoinTime: !!state.user.joinTime
              });
            }
          }
        });

        const uniqueUsers = Array.from(userMap.values());

        // 접속 시간 순으로 정렬 (가장 이른 시간이 첫 번째)
        uniqueUsers.sort((a, b) => a.joinTime - b.joinTime);
        
        setConnectedUsers(uniqueUsers);

        if (uniqueUsers.length === 0) {
          return;
        }

        // 기존 글로벌 마스터 상태 확인 (중복 정리 포함)
        let currentGlobalMaster = null;
        let globalMasterStates = [];
        
        states.forEach((state, clientId) => {
          if (state.globalMasterState && state.globalMasterState.masterId) {
            globalMasterStates.push({
              clientId,
              masterState: state.globalMasterState
            });
          }
        });

        // 중복된 글로벌 마스터 상태가 있으면 가장 최신 것 사용
        if (globalMasterStates.length > 0) {
          // 선출 시간 기준으로 가장 최신 상태 선택
          globalMasterStates.sort((a, b) => b.masterState.electedAt - a.masterState.electedAt);
          currentGlobalMaster = globalMasterStates[0].masterState;
        }

        // 마스터 결정 로직 (접속 순서 우선)
        const shouldBeMaster = uniqueUsers[0]; // 가장 먼저 접속한 사용자
        let finalMasterId;
        let shouldUpdateGlobalState = false;

        if (currentGlobalMaster) {
          // 기존 마스터가 여전히 연결되어 있는지 확인
          const masterStillExists = uniqueUsers.find(u => String(u.userId) === String(currentGlobalMaster.masterId));
          
          if (masterStillExists) {
            // 기존 마스터가 실제로 가장 먼저 접속한 사용자인지 확인
            if (String(currentGlobalMaster.masterId) === String(shouldBeMaster.userId)) {
              finalMasterId = currentGlobalMaster.masterId;
            } else {
              // 접속 순서와 다르면 올바른 마스터로 교체
              finalMasterId = shouldBeMaster.userId;
              shouldUpdateGlobalState = (shouldBeMaster.userId === userInfo.id);
            }
          } else {
            // 기존 마스터가 나갔으므로 새 마스터 선정
            finalMasterId = shouldBeMaster.userId;
            shouldUpdateGlobalState = (shouldBeMaster.userId === userInfo.id);
          }
        } else {
          // 글로벌 마스터가 없으므로 새로 선정
          finalMasterId = shouldBeMaster.userId;
          shouldUpdateGlobalState = (shouldBeMaster.userId === userInfo.id);
        }

        // 글로벌 마스터 상태 업데이트 (중복 정리 포함)
        if (shouldUpdateGlobalState) {
          const masterUser = uniqueUsers.find(u => u.userId === finalMasterId);
          
          // 새로운 글로벌 마스터 상태 설정
          const newGlobalMasterState = {
            masterId: finalMasterId,
            masterName: masterUser.userName,
            electedAt: Date.now(),
            totalUsers: uniqueUsers.length,
            electedBy: userInfo.id,
            version: Date.now() // 버전 관리
          };
          
          awareness.setLocalStateField('globalMasterState', newGlobalMasterState);
          
          // 다른 클라이언트들의 중복 글로벌 상태 정리 요청
          setTimeout(() => {
            awareness.setLocalStateField('cleanupRequest', {
              timestamp: Date.now(),
              requestedBy: userInfo.id
            });
          }, 100);
        }

        // 중복 글로벌 상태 정리 (다른 클라이언트가 요청한 경우)
        const currentState = awareness.getLocalState();
        if (currentState.cleanupRequest && 
            currentState.cleanupRequest.requestedBy !== userInfo.id &&
            currentState.globalMasterState &&
            !shouldUpdateGlobalState) {
          
          awareness.setLocalStateField('globalMasterState', null);
          awareness.setLocalStateField('cleanupRequest', null);
        }

        const masterUser = uniqueUsers.find(u => u.userId === finalMasterId);

        // 상태 업데이트
        setMasterUserId(finalMasterId);
        const amIMaster = String(finalMasterId) === String(userInfo.id);
        setIsMaster(amIMaster);

        // 핵심 로그만 유지
        if (amIMaster) {
          console.log(`👑 마스터 권한: ${userInfo.name}`);
        }

      } catch (error) {
        console.error('❌ 마스터 결정 오류:', error);
      }
    }, 500);

  }, [awareness, userInfo]);

  // 연결 안정화 확인 함수
  const waitForStableConnection = useCallback(() => {
    return new Promise((resolve) => {
      let checkCount = 0;
      const maxChecks = 6;
      let lastUserCount = 0;
      let stableCount = 0;

      const checkStability = () => {
        if (!awareness) {
          resolve();
          return;
        }

        const states = awareness.getStates();
        const currentUserCount = states.size;

        // 사용자 수가 변하지 않으면 안정화 카운트 증가
        if (currentUserCount === lastUserCount && currentUserCount > 0) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        lastUserCount = currentUserCount;
        checkCount++;

        // 2번 연속 안정적이거나 최대 체크 횟수 도달 시 완료
        if (stableCount >= 2 || checkCount >= maxChecks) {
          resolve();
        } else {
          setTimeout(checkStability, 500);
        }
      };

      checkStability();
    });
  }, [awareness]);

  // 즉시 글로벌 마스터 확인 (강화된 버전)
  const checkExistingMaster = useCallback(() => {
    if (!awareness) return null;

    const states = awareness.getStates();
    let existingGlobalMaster = null;
    let connectedUserCount = 0;

    // 모든 상태 확인
    states.forEach((state) => {
      if (state.user && state.user.id) {
        connectedUserCount++;
      }
      if (state.globalMasterState && state.globalMasterState.masterId) {
        existingGlobalMaster = state.globalMasterState;
      }
    });

    if (existingGlobalMaster && connectedUserCount > 1) {
      // 기존 마스터가 여전히 연결되어 있는지 확인
      let masterStillConnected = false;
      states.forEach((state) => {
        if (state.user && String(state.user.id) === String(existingGlobalMaster.masterId)) {
          masterStillConnected = true;
        }
      });

      if (masterStillConnected) {
        // 즉시 로컬 상태 업데이트
        setMasterUserId(existingGlobalMaster.masterId);
        const amIMaster = String(existingGlobalMaster.masterId) === String(userInfo.id);
        setIsMaster(amIMaster);

        return existingGlobalMaster;
      }
    }

    return null;
  }, [awareness, userInfo]);

  // 안정화된 마스터 결정 (더 빠른 최적화)
  const stableDetermineMaster = useCallback(async () => {
    // 먼저 기존 글로벌 마스터 확인 (여러 번 시도)
    let existingMaster = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (!existingMaster && attempts < maxAttempts) {
      existingMaster = checkExistingMaster();
      if (!existingMaster) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      attempts++;
    }
    
    if (existingMaster) {
      return;
    }

    await waitForStableConnection();
    determineMaster();
  }, [checkExistingMaster, waitForStableConnection, determineMaster]);

  // 초기화
  useEffect(() => {
    if (!awareness || !userInfo || isInitializedRef.current) return;

    // 고유한 접속 시간 생성 (밀리초 단위로 정확한 순서 보장)
    if (!joinTimeRef.current) {
      joinTimeRef.current = Date.now() + Math.random(); // 동시 접속 시에도 고유성 보장
    }

    const joinTime = joinTimeRef.current;

    // 사용자 정보를 Awareness에 등록 (접속 시간 포함)
    const userState = {
      id: userInfo.id,
      name: userInfo.name,
      color: userInfo.color,
      joinTime: joinTime,
      sessionId: `${userInfo.id}-${joinTime}`,
      registeredAt: Date.now()
    };
    
    // 기존 사용자 정보가 있다면 보존하면서 업데이트
    const currentUserState = awareness.getLocalState().user || {};
    const finalUserState = {
      ...currentUserState,
      ...userState,
      joinTime: currentUserState.joinTime || userState.joinTime
    };
    
    awareness.setLocalStateField('user', finalUserState);

    isInitializedRef.current = true;

    // 초기 마스터 결정
    setTimeout(() => {
      stableDetermineMaster();
    }, 300);

    // Awareness 변경 감지
    const handleAwarenessChange = (changes) => {
      // 사용자 추가/제거 시에만 마스터 재결정
      if (changes.added.length > 0 || changes.removed.length > 0) {
        determineMaster();
      }
    };

    awareness.on('change', handleAwarenessChange);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      awareness.off('change', handleAwarenessChange);
      
      // 마스터였다면 글로벌 상태 정리
      if (isMaster) {
        awareness.setLocalStateField('globalMasterState', null);
      }
    };
  }, [awareness, userInfo, stableDetermineMaster, determineMaster, checkExistingMaster]);

  // 접속 순서 정보 제공하는 유틸리티 함수들
  const getJoinOrder = useCallback((userId) => {
    const userIndex = connectedUsers.findIndex(u => String(u.userId) === String(userId));
    return userIndex >= 0 ? userIndex + 1 : null;
  }, [connectedUsers]);

  const getNextMaster = useCallback(() => {
    if (connectedUsers.length <= 1) return null;
    return connectedUsers[1]; // 두 번째로 접속한 사용자
  }, [connectedUsers]);

  return { 
    isMaster, 
    masterUserId, 
    connectedUsers,
    totalUsers: connectedUsers.length,
    
    // 유틸리티 함수들
    isUserMaster: (userId) => String(userId) === String(masterUserId),
    getMasterName: () => connectedUsers.find(u => String(u.userId) === String(masterUserId))?.userName,
    getJoinOrder, // 사용자의 접속 순서 반환
    getNextMaster, // 다음 마스터가 될 사용자 정보
    
    // 접속 순서 정보
    masterJoinOrder: connectedUsers.length > 0 ? 1 : null,
    myJoinOrder: getJoinOrder(userInfo?.id)
  };
}

export default useMasterSystem;
