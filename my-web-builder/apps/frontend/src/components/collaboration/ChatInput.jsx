import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ 
  x, 
  y, 
  user, 
  onSend, 
  onCancel,
  onInput,
  followCursor = false 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

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
      }
    }
  };

  const handleCancel = () => {
    onCancel();
  };

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
          onChange={(e) => {
            setMessage(e.target.value);
            // 입력이 있을 때 타이머 리셋
            if (onInput) {
              onInput();
            }
          }}
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