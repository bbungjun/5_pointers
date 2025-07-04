import React, { useState, useEffect } from 'react';

function DdayRenderer({ comp, isEditor }) {
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

  const dropletStyle = {
    width: '90px',
    height: '100px',
    background: theme === 'dark' 
      ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)' 
      : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,248,255,0.9) 100%)',
    borderRadius: '50% 50% 50% 0',
    transform: 'rotate(-45deg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: theme === 'dark'
      ? '0 8px 32px rgba(0,0,0,0.3), inset 0 2px 8px rgba(255,255,255,0.2)'
      : '0 8px 32px rgba(0,0,0,0.15), inset 0 2px 8px rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    margin: '20px'
  };

  const dropletContentStyle = {
    transform: 'rotate(45deg)',
    textAlign: 'center',
    color: theme === 'dark' ? '#1f2937' : '#1f2937'
  };

  const numberStyle = {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1',
    marginBottom: '4px'
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    opacity: 0.8
  };

  const backgroundOptions = [
    { name: '기본', value: '' },
    { name: '꽃 배경 1', value: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800' },
    { name: '꽃 배경 2', value: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { name: '자연 배경', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
    { name: '하늘 배경', value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' }
  ];

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      minHeight: '250px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      borderRadius: '16px',
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
      {isEditor && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '8px',
          padding: '8px',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}>
          <select 
            value={backgroundImage}
            onChange={(e) => {
              console.log('Background changed:', e.target.value);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
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

      {title && (
        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          marginBottom: '40px',
          color: backgroundImage || theme === 'dark' ? '#ffffff' : '#1f2937',
          textAlign: 'center',
          textShadow: backgroundImage ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
          fontFamily: '"Noto Sans KR", sans-serif'
        }}>
          {title}
        </h2>
      )}

      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={dropletStyle}>
          <div style={dropletContentStyle}>
            <div style={numberStyle}>
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div style={labelStyle}>Days</div>
          </div>
        </div>

        <div style={dropletStyle}>
          <div style={dropletContentStyle}>
            <div style={numberStyle}>
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div style={labelStyle}>Hours</div>
          </div>
        </div>

        <div style={dropletStyle}>
          <div style={dropletContentStyle}>
            <div style={numberStyle}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div style={labelStyle}>Minutes</div>
          </div>
        </div>

        <div style={dropletStyle}>
          <div style={dropletContentStyle}>
            <div style={numberStyle}>
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div style={labelStyle}>Seconds</div>
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '16px',
        fontWeight: '500',
        color: backgroundImage || theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31,41,55,0.7)',
        textAlign: 'center',
        textShadow: backgroundImage ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
        background: 'rgba(255,255,255,0.1)',
        padding: '8px 16px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)'
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
