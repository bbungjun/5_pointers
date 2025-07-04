import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor, onPropsChange }) {
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2024-12-31';
  const backgroundColor = comp.props.backgroundColor || comp.defaultProps?.backgroundColor || '#f8fafc';
  const backgroundImage = comp.props.backgroundImage || comp.defaultProps?.backgroundImage || '';
  const theme = comp.props.theme || comp.defaultProps?.theme || 'light';
  
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

  // 2×8 그리드에 맞춘 작은 물방울 스타일
  const bubbleStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.3) 70%, rgba(255,255,255,0.1) 100%)',
    boxShadow: `
      0 0 10px rgba(255,255,255,0.4),
      0 0 20px rgba(255,255,255,0.2),
      inset 0 0 10px rgba(255,255,255,0.2),
      inset -5px -5px 10px rgba(0,0,0,0.1)
    `,
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '3px',
    overflow: 'hidden'
  };

  // 작은 하이라이트 효과
  const bubbleHighlight = {
    position: 'absolute',
    top: '20%',
    left: '30%',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 70%, transparent 100%)',
    filter: 'blur(1px)'
  };

  const numberStyle = {
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '1',
    marginBottom: '1px',
    color: theme === 'dark' ? '#ffffff' : '#1f2937',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    zIndex: 2,
    position: 'relative'
  };

  const labelStyle = {
    fontSize: '7px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.7)',
    zIndex: 2,
    position: 'relative'
  };

  const backgroundOptions = [
    { name: '기본', value: '' },
    { name: '꽃 배경 1', value: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800' },
    { name: '꽃 배경 2', value: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { name: '자연 배경', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
    { name: '하늘 배경', value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' }
  ];

  const handleBackgroundChange = (newBackgroundImage) => {
    if (onPropsChange) {
      onPropsChange({
        ...comp.props,
        backgroundImage: newBackgroundImage
      });
    }
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      minHeight: '120px',  // 2행 높이에 맞춤
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px',      // 패딩 축소
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden'
    };

    if (backgroundImage) {
      return {
        ...baseStyle,
        background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${backgroundColor} 0%, #e0f2fe 100%)`
    };
  };

  return (
    <div style={getContainerStyle()}>
      {/* 배경 선택 UI (편집 모드에서만 표시) */}
      {isEditor && (
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '6px',
          padding: '4px',
          backdropFilter: 'blur(8px)',
          zIndex: 10
        }}>
          <select 
            value={backgroundImage}
            onChange={(e) => handleBackgroundChange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            {backgroundOptions.map(option => (
              <option key={option.name} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 제목 (작게) */}
      {title && (
        <h2 style={{
          fontSize: '16px',    // 28px → 16px
          fontWeight: '600',
          marginBottom: '8px', // 40px → 8px
          color: backgroundImage || theme === 'dark' ? '#ffffff' : '#1f2937',
          textAlign: 'center',
          textShadow: backgroundImage ? '0 1px 4px rgba(0,0,0,0.7)' : 'none',
          fontFamily: '"Noto Sans KR", sans-serif'
        }}>
          {title}
        </h2>
      )}

      {/* 물방울 카운트다운 블록들 (한 줄 배치) */}
      <div style={{
        display: 'flex',
        gap: '2px',          // 5px → 2px
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '8px'  // 30px → 8px
      }}>
        {/* Days 물방울 */}
        <div style={bubbleStyle}>
          <div style={bubbleHighlight}></div>
          <div style={numberStyle}>
            {timeLeft.days.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Days</div>
        </div>

        {/* Hours 물방울 */}
        <div style={bubbleStyle}>
          <div style={bubbleHighlight}></div>
          <div style={numberStyle}>
            {timeLeft.hours.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Hours</div>
        </div>

        {/* Minutes 물방울 */}
        <div style={bubbleStyle}>
          <div style={bubbleHighlight}></div>
          <div style={numberStyle}>
            {timeLeft.minutes.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Minutes</div>
        </div>

        {/* Seconds 물방울 */}
        <div style={bubbleStyle}>
          <div style={bubbleHighlight}></div>
          <div style={numberStyle}>
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
          <div style={labelStyle}>Seconds</div>
        </div>
      </div>

      {/* 목표 날짜 표시 (작게) */}
      <div style={{
        fontSize: '11px',    // 16px → 11px
        fontWeight: '500',
        color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.7)',
        textAlign: 'center',
        textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 8px',  // 8px 16px → 4px 8px
        borderRadius: '12px', // 20px → 12px
        backdropFilter: 'blur(8px)'
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
