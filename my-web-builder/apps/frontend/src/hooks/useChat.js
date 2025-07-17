import { useState, useCallback, useRef, useEffect } from 'react';

export function useChat(awareness, userInfo) {
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatInputOpen, setIsChatInputOpen] = useState(false);
  const [chatInputPosition, setChatInputPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const messageIdCounter = useRef(0);
  const autoCloseTimerRef = useRef(null);

  // 채팅 메시지 전송
  const sendChatMessage = useCallback((message, position) => {
    if (!awareness || !message.trim()) return;

    const messageId = `msg_${Date.now()}_${messageIdCounter.current++}`;
    const chatMessage = {
      id: messageId,
      message: message.trim(),
      user: {
        id: userInfo?.id || 'anonymous',
        name: userInfo?.name || 'Anonymous',
        color: userInfo?.color || '#000000',
      },
      timestamp: Date.now(),
      position: position,
    };

    // Awareness를 통해 다른 사용자에게 메시지 브로드캐스트
    awareness.setLocalStateField('chatMessage', chatMessage);

    // 로컬 상태에 메시지 추가
    setChatMessages(prev => [...prev, chatMessage]);

    // 입력창 닫기
    setIsChatInputOpen(false);

    // 5초 후 메시지 제거
    setTimeout(() => {
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    }, 5000);
  }, [awareness, userInfo]);

  // 채팅 입력 열기
  const openChatInput = useCallback((x, y) => {
    setChatInputPosition({ x, y });
    setCursorPosition({ x, y });
    setIsChatInputOpen(true);
    
    // 3초 후 자동으로 닫기
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      setIsChatInputOpen(false);
    }, 3000);
  }, []);

  // 채팅 입력 닫기
  const closeChatInput = useCallback(() => {
    setIsChatInputOpen(false);
    // 타이머 정리
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, []);

  // 타이머 리셋 (입력이 있을 때 호출)
  const resetAutoCloseTimer = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }
    autoCloseTimerRef.current = setTimeout(() => {
      setIsChatInputOpen(false);
    }, 3000);
  }, []);

  // 채팅 메시지 제거
  const removeChatMessage = useCallback((messageId) => {
    setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // 다른 사용자의 채팅 메시지 수신 처리
  const handleChatMessageReceived = useCallback((message) => {
    if (message.user?.id === userInfo?.id) return; // 자신의 메시지는 무시

    setChatMessages(prev => [...prev, message]);

    // 5초 후 메시지 제거
    setTimeout(() => {
      setChatMessages(prev => prev.filter(msg => msg.id !== message.id));
    }, 5000);
  }, [userInfo]);

  // 마우스 움직임 추적 (항상 추적)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return {
    chatMessages,
    isChatInputOpen,
    chatInputPosition,
    cursorPosition,
    sendChatMessage,
    openChatInput,
    closeChatInput,
    resetAutoCloseTimer,
    removeChatMessage,
    handleChatMessageReceived,
  };
} 