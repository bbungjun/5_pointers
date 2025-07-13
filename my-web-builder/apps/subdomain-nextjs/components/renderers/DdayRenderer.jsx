import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor, onPropsChange, mode = 'live', width, height }) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      setIsLiveMode(window.innerWidth <= 768);
      
      const handleResize = () => {
        setIsLiveMode(window.innerWidth <= 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2025-07-26';
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

  // 동적 물방울 스타일
  const bubbleStyle = {
    width: isLiveMode ? `clamp(40px, 12vw, 60px)` : '60px',
    height: isLiveMode ? `clamp(40px, 12vw, 60px)` : '60px',
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
    margin: isLiveMode ? `clamp(2px, 1vw, 5px)` : '5px',
    overflow: 'hidden'
  };

  // 동적 하이라이트
  const bubbleHighlight = {
    position: 'absolute',
    top: '18%',
    left: '28%',
    width: isLiveMode ? `clamp(12px, 3vw, 18px)` : '18px',
    height: isLiveMode ? `clamp(12px, 3vw, 18px)` : '18px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)',
    filter: 'blur(1.5px)'
  };

  // 숫자 스타일 - 동적 크기 조절
  const numberStyle = {
    fontSize: isLiveMode ? `clamp(${Math.max(12, 20 * 0.7)}px, ${(20 / 375) * 100}vw, 20px)` : '20px',
    fontWeight: '700',
    lineHeight: '1',
    color: '#ffffff',
    zIndex: 2,
    position: 'relative'
  };

  // 라벨 스타일 - 동적 크기 조절
  const labelStyle = {
    fontSize: isLiveMode ? `clamp(${Math.max(8, 11 * 0.7)}px, ${(11 / 375) * 100}vw, 11px)` : '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: '4px'
  };

  // 콜론 스타일 - 동적 크기 조절
  const colonStyle = {
    fontSize: isLiveMode ? `clamp(${Math.max(16, 26 * 0.7)}px, ${(26 / 375) * 100}vw, 26px)` : '26px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    margin: '0 2px'
  };

  const getContainerStyle = () => {
    const baseStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      ...(isLiveMode ? {
        width: '100%',
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}`,
        padding: `clamp(6px, 2vw, 10px)`,
        minHeight: `clamp(80px, 20vw, 120px)`
      } : {
        width: '100%',
        height: '100%',
        minHeight: '120px',
        padding: '10px'
      })
    };

    if (backgroundImage) {
      return {
        ...baseStyle,
        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${backgroundImage})`,
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
        gap: isLiveMode ? `clamp(2px, 1vw, 4px)` : '4px',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: isLiveMode ? `clamp(6px, 2vw, 10px)` : '10px'
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

      {/* 목표 날짜 표시 - 글자 크기만 키움 */}
      <div style={{
        fontSize: isLiveMode ? `clamp(${Math.max(9, 13 * 0.7)}px, ${(13 / 375) * 100}vw, 13px)` : '13px',
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: isLiveMode ? `clamp(2px, 1vw, 4px) clamp(6px, 2vw, 10px)` : '4px 10px',
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
