import React, { useState, useRef, useEffect } from 'react';

const ChatBubble = ({ 
  x, 
  y, 
  user, 
  message, 
  timestamp, 
  onClose, 
  isOwnMessage = false,
  followCursor = false 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const bubbleRef = useRef(null);

  useEffect(() => {
    // 5초 후 자동으로 사라지게 설정
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // 애니메이션 완료 후 제거
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bubbleRef}
      style={{
<<<<<<< Updated upstream
        position: 'fixed', // absolute 대신 fixed 사용
        left: x + 20, // 커서 오른쪽에 위치
        top: y - 40, // 커서 위에 위치
        backgroundColor: user?.color || '#3B4EFF',
=======
        position: 'absolute',
        left: x + 20, // 커서 오른쪽에 위치
        top: y - 40, // 커서 위에 위치
        backgroundColor: isOwnMessage ? '#3B4EFF' : user?.color || '#ffffff',
>>>>>>> Stashed changes
        color: isOwnMessage ? '#ffffff' : '#ffffff',
        padding: '8px 12px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '200px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: isOwnMessage ? 'none' : '1px solid rgba(255,255,255,0.2)',
<<<<<<< Updated upstream
        zIndex: 99999,
        animation: followCursor ? 'none' : 'chatBubbleIn 0.3s ease-out',
        transform: followCursor ? 'translateZ(0)' : 'none', // GPU 가속 (필요할 때만)
=======
        zIndex: 10000,
        animation: followCursor ? 'none' : 'chatBubbleIn 0.3s ease-out',
        transform: 'translateZ(0)', // GPU 가속
>>>>>>> Stashed changes
        transition: followCursor ? 'all 0.1s ease-out' : 'none',
      }}
    >
      {/* 사용자 이름 */}
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '4px',
        opacity: 0.8,
      }}>
        {user?.name || '사용자'}
      </div>
      
      {/* 메시지 내용 */}
      <div style={{
        lineHeight: '1.4',
      }}>
        {message}
      </div>

      <style>{`
        @keyframes chatBubbleIn {
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

export default ChatBubble; 