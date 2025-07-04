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

  // 진짜 물방울처럼 투명한 스타일
  const bubbleStyle = {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.1) 70%, rgba(255,255,255,0.05) 100%)',
    boxShadow: `
      0 0 20px rgba(255,255,255,0.3),
      0 0 40px rgba(255,255,255,0.1),
      inset 0 0 20px rgba(255,255,255,0.3),
      inset -8px -8px 20px rgba(0,0,0,0.05)
    `,
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(15px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '5px',
    overflow: 'hidden'
  };

  // 더 자연스러운 하이라이트
  const bubbleHighlight = {
    position: 'absolute',
    top: '15%',
    left: '20%',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
    filter: 'blur(2px)'
  };

  const numberStyle = {
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '1',
    color: theme === 'dark' ? '#ffffff' : '#1f2937',
    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
    zIndex: 2,
    position: 'relative'
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.8)',
    textAlign: 'center',
    marginTop: '4px',
    textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
  };

  // 콜론 스타일
  const colonStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(31,41,55,0.6)',
    textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
    display: 'flex',
    alignItems: 'center',
    margin: '0 2px'
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px',
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
      {/* 물방울과 단위를 세로로 배치한 블록들 + 콜론 */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        {/* Days */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={bubbleHighlight}></div>
            <div style={numberStyle}>
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Days</div>
        </div>

        {/* 콜론 */}
        <div style={colonStyle}>:</div>

        {/* Hours */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={bubbleHighlight}></div>
            <div style={numberStyle}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Hours</div>
        </div>

        {/* 콜론 */}
        <div style={colonStyle}>:</div>

        {/* Minutes */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={bubbleHighlight}></div>
            <div style={numberStyle}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Minutes</div>
        </div>

        {/* 콜론 */}
        <div style={colonStyle}>:</div>

        {/* Seconds */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={bubbleStyle}>
            <div style={bubbleHighlight}></div>
            <div style={numberStyle}>
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
          </div>
          <div style={labelStyle}>Seconds</div>
        </div>
      </div>

      {/* 목표 날짜 표시 */}
      <div style={{
        fontSize: '12px',
        fontWeight: '500',
        color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.7)',
        textAlign: 'center',
        textShadow: backgroundImage ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 10px',
        borderRadius: '12px',
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
