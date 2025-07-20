// frontend/src/hooks/useYjsCollaboration.js

import { useEffect, useState, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { addUserColor } from '../utils/userColors';
import { YJS_WEBSOCKET_URL } from '../config';

// 연결 설정 상수
const CONNECTION_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 3,
  HEARTBEAT_INTERVAL: 30000, // 30초마다 하트비트
  INACTIVITY_TIMEOUT: 300000, // 5분 비활성 시 연결 재확인 (테스트용)
  RECONNECT_DELAY: 5000, // 재연결 시도 간격
};

export function useYjsCollaboration(roomId, userInfo) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS;
  
  // 연결 상태 추적을 위한 ref들
  const isInitializedRef = useRef(false);
  const currentRoomIdRef = useRef(null);
  const currentUserInfoRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // 사용자 활동 감지 함수 - 다른 훅에서 호출 가능
  const updateActivity = useCallback(() => {
    const previousTime = lastActivityRef.current;
    lastActivityRef.current = Date.now();
    const timeDiff = lastActivityRef.current - previousTime;
    console.log(`🔄 사용자 활동 감지, 활동 시간 업데이트 (${timeDiff}ms 경과)`);
  }, []);

  // 연결 정리 함수 (실제 정리가 필요한 경우에만 호출)
  const cleanupConnection = useCallback(() => {
    console.log('🧹 Y.js 연결 정리 시작');
    try {
      // 하트비트 인터벌 정리
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (awarenessRef.current) {
        awarenessRef.current.destroy();
        awarenessRef.current = null;
      }
      
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      
      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
      
      isInitializedRef.current = false;
      console.log('✅ Y.js 연결 정리 완료');
    } catch (error) {
      console.error('❌ Y.js 연결 정리 오류:', error);
    }
  }, []);

  // 재연결 시도 함수
  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('🛑 최대 재연결 시도 횟수 초과');
      setIsLocalMode(true);
      return;
    }

    reconnectAttemptsRef.current++;
    console.log(`🔄 재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
    
    if (providerRef.current) {
      providerRef.current.connect();
    }
  }, [maxReconnectAttempts]);

  // 하트비트 메커니즘으로 연결 상태 유지
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (awarenessRef.current && isConnected) {
        // 마지막 활동 시간 업데이트
        lastActivityRef.current = Date.now();
        
        // 연결 상태 확인을 위한 ping 메시지
        awarenessRef.current.setLocalStateField('heartbeat', {
          timestamp: Date.now(),
          userId: currentUserInfoRef.current?.id
        });
      }
    }, CONNECTION_CONFIG.HEARTBEAT_INTERVAL);
  }, [isConnected]);

  // 연결 상태 검증
  const validateConnection = useCallback(() => {
    if (!providerRef.current || !isConnected) {
      console.log('❌ 연결 검증 실패: provider 또는 연결 상태 없음');
      return false;
    }

    // 마지막 활동으로부터 설정된 시간 이상 지났으면 연결 재확인
    const timeSinceLastActivity = Date.now() - lastActivityRef.current;
    const timeoutSeconds = CONNECTION_CONFIG.INACTIVITY_TIMEOUT / 1000;
    
    console.log(`🔍 연결 상태 검증: 마지막 활동으로부터 ${Math.round(timeSinceLastActivity / 1000)}초 경과 (타임아웃: ${timeoutSeconds}초)`);
    
    if (timeSinceLastActivity > CONNECTION_CONFIG.INACTIVITY_TIMEOUT) {
      console.log(`⚠️ 연결 상태 검증: ${timeoutSeconds}초간 활동 없음, 연결 재확인 필요`);
      return false;
    }

    console.log('✅ 연결 상태 검증: 유효한 연결 유지');
    return true;
  }, [isConnected]);

  // 연결 초기화 함수
  const initializeConnection = useCallback((roomId, userInfo) => {
    // 기본값 보장
    const safeRoomId = roomId || 'default-room';
    const safeUserInfo = userInfo || { id: 'anonymous', name: 'Anonymous', color: '#000000' };

    console.log('🔄 연결 초기화 시작:', {
      roomId: safeRoomId,
      userId: safeUserInfo.id,
      isInitialized: isInitializedRef.current,
      currentRoomId: currentRoomIdRef.current,
      currentUserId: currentUserInfoRef.current?.id,
      isConnected
    });

    // 이미 같은 룸에 연결되어 있고 연결이 유효하다면 재연결하지 않음
    if (isInitializedRef.current && 
        currentRoomIdRef.current === safeRoomId && 
        currentUserInfoRef.current?.id === safeUserInfo.id) {
      
      console.log('🔍 기존 연결 상태 확인 중...');
      const isValid = validateConnection();
      
      if (isValid) {
        console.log('✅ 이미 같은 룸에 유효한 연결이 있음, 재연결 건너뜀');
        return;
      } else {
        console.log('⚠️ 기존 연결이 유효하지 않음, 재연결 필요');
      }
    }

    // 룸이나 사용자가 변경된 경우에만 기존 연결 정리
    if (isInitializedRef.current) {
      console.log('🔄 룸 또는 사용자 변경 감지, 기존 연결 정리');
      cleanupConnection();
    }

    reconnectAttemptsRef.current = 0;

    // Y.Doc 인스턴스 생성
    const ydoc = new Y.Doc();

    // JWT 토큰 가져오기
    const token = localStorage.getItem('token');

    // 일관된 방 이름 형식 사용
    const roomName = `page:${safeRoomId}`;

    // 환경에 따른 WebSocket URL 설정
    const wsUrl = YJS_WEBSOCKET_URL;

    console.log('🔄 Y.js 서버 연결 시도:', {
      wsUrl,
      roomName,
      YJS_WEBSOCKET_URL,
      currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
    });

    // WebsocketProvider 초기화
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
      connect: true,
      auth: {
        token: token,
      },
      maxBackoffTime: CONNECTION_CONFIG.RECONNECT_DELAY,
      resyncInterval: CONNECTION_CONFIG.RECONNECT_DELAY,
      params: {
        pageId: safeRoomId,
        userId: safeUserInfo.id,
      },
    });

    // Awareness 인스턴스
    const awareness = provider.awareness;

    // 연결 상태 모니터링 (최적화됨)
    provider.on('status', (event) => {
      console.log('📡 Y.js 연결 상태 변경:', event.status);
      
      if (event.status === 'connected') {
        setIsConnected(true);
        setConnectionError(null);
        setIsLocalMode(false);
        reconnectAttemptsRef.current = 0; // 연결 성공 시 재시도 횟수 리셋
        
        // 사용자 정보 설정
        const userWithColor = addUserColor(safeUserInfo);
        awareness.setLocalStateField('user', {
          name: userWithColor.name,
          color: userWithColor.color,
          id: userWithColor.id,
        });
        
        // 하트비트 시작
        startHeartbeat();
        
        console.log('✅ Y.js 연결 성공');
      } else if (event.status === 'disconnected') {
        setIsConnected(false);
        console.log('❌ Y.js 연결 해제됨');
      } else if (event.status === 'connecting') {
        console.log('🔄 Y.js 연결 시도 중...');
      }
    });

    // 연결 오류 처리 (최적화됨)
    provider.on('connection-error', (error) => {
      console.error('❌ WebSocket 연결 오류:', error);
      setConnectionError(error);
      setIsLocalMode(true);
      
      // 재연결 시도
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(attemptReconnect, CONNECTION_CONFIG.RECONNECT_DELAY);
    });

    // 연결 종료 처리
    provider.on('connection-close', () => {
      setIsConnected(false);
      console.log('🔌 Y.js 연결 종료됨');
    });

    // 동기화 상태 모니터링 (로깅 최소화)
    provider.on('sync', (isSynced) => {
      if (!isSynced) {
        console.log('🔄 Y.js 동기화 진행중...');
      } else {
        console.log('✅ Y.js 동기화 완료');
      }
    });

    // 참조 저장
    ydocRef.current = ydoc;
    providerRef.current = provider;
    awarenessRef.current = awareness;
    
    // 현재 상태 저장
    currentRoomIdRef.current = safeRoomId;
    currentUserInfoRef.current = safeUserInfo;
    isInitializedRef.current = true;
    lastActivityRef.current = Date.now();
    
    console.log('✅ 연결 초기화 완료');
  }, []); // 의존성 제거하여 함수 재생성 방지

  // 메인 useEffect - 룸 ID나 사용자 정보가 변경될 때만 실행
  useEffect(() => {
    console.log('🔄 useYjsCollaboration useEffect 실행:', {
      roomId,
      userId: userInfo?.id,
      hasRoomId: !!roomId,
      hasUserInfo: !!userInfo
    });

    if (!roomId || !userInfo) {
      console.log('⚠️ roomId 또는 userInfo가 없어 연결 초기화 건너뜀');
      return;
    }

    initializeConnection(roomId, userInfo);
  }, [roomId, userInfo?.id]); // initializeConnection 의존성 제거

  // 컴포넌트 언마운트 시에만 정리
  useEffect(() => {
    return () => {
      console.log('🔄 컴포넌트 언마운트, Y.js 연결 정리');
      cleanupConnection();
    };
  }, [cleanupConnection]);

  // 페이지 포커스/블러 시 연결 상태 확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isInitializedRef.current && !isConnected) {
        console.log('🔄 페이지 포커스, 연결 상태 확인');
        if (providerRef.current) {
          providerRef.current.connect();
        }
      }
    };

    const handleOnline = () => {
      if (isInitializedRef.current && !isConnected) {
        console.log('🔄 네트워크 복구, 연결 재시도');
        reconnectAttemptsRef.current = 0;
        if (providerRef.current) {
          providerRef.current.connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [isConnected]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: awarenessRef.current,
    isConnected,
    connectionError,
    isLocalMode,
    updateActivity, // 사용자 활동 업데이트 함수 export
  };
}
