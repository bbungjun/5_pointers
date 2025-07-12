import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor = false, mode = 'editor', onPropsChange }) {
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

  // 웨딩 테마 우아한 카드 스타일
  const bubbleStyle = {
    width: '65px',
    height: '65px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FAF9F6 0%, #F5F3F0 50%, #EBE8E4 100%)',
    boxShadow: `
      0 4px 12px rgba(189, 181, 166, 0.15),
      0 2px 4px rgba(189, 181, 166, 0.1),
      inset 0 1px 0 rgba(255,255,255,0.8)
    `,
    border: '1px solid #BDB5A6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '5px',
    overflow: 'hidden',
    transition: 'all 0.3s ease'
  };

  // 웨딩 테마 우아한 하이라이트
  const bubbleHighlight = {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '20px',
    height: '20px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
    filter: 'blur(1px)'
  };

  // 웨딩 테마 우아한 숫자 스타일
  const numberStyle = {
    fontSize: '22px',
    fontWeight: '700',
    lineHeight: '1',
    color: '#4A4A4A',
    fontFamily: 'Playfair Display, serif',
    zIndex: 2,
    position: 'relative'
  };

  // 웨딩 테마 우아한 라벨 스타일
  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#BDB5A6',
    textAlign: 'center',
    marginTop: '6px',
    fontFamily: 'Montserrat, sans-serif'
  };

  // 웨딩 테마 우아한 콜론 스타일
  const colonStyle = {
    fontSize: '28px',
    fontWeight: '300',
    color: '#BDB5A6',
    display: 'flex',
    alignItems: 'center',
    margin: '0 4px',
    fontFamily: 'Playfair Display, serif'
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
        background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    return {
      ...baseStyle,
      background: `linear-gradient(135deg, ${backgroundColor} 0%, #F5F3F0 50%, #EBE8E4 100%)`,
      border: '1px solid rgba(189, 181, 166, 0.2)'
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

      {/* 웨딩 테마 목표 날짜 표시 */}
      <div style={{
        fontSize: '14px',
        fontWeight: '500',
        color: '#4A4A4A',
        textAlign: 'center',
        background: 'rgba(189, 181, 166, 0.1)',
        padding: '6px 12px',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(189, 181, 166, 0.2)',
        fontFamily: 'Montserrat, sans-serif'
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
