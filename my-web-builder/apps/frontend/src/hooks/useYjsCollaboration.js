// frontend/src/hooks/useYjsCollaboration.js

import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export function useYjsCollaboration(roomId, userInfo) {
  const [isConnected, setIsConnected] = useState(false);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userInfo) return;

    // Y.Doc 인스턴스 생성
    const ydoc = new Y.Doc();
    
    // JWT 토큰 가져오기
    const token = localStorage.getItem('token');
    
    // 일관된 방 이름 형식 사용 (중요: 페이지 ID만 사용, 사용자 정보 사용 안 함)
    const roomName = `page:${roomId}`;
    const wsUrl = 'ws://localhost:1234'; // Y.js WebSocket 서버 URL
    
    console.log('Y.js 서버 연결 시도:', wsUrl, 'Room:', roomName);
    
    // WebsocketProvider 초기화 - auth 필드에 토큰 전달 (핵심 수정사항)
    const provider = new WebsocketProvider(
      wsUrl,
      roomName,
      ydoc,
      {
        connect: true,
        // auth 필드에 JWT 토큰 전달
        auth: {
          token: token
        },
        // 연결 설정
        maxBackoffTime: 2000,
        resyncInterval: 3000,
        // 디버깅용 추가 파라미터
        params: { 
          pageId: roomId,
          userId: userInfo.id
        }
      }
    );

    // Awareness 인스턴스 - 커서 및 선택 상태 공유
    const awareness = provider.awareness;

    // Awareness에 사용자 정보 설정
    awareness.setLocalStateField('user', {
      name: userInfo.name,
      color: userInfo.color,
      id: userInfo.id
    });

    // 연결 상태 모니터링
    provider.on('status', (event) => {
      console.log('WebSocket 연결 상태:', event.status);
      setIsConnected(event.status === 'connected');
    });

    // 연결 오류 처리
    provider.on('connection-error', (error) => {
      console.error('WebSocket 연결 오류:', error);
    });

    // 동기화 상태 모니터링
    provider.on('sync', (isSynced) => {
      console.log('Y.js 동기화 상태:', isSynced ? '완료' : '진행중');
    });

    // 원격 업데이트 감지
    ydoc.on('update', (update, origin) => {
      console.log('Y.js 문서 업데이트 받음:', origin === provider ? '원격' : '로컬');
    });

    // 참조 저장
    ydocRef.current = ydoc;
    providerRef.current = provider;
    awarenessRef.current = awareness;

    // 정리 함수
    return () => {
      console.log('Y.js 연결 종료 시작');
      try {
        awareness.destroy();
        provider.destroy();
        ydoc.destroy();
        console.log('Y.js 연결 종료 완료');
      } catch (error) {
        console.error('Y.js 연결 종료 오류:', error);
      }
    };
  }, [roomId, userInfo]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: awarenessRef.current,
    isConnected
  };
}
