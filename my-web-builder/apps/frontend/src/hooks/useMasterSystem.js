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
        
        console.log('🔍 마스터 결정 시작 (접속 순서 기준):', {
          총States: states.size,
          현재사용자: userInfo.name
        });

        // 모든 사용자 수집 (중복 제거 + 접속 시간 포함)
        const userMap = new Map();
        
        console.log('🔍 States 상세 분석:');
        states.forEach((state, clientId) => {
          console.log(`📱 클라이언트 ${clientId}:`, {
            hasUser: !!state.user,
            userId: state.user?.id,
            userName: state.user?.name,
            hasJoinTime: !!state.user?.joinTime,
            joinTime: state.user?.joinTime,
            joinTimeFormatted: state.user?.joinTime ? new Date(state.user.joinTime).toLocaleString() : 'N/A',
            allUserKeys: state.user ? Object.keys(state.user) : []
          });
          
          if (state.user && state.user.id) {
            const userId = state.user.id;
            const existingUser = userMap.get(userId);
            
            // joinTime이 없는 경우 현재 시간으로 설정 (임시 해결책)
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
        
        console.log('🔍 수집된 사용자 데이터:', uniqueUsers.map(u => ({
          이름: u.userName,
          ID: u.userId,
          접속시간: u.joinTimeFormatted,
          원본joinTime있음: u.hasOriginalJoinTime
        })));

        // 접속 시간 순으로 정렬 (가장 이른 시간이 첫 번째)
        uniqueUsers.sort((a, b) => a.joinTime - b.joinTime);
        
        setConnectedUsers(uniqueUsers);

        console.log('👥 접속 순서별 사용자 목록:', uniqueUsers.map((u, index) => ({
          순서: index + 1,
          이름: u.userName,
          ID: u.userId,
          접속시간: u.joinTimeFormatted,
          원본시간: u.joinTime
        })));

        if (uniqueUsers.length === 0) {
          console.log('⚠️ 연결된 사용자가 없습니다.');
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

        console.log('🔍 글로벌 마스터 상태들:', globalMasterStates.map(gms => ({
          클라이언트: gms.clientId,
          마스터ID: gms.masterState.masterId,
          마스터이름: gms.masterState.masterName,
          선출시간: new Date(gms.masterState.electedAt).toLocaleTimeString()
        })));

        // 중복된 글로벌 마스터 상태가 있으면 가장 최신 것 사용
        if (globalMasterStates.length > 0) {
          // 선출 시간 기준으로 가장 최신 상태 선택
          globalMasterStates.sort((a, b) => b.masterState.electedAt - a.masterState.electedAt);
          currentGlobalMaster = globalMasterStates[0].masterState;
          
          console.log('📋 선택된 글로벌 마스터:', {
            마스터: currentGlobalMaster.masterName,
            마스터ID: currentGlobalMaster.masterId,
            선출시간: new Date(currentGlobalMaster.electedAt).toLocaleTimeString(),
            총상태수: globalMasterStates.length
          });
        }

        // 마스터 결정 로직 (접속 순서 우선) - 단순화
        const shouldBeMaster = uniqueUsers[0]; // 가장 먼저 접속한 사용자
        const finalMasterId = shouldBeMaster.userId;
        const shouldUpdateGlobalState = (shouldBeMaster.userId === userInfo.id);
        const masterDecisionReason = `접속 순서 기준 마스터 선정 (${shouldBeMaster.userName})`;

        console.log('🎯 마스터 결정 이유:', masterDecisionReason);

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
          
          console.log('📢 글로벌 마스터 상태 업데이트:', {
            마스터: masterUser.userName,
            총사용자: uniqueUsers.length,
            업데이트자: userInfo.name,
            버전: newGlobalMasterState.version
          });
          
          // 다른 클라이언트들의 중복 글로벌 상태 정리 요청
          setTimeout(() => {
            console.log('🧹 중복 글로벌 상태 정리 요청');
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
          
          console.log('🧹 중복 글로벌 상태 정리 실행');
          awareness.setLocalStateField('globalMasterState', null);
          awareness.setLocalStateField('cleanupRequest', null);
        }

        const masterUser = uniqueUsers.find(u => u.userId === finalMasterId);

        console.log('👑 마스터 결정 (접속 순서 기준):', {
          마스터: masterUser.userName,
          마스터ID: finalMasterId,
          접속시간: masterUser.joinTimeFormatted,
          총사용자수: uniqueUsers.length,
          마스터순서: '1번째 접속자'
        });

        // 상태 업데이트
        setMasterUserId(finalMasterId);
        const amIMaster = String(finalMasterId) === String(userInfo.id);
        setIsMaster(amIMaster);

        if (amIMaster) {
          const myOrder = uniqueUsers.findIndex(u => String(u.userId) === String(userInfo.id)) + 1;
          console.log(`👑 마스터 권한 획득: ${userInfo.name} (${myOrder}번째 접속자)`);
        } else {
          const myOrder = uniqueUsers.findIndex(u => String(u.userId) === String(userInfo.id)) + 1;
          console.log(`👤 일반 사용자: ${userInfo.name} (${myOrder}번째 접속자, 마스터: ${masterUser.userName})`);
        }

      } catch (error) {
        console.error('❌ 마스터 결정 중 오류:', error);
      }
    }, 500);

  }, [awareness, userInfo]);

  // 연결 안정화 확인 함수
  const waitForStableConnection = useCallback(() => {
    return new Promise((resolve) => {
      let checkCount = 0;
      const maxChecks = 6; // 최대 3초 대기 (500ms × 6)
      let lastUserCount = 0;
      let stableCount = 0;

      const checkStability = () => {
        if (!awareness) {
          resolve();
          return;
        }

        const states = awareness.getStates();
        const currentUserCount = states.size;

        console.log(`🔍 연결 안정성 확인 ${checkCount + 1}/${maxChecks}:`, {
          현재사용자수: currentUserCount,
          이전사용자수: lastUserCount,
          안정화카운트: stableCount
        });

        // 사용자 수가 변하지 않으면 안정화 카운트 증가
        if (currentUserCount === lastUserCount && currentUserCount > 0) {
          stableCount++;
        } else {
          stableCount = 0; // 변화가 있으면 리셋
        }

        lastUserCount = currentUserCount;
        checkCount++;

        // 2번 연속 안정적이거나 최대 체크 횟수 도달 시 완료
        if (stableCount >= 2 || checkCount >= maxChecks) {
          console.log('✅ 연결 안정화 완료:', {
            최종사용자수: currentUserCount,
            안정화여부: stableCount >= 2 ? '안정' : '시간초과'
          });
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

    console.log('🔍 글로벌 마스터 상태 확인:', {
      연결된사용자수: connectedUserCount,
      글로벌마스터있음: !!existingGlobalMaster,
      글로벌마스터정보: existingGlobalMaster
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
        console.log('⚡ 유효한 글로벌 마스터 발견:', {
          마스터: existingGlobalMaster.masterName,
          마스터ID: existingGlobalMaster.masterId,
          현재사용자: userInfo.name,
          현재사용자ID: userInfo.id,
          마스터여전히연결됨: masterStillConnected
        });

        // 즉시 로컬 상태 업데이트
        setMasterUserId(existingGlobalMaster.masterId);
        const amIMaster = String(existingGlobalMaster.masterId) === String(userInfo.id);
        setIsMaster(amIMaster);

        if (amIMaster) {
          console.log('👑 기존 마스터 권한 즉시 복구:', userInfo.name);
        } else {
          console.log('👤 즉시 일반 사용자 설정:', userInfo.name, '(마스터:', existingGlobalMaster.masterName, ')');
        }

        return existingGlobalMaster;
      } else {
        console.log('⚠️ 글로벌 마스터가 연결되어 있지 않음 - 새 마스터 선출 필요');
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
        console.log(`🔄 글로벌 마스터 확인 재시도 ${attempts + 1}/${maxAttempts}`);
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms 대기
      }
      attempts++;
    }
    
    if (existingMaster) {
      console.log('⚡ 기존 마스터 확인 완료 - 안정화 생략');
      return;
    }

    console.log('⏳ 기존 마스터 없음 - 연결 안정화 시작');
    await waitForStableConnection();
    console.log('🎯 안정화 완료 - 마스터 결정 시작');
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
      joinTime: joinTime, // 핵심: 접속 시간 저장
      sessionId: `${userInfo.id}-${joinTime}`, // 세션 고유성 보장
      registeredAt: Date.now()
    };

    // 기존 사용자 정보가 있다면 보존하면서 업데이트 (단, joinTime은 항상 새로 설정)
    const currentUserState = awareness.getLocalState().user || {};
    const finalUserState = {
      ...currentUserState,
      ...userState,
      joinTime: userState.joinTime // joinTime을 항상 새로 설정 (기존 보존 로직 제거)
    };
    
    awareness.setLocalStateField('user', finalUserState);



    isInitializedRef.current = true;

    // 초기 마스터 결정 (최적화된 방식)
    setTimeout(() => {
      stableDetermineMaster();
    }, 300); // 300ms로 단축 (기존 글로벌 마스터 확인 우선)

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
        console.log('🚪 마스터 퇴장 - 글로벌 상태 정리:', userInfo.name);
        awareness.setLocalStateField('globalMasterState', null);
      }
      
      console.log('🚪 마스터 시스템 정리:', userInfo.name);
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
