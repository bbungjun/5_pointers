import React, { useState, useEffect } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

function DdayRenderer({ comp, isEditor = false, mode = 'live' }) {
  const { isLiveMode, responsiveWidth, responsiveHeight } = useResponsive(mode, comp.width, comp.height);
  const title = comp.props.title || comp.defaultProps?.title || 'D-Day';
  const targetDate = comp.props.targetDate || comp.defaultProps?.targetDate || '2025-07-26';
  const targetTime = comp.props.targetTime || comp.defaultProps?.targetTime || '14:00';
  const backgroundColor = comp.props.backgroundColor || comp.defaultProps?.backgroundColor || '#ffffff';
  const backgroundImage = comp.props.backgroundImage || comp.defaultProps?.backgroundImage;
  
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
  }, [targetDate, targetTime]);

  // 모던 미니멀 카드 스타일
  const bubbleStyle = {
    width: '70px',
    height: '70px',
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    margin: '0 6px',
    transition: 'all 0.3s ease'
  };

  // 모던 숫자 스타일
  const numberStyle = {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1',
    color: '#1f2937',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  };

  // 모던 라벨 스타일
  const labelStyle = {
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '10px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
  };

  // 모던 구분자 스타일
  const separatorStyle = {
    fontSize: '20px',
    fontWeight: '300',
    color: '#d1d5db',
    margin: '0 4px',
    alignSelf: 'flex-start',
    marginTop: '25px'
  };

  const getContainerStyle = () => {
    return {
      width: comp.width || 340,
      height: comp.height || 150,
      minHeight: '140px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '0px',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: backgroundColor,
      border: '1px solid rgba(0, 0, 0, 0.08)'
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
        borderRadius: '16px',
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
