import React, { useState, useEffect } from 'react';

/**
 * 저장 상태 표시 컴포넌트
 */
function SaveStatusIndicator({
  isSaving,
  lastSaved,
  saveError,
  saveCount,
  onSaveNow,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [statusText, setStatusText] = useState('');

  // 상대 시간 계산 함수
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) {
      return `${seconds}초 전`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}분 전`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}시간 전`;
    }

    return date.toLocaleString();
  };

  // 1초마다 시간 업데이트
  useEffect(() => {
    let timer;
    if (isSaving) {
      setIsVisible(true);
      setStatusText('저장 중...');
    } else if (saveError) {
      setIsVisible(true);
      setStatusText(`오류: ${saveError.message || '저장에 실패했습니다.'}`);
    } else if (saveCount > 0 && lastSaved) {
      // lastSaved가 변경될 때마다 잠깐 표시
      setIsVisible(true);
      setStatusText('모든 변경사항이 저장되었습니다.');
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 2000); // 2초 후에 사라짐
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isSaving, lastSaved, saveError, saveCount]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(4px)',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: 1, // isVisible로 제어하므로 항상 1
        transform: 'translateY(0)', // isVisible로 제어하므로 항상 translateY(0)
        pointerEvents: 'auto', // isVisible로 제어하므로 항상 auto
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>{statusText}</span>
        {isSaving && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        )}
      </div>
      {!!saveError && (
        <button
          onClick={onSaveNow}
          style={{
            marginLeft: '12px',
            background: 'none',
            border: 'none',
            color: '#f87171',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          재시도
        </button>
      )}
    </div>
  );
}

export default SaveStatusIndicator;
