import React, { useState, useEffect } from 'react';

function AttendRenderer({ comp, isEditor = false, mode = 'live', width, height }) {
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
  // 컴포넌트 크기를 인라인 스타일로 적용
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: comp.props.backgroundColor || '#f8f9fa',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    ...(isLiveMode ? {
      borderRadius: `clamp(6px, 2vw, 12px)`,
      padding: `clamp(12px, 4vw, 24px)`,
      minHeight: `clamp(120px, 35vw, 200px)`
    } : {
      borderRadius: '12px',
      padding: '24px',
      minHeight: '200px'
    })
  };

  return (
    <div style={containerStyle}>
      <div style={{
        color: '#9ca3af',
        fontSize: isLiveMode ? `clamp(${Math.max(12, 18 * 0.7)}px, ${(18 / 375) * 100}vw, 18px)` : '18px',
        fontWeight: '500',
        marginBottom: isLiveMode ? `clamp(8px, 2vw, 16px)` : '16px',
        whiteSpace: 'pre-wrap'
      }}>
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div style={{
        color: '#374151',
        fontSize: isLiveMode ? `clamp(${Math.max(10, 16 * 0.7)}px, ${(16 / 375) * 100}vw, 16px)` : '16px',
        lineHeight: '1.6',
        marginBottom: isLiveMode ? `clamp(10px, 3vw, 20px)` : '20px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap'
      }}>
        {comp.props.description || (
          <>
            축하의 마음으로 참석해 주실<br />
            모든 분을 정중히 모시고자 하오니,<br />
            참석 여부를 알려주시면 감사하겠습니다.
          </>
        )}
      </div>
      <button
        style={{
          width: '100%',
          padding: isLiveMode ? `clamp(8px, 2vw, 12px) clamp(10px, 3vw, 16px)` : '12px 16px',
          color: 'white',
          fontSize: isLiveMode ? `clamp(${Math.max(12, 18 * 0.7)}px, ${(18 / 375) * 100}vw, 18px)` : '18px',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: isLiveMode ? `clamp(4px, 1.5vw, 8px)` : '8px',
          cursor: 'pointer',
          letterSpacing: '0.5px',
          background: comp.props.buttonColor || '#aeb8fa',
          whiteSpace: 'pre-wrap'
        }}
        onClick={e => {
          e.stopPropagation();
          if (isEditor) {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          }
        }}
      >
        {comp.props.buttonText || '전달하기'}
      </button>
    </div>
  );
}

export default AttendRenderer;