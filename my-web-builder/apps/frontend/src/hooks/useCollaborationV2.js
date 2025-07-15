/**
 * 5Pointers 협업 훅 V2
 * 직접 WebSocket 연결을 사용한 간단한 협업 시스템
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { YJS_WEBSOCKET_URL } from '../config';

console.log('🔧 WebSocket 서버 URL (V2):', YJS_WEBSOCKET_URL);

export function useCollaborationV2(roomId, userInfo, onComponentsChange) {
  // 상태 관리
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [components, setComponents] = useState([]);
  
  // 참조 관리
  const wsRef = useRef(null);
  const isInitializedRef = useRef(false);
  const reconnectTimeoutRef = useRef(null);
  
  // 초기화 함수
  const initializeCollaboration = useCallback(() => {
    if (isInitializedRef.current || !roomId || !userInfo) {
      return;
    }
    
    console.log('🚀 협업 시스템 초기화 시작:', { roomId, userInfo });
    
    try {
      // WebSocket 연결 (config.js의 YJS_WEBSOCKET_URL 사용)
      const wsUrl = `${YJS_WEBSOCKET_URL}/${roomId}`;
      console.log('🔗 WebSocket 연결 시도 (V2):', wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // 연결 성공
      ws.onopen = () => {
        console.log('✅ WebSocket 연결 성공');
        setIsConnected(true);
        setConnectionError(null);
        
        // 사용자 정보 전송
        ws.send(JSON.stringify({
          type: 'user-join',
          user: {
            id: userInfo.id,
            name: userInfo.name || `사용자 ${userInfo.id}`,
            color: userInfo.color || '#' + Math.floor(Math.random()*16777215).toString(16)
          }
        }));
      };
      
      // 메시지 수신
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connection':
              console.log('📡 서버 연결 확인:', message);
              break;
              
            case 'components-update':
              console.log('🔄 컴포넌트 업데이트 수신:', message.components.length);
              setComponents(message.components);
              if (onComponentsChange) {
                onComponentsChange(message.components);
              }
              break;
              
            case 'user-list':
              console.log('👥 협업자 목록 업데이트:', message.users.length);
              setCollaborators(message.users.filter(user => user.id !== userInfo.id));
              break;
              
            case 'pong':
              // 핑퐁 응답
              break;
              
            default:
              console.log('📨 알 수 없는 메시지:', message);
          }
        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error);
        }
      };
      
      // 연결 오류
      ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error);
        setConnectionError(error);
        setIsConnected(false);
      };
      
      // 연결 종료
      ws.onclose = (event) => {
        console.log('❌ WebSocket 연결 종료:', event.code, event.reason);
        setIsConnected(false);
        
        // 자동 재연결 시도
        if (!event.wasClean && reconnectTimeoutRef.current === null) {
          console.log('🔄 5초 후 재연결 시도...');
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            isInitializedRef.current = false;
            initializeCollaboration();
          }, 5000);
        }
      };
      
      isInitializedRef.current = true;
      console.log('✅ 협업 시스템 초기화 완료');
      
    } catch (error) {
      console.error('❌ 협업 시스템 초기화 실패:', error);
      setConnectionError(error);
    }
  }, [roomId, userInfo, onComponentsChange]);
  
  // 정리 함수
  const cleanup = useCallback(() => {
    console.log('🧹 협업 시스템 정리 시작');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    isInitializedRef.current = false;
    setIsConnected(false);
    setConnectionError(null);
    setCollaborators([]);
    
    console.log('✅ 협업 시스템 정리 완료');
  }, []);
  
  // 컴포넌트 업데이트 함수
  const updateComponents = useCallback((newComponents) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket이 연결되지 않음');
      return;
    }
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'components-update',
        components: newComponents,
        userId: userInfo.id
      }));
      
      console.log('📝 컴포넌트 업데이트 전송:', newComponents.length);
    } catch (error) {
      console.error('❌ 컴포넌트 업데이트 실패:', error);
    }
  }, [userInfo]);
  
  // 단일 컴포넌트 업데이트
  const updateComponent = useCallback((componentId, updates) => {
    const currentComponents = components;
    const componentIndex = currentComponents.findIndex(c => c.id === componentId);
    
    if (componentIndex !== -1) {
      const updatedComponents = [...currentComponents];
      updatedComponents[componentIndex] = { ...updatedComponents[componentIndex], ...updates };
      updateComponents(updatedComponents);
    }
  }, [components, updateComponents]);
  
  // 커서 위치 업데이트
  const updateCursor = useCallback((position) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'cursor-update',
        cursor: position,
        userId: userInfo.id
      }));
    } catch (error) {
      console.error('❌ 커서 업데이트 실패:', error);
    }
  }, [userInfo]);
  
  // 캔버스 설정 업데이트
  const updateCanvasSettings = useCallback((settings) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket이 연결되지 않음');
      return;
    }
    
    try {
      wsRef.current.send(JSON.stringify({
        type: 'canvas-settings-update',
        settings: settings,
        userId: userInfo.id
      }));
      
      console.log('📝 캔버스 설정 업데이트 전송:', settings);
    } catch (error) {
      console.error('❌ 캔버스 설정 업데이트 실패:', error);
    }
  }, [userInfo]);
  
  // 재연결 함수
  const reconnect = useCallback(() => {
    console.log('🔄 협업 시스템 재연결 시도');
    cleanup();
    setTimeout(() => {
      initializeCollaboration();
    }, 1000);
  }, [cleanup, initializeCollaboration]);
  
  // 초기화 및 정리
  useEffect(() => {
    initializeCollaboration();
    return cleanup;
  }, [roomId, userInfo]); // 실제 변경되는 값들만 의존성으로 설정
  
  return {
    // 상태
    isConnected,
    connectionError,
    collaborators,
    components,
    
    // 함수
    updateComponents,
    updateComponent,
    updateCursor,
    updateCanvasSettings,
    reconnect
  };
}
