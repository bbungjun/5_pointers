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
  const [timeAgo, setTimeAgo] = useState('');

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
    if (!lastSaved) return;

    const updateTime = () => {
      setTimeAgo(getTimeAgo(lastSaved));
    };

    updateTime(); // 초기 실행
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  const getStatusText = () => {
    if (saveError) return `저장 실패: ${saveError}`;
    if (isSaving) return '저장 중...';
    if (lastSaved) {
      return `마지막 저장: ${timeAgo}`;
    }
    return '저장 준비';
  };

  return (
    <div
      className="absolute right-6 text-xs font-normal"
      style={{
        top: 'calc(4rem + 8px)', // 헤더(4rem) + 간격(8px)
        color: saveError ? '#f44336' : '#94a3b8',
        zIndex: 50,
      }}
    >
      {getStatusText()}
    </div>
  );
}

export default SaveStatusIndicator;
