import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor }) {
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2024-12-31';
  const backgroundColor = comp.props.backgroundColor || comp.defaultProps?.backgroundColor || '#f8fafc';
  const backgroundImage = comp.props.backgroundImage || comp.defaultProps?.backgroundImage || '';
  const theme = comp.props.theme || comp.defaultProps?.theme || 'light'; // 'light' or 'dark'
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
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
        // 목표 날짜가 지났을 때 모든 값을 0으로 설정
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    // 초기 계산
    calculateTimeLeft();

    // 1초마다 업데이트 (에디터 모드가 아닐 때만)
    let interval;
    if (!isEditor) {
      interval = setInterval(calculateTimeLeft, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [targetDate, isEditor]);

  const blockStyle = {
    backgroundColor: theme === 'dark' 
      ? 'rgba(0, 0, 0, 0.7)' 
      : 'rgba(255, 255, 255, 0.9)',
    color: theme === 'dark' ? '#ffffff' : '#1f2937',
    borderRadius: '12px',
    padding: '16px 12px',
    minWidth: '80px',
    textAlign: 'center',
    boxShadow: theme === 'dark' 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: theme === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(0, 0, 0, 0.1)'
  };

  const numberStyle = {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1',
    marginBottom: '8px'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    opacity: 0.8
  };

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {
      background: backgroundColor
    };
  };

  const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    borderRadius: '12px',
    position: 'relative',
    overflow: 'hidden',
    ...getBackgroundStyle()
  };

  return (
    <div style={containerStyle}>
      {/* 제목 */}
      {title && (
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '32px',
          color: backgroundImage || theme === 'dark' ? '#ffffff' : '#1f2937',
          textAlign: 'center',
          textShadow: backgroundImage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
        }}>
          {title}
        </h2>
      )}

      {/* 카운트다운 블록들 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Days */}
        <div style={blockStyle}>
          <div style={numberStyle}>
            {timeLeft.days.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Days</div>
        </div>

        {/* Hours */}
        <div style={blockStyle}>
          <div style={numberStyle}>
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Hours</div>
        </div>

        {/* Minutes */}
        <div style={blockStyle}>
          <div style={numberStyle}>
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Minutes</div>
        </div>

        {/* Seconds */}
        <div style={blockStyle}>
          <div style={numberStyle}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Seconds</div>
        </div>
      </div>

      {/* 목표 날짜 표시 */}
      <div style={{
        marginTop: '24px',
        fontSize: '14px',
        color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.6)',
        textAlign: 'center',
        textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
      }}>
        {new Date(targetDate).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </div>
    </div>
  );
}

export default DdayRenderer;
