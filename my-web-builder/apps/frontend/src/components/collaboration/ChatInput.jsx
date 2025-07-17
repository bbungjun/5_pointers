import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ 
  x, 
  y, 
  user, 
  onSend, 
  onCancel,
  onInput,
  onStartTyping,
  onStopTyping,
  followCursor = false 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // 컴포넌트가 마운트되면 자동으로 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      // 메시지 전송 시 타이핑 중지
      if (onStopTyping) {
        onStopTyping();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (message.trim()) {
        onSend(message.trim());
        setMessage('');
        // 메시지 전송 시 타이핑 중지
        if (onStopTyping) {
          onStopTyping();
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // 타이핑 시작 알림
    if (onStartTyping) {
      onStartTyping();
    }
    
    // 입력이 있을 때 타이머 리셋
    if (onInput) {
      onInput();
    }
    
    // 타이핑 중지 타이머 설정 (1초 후 타이핑 중지로 간주)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        onStopTyping();
      }
    }, 1000);
  };

  const handleCancel = () => {
    // 타이핑 중지
    if (onStopTyping) {
      onStopTyping();
    }
    onCancel();
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', // absolute 대신 fixed 사용
        left: x + 20, // 커서 오른쪽에 위치
        top: y - 40, // 커서 위에 위치
        backgroundColor: user?.color || '#3B4EFF',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 99999,
        animation: followCursor ? 'none' : 'chatInputIn 0.3s ease-out',
        transform: followCursor ? 'translateZ(0)' : 'none', // GPU 가속 (필요할 때만)
        minWidth: '200px',
        transition: followCursor ? 'all 0.1s ease-out' : 'none',
      }}
    >
      {/* 사용자 이름 */}
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '4px',
        color: '#ffffff',
        opacity: 0.9,
      }}>
        {user?.name || '사용자'}
      </div>
      
      {/* 입력 폼 */}
      <div style={{ display: 'flex' }}>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            padding: '6px 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: '#333333',
            minWidth: '0',
          }}
          maxLength={100}
        />
      </div>

      <style>{`
        @keyframes chatInputIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInput; 