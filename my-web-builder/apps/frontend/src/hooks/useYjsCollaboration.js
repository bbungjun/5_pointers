// frontend/src/hooks/useYjsCollaboration.js

import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { addUserColor } from '../utils/userColors';
import { YJS_WEBSOCKET_URL } from '../config';

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
    
    // 환경에 따른 WebSocket URL 설정
    const wsUrl = YJS_WEBSOCKET_URL;
    
    console.log('Y.js 서버 연결 시도:', wsUrl, 'Room:', roomName, 'User:', userInfo);
    
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

    // 연결 상태 모니터링
    provider.on('status', (event) => {
      console.log('WebSocket 연결 상태:', event.status);
      setIsConnected(event.status === 'connected');
      
      // 연결 완료 후 사용자 정보 설정
      if (event.status === 'connected') {
        // 사용자 정보에 고유 색상 추가
        const userWithColor = addUserColor(userInfo);
        console.log('연결 완료, 사용자 정보 설정:', userWithColor);
        awareness.setLocalStateField('user', {
          name: userWithColor.name,
          color: userWithColor.color,
          id: userWithColor.id
        });
      }
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

    // Awareness 변화 감지 (디버깅용)
    // awareness.on('change', (event) => {
    //   console.log('Awareness 변화 감지:', {
    //     added: event.added,
    //     updated: event.updated,
    //     removed: event.removed,
    //     states: awareness.getStates()
    //   });
    // });

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
