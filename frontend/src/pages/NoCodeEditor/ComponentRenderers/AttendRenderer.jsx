import React from 'react';

function AttendRenderer({ comp, isEditor = false }) {
  return (
    <div
      style={{
        maxWidth: 400,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '48px 24px 32px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          color: '#b0b0b0',
          fontSize: 22,
          fontWeight: 500,
          marginBottom: 36,
        }}
      >
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div
        style={{
          color: '#444',
          fontSize: 20,
          lineHeight: 1.7,
          marginBottom: 40,
          whiteSpace: 'pre-line',
        }}
      >
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
          padding: '18px 0',
          background: comp.props.buttonColor || '#aeb8fa',
          color: '#fff',
          fontSize: 24,
          fontWeight: 700,
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          letterSpacing: '1px',
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