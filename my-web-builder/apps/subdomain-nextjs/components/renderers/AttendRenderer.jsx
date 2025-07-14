import React from 'react';

function AttendRenderer({ comp, isEditor = false, mode = 'live', width, height }) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;
  
  // 컴포넌트 크기를 인라인 스타일로 적용
  const containerStyle = {
    width: `${comp?.width || 300}px`,
    height: `${comp?.height || 200}px`,
    backgroundColor: comp.props.backgroundColor || '#f8f9fa',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    ...(mode === 'live' ? {
      width: '100%',
      height: `${(comp?.height || 200) * scaleFactor}px`, // 높이 스케일링
      borderRadius: `${12 * scaleFactor}px`, // 모서리 스케일링
      padding: `${24 * scaleFactor}px`, // 패딩 스케일링
      minHeight: `${200 * scaleFactor}px` // 최소 높이 스케일링
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
        fontSize: mode === 'live' ? `${18 * scaleFactor}px` : '18px', // 스케일링 적용
        fontWeight: '500',
        marginBottom: mode === 'live' ? `${16 * scaleFactor}px` : '16px', // 스케일링 적용
        whiteSpace: 'pre-wrap'
      }}>
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div style={{
        color: '#374151',
        fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px', // 스케일링 적용
        lineHeight: '1.6',
        marginBottom: mode === 'live' ? `${20 * scaleFactor}px` : '20px', // 스케일링 적용
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
          padding: mode === 'live' ? `${12 * scaleFactor}px ${16 * scaleFactor}px` : '12px 16px', // 스케일링 적용
          color: 'white',
          fontSize: mode === 'live' ? `${18 * scaleFactor}px` : '18px', // 스케일링 적용
          fontWeight: 'bold',
          border: 'none',
          borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px', // 스케일링 적용
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