import React, { useEffect, useState } from 'react';

/**
 * Toast 컴포넌트
 *
 * Props:
 * - type: 'success' | 'error'
 * - message: 표시할 메시지
 * - isVisible: 토스트 표시 여부
 * - onClose: 닫기 함수
 * - autoClose: 자동 닫기 여부 (기본값: true)
 * - duration: 자동 닫기 시간 (기본값: 5000ms)
 */
function Toast({
  type = 'success',
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000,
}) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // 애니메이션 시간
  };

  if (!isVisible) return null;

  // 타입별 스타일 설정
  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: isClosing ? 'translate(-50%, 100%)' : 'translate(-50%, 0)',
      zIndex: 9999,
      padding: '16px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
      minWidth: '300px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      opacity: isClosing ? 0 : 1,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    };

    if (type === 'success') {
      return {
        ...baseStyles,
        backgroundColor: '#ffffff',
        color: '#059669',
        borderColor: '#059669',
        borderWidth: '2px',
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: '#ffffff',
        color: '#dc2626',
        borderColor: '#dc2626',
        borderWidth: '2px',
      };
    }
  };

  const buttonStyles = {
    background: type === 'success' ? '#059669' : '#dc2626',
    border: '1px solid',
    borderColor: type === 'success' ? '#059669' : '#dc2626',
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  };

  return (
    <div style={getToastStyles()}>
      <div style={{ flex: 1, lineHeight: '1.4' }}>{message}</div>
      <button
        onClick={handleClose}
        style={buttonStyles}
        onMouseEnter={(e) => {
          e.target.style.background =
            type === 'success' ? '#047857' : '#b91c1c';
        }}
        onMouseLeave={(e) => {
          e.target.style.background =
            type === 'success' ? '#059669' : '#dc2626';
        }}
      >
        확인
      </button>
    </div>
  );
}

export default Toast;
