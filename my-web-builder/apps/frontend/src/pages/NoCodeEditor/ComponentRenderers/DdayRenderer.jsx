import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor = false, mode = 'editor', onPropsChange }) {
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2024-12-31';
  const targetTime = comp.props.targetTime || comp.defaultProps?.targetTime || '14:00';
  const backgroundColor = comp.props.backgroundColor || comp.defaultProps?.backgroundColor || '#f8fafc';
  const backgroundImage = comp.props.backgroundImage || comp.defaultProps?.backgroundImage || '';
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(`${targetDate}T${targetTime}`).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds)
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [targetDate]);

  // 모던 미니멀 카드 스타일
  const bubbleStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '4px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease'
  };

  // 모던 숫자 스타일
  const numberStyle = {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '1',
    color: '#1a1a1a',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    zIndex: 2,
    position: 'relative'
  };

  // 모던 라벨 스타일
  const labelStyle = {
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: 'rgba(0, 0, 0, 0.6)',
    textAlign: 'center',
    marginTop: '8px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  };

  // 모던 구분자 스타일
  const separatorStyle = {
    width: '2px',
    height: '24px',
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '1px',
    margin: '0 8px'
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: comp.width || 340,
      height: comp.height || 150,
      minHeight: '120px',  // 원래 크기로 되돌림
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      // padding: '10px',     // 패딩삭제
      borderRadius: 0,
      position: 'relative',
      overflow: 'hidden'
    };

    if (backgroundImage) {
      return {
        ...baseStyle,
        background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(0.8) contrast(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${backgroundColor} 0%, #f8f9fa 100%)`,
      border: '1px solid rgba(0, 0, 0, 0.05)'
    };
  };

  return (
    <div style={getContainerStyle()}>
      {/* 물방울과 단위를 세로로 배치한 블록들 + 콜론 */}
      <div style={{
        display: 'flex',
        gap: '2px',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        {/* Days */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={numberStyle}>
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Days</div>
        </div>

        {/* 구분자 */}
        <div style={separatorStyle}></div>

        {/* Hours */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={numberStyle}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Hours</div>
        </div>

        {/* 구분자 */}
        <div style={separatorStyle}></div>

        {/* Minutes */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={numberStyle}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Minutes</div>
        </div>

        {/* 구분자 */}
        <div style={separatorStyle}></div>

        {/* Seconds */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={numberStyle}>
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Seconds</div>
        </div>
      </div>

      {/* 모던 목표 날짜 표시 */}
      <div style={{
        fontSize: '13px',
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.7)',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '8px 16px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {new Date(`${targetDate}T${targetTime}`).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })} {targetTime}
      </div>
    </div>
  );
}

export default DdayRenderer;
