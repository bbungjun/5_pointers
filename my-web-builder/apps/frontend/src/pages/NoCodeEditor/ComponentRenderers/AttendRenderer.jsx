import React from 'react';

function AttendRenderer({ comp, mode = 'editor' }) {
  // 컴포넌트 크기를 인라인 스타일로 적용
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: comp.props.backgroundColor || '#faf9f7',
    borderRadius: '0px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
    border: '1px solid #e5e7eb'
  };

  return (
    <div style={containerStyle}>
      <div style={{
        color: comp.props.titleColor || '#8b7355',
        fontSize: comp.props.titleFontSize || '24px',
        fontWeight: '600',
        marginBottom: '24px',
        whiteSpace: 'pre-wrap',
        fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
        letterSpacing: '0.025em',
        lineHeight: '1.3'
      }}>
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div style={{
        color: comp.props.descriptionColor || '#4a5568',
        fontSize: comp.props.descriptionFontSize || '16px',
        lineHeight: '1.7',
        marginBottom: '32px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre-wrap',
        fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
        fontWeight: '400',
        letterSpacing: '0.01em'
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
          padding: '16px 24px',
          color: comp.props?.buttonTextColor || 'white',
          fontSize: comp.props?.buttonFontSize || '18px',
          fontWeight: '600',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          letterSpacing: '0.025em',
          background: comp.props?.buttonColor || '#6366f1',
          whiteSpace: 'pre-wrap',
          fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          textTransform: 'none'
        }}
        onClick={e => {
          e.stopPropagation();
          if (mode === 'preview') {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          }
        }}
        onMouseEnter={e => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 8px 0 rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={e => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.1)';
        }}
      >
        {comp.props.buttonText || '전달하기'}
      </button>
    </div>
  );
}

export default AttendRenderer;