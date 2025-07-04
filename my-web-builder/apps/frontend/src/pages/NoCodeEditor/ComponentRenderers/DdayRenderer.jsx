import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor, onPropsChange }) {
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2024-12-31';
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

  // 원래 크기로 되돌린 물방울 스타일
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

  // 원래 크기로 되돌린 하이라이트
  const bubbleHighlight = {
    position: 'absolute',
    top: '18%',
    left: '28%',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%, transparent 100%)',
    filter: 'blur(1.5px)'
  };

  // 숫자 크기만 키움
  const numberStyle = {
    fontSize: '20px',  // 18px → 20px
    fontWeight: '700',
    lineHeight: '1',
    color: '#ffffff',
    zIndex: 2,
    position: 'relative'
  };

  // 라벨 크기만 키움
  const labelStyle = {
    fontSize: '11px',  // 10px → 11px
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: '4px'
  };

  // 콜론 크기만 키움
  const colonStyle = {
    fontSize: '26px',  // 24px → 26px
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    margin: '0 2px'
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      minHeight: '120px',  // 원래 크기로 되돌림
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '10px',     // 원래 크기로 되돌림
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden'
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
        gap: '4px',          // 원래 크기로 되돌림
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10px'  // 원래 크기로 되돌림
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
        fontSize: '13px',    // 12px → 13px
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 10px',  // 원래 크기로 되돌림
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
