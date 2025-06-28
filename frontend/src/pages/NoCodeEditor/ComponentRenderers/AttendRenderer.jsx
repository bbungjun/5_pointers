import React from 'react';

function AttendRenderer({ comp, isEditor = false }) {
  return (
    <div style={{
      width: 280,
      padding: 16,
      backgroundColor: comp.props.backgroundColor,
      borderRadius: 8,
      border: '1px solid #ddd'
    }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#333' }}>
        👥 {comp.props.title}
      </h3>
      <p style={{ 
        margin: '0 0 16px 0', 
        fontSize: 14, 
        color: '#666',
        lineHeight: 1.4
      }}>
        {comp.props.description}
      </p>
      <button
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: comp.props.buttonColor,
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditor) {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          }
        }}
      >
        {comp.props.buttonText}
      </button>
      <div style={{ 
        marginTop: 12, 
        fontSize: 12, 
        color: '#888',
        textAlign: 'center'
      }}>
        {/* 최대 {comp.props.maxAttendees}명 참석 가능 */}
      </div>
    </div>
  );
}

export default AttendRenderer; 