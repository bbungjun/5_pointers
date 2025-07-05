import React from 'react';

const PageThumbnail = () => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      padding: '12px',
      position: 'relative'
    }}>
      {/* 페이지 아이콘 */}
      <div style={{
        fontSize: '24px',
        marginBottom: '8px',
        color: '#6c757d'
      }}>
        📄
      </div>
      
      {/* 페이지 이름 */}
      <div style={{
        fontSize: '12px',
        fontWeight: '500',
        color: '#495057',
        textAlign: 'center',
        lineHeight: '1.2'
      }}>
        페이지
      </div>
      
      {/* 네비게이션 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        fontSize: '10px',
        color: '#adb5bd'
      }}>
        →
      </div>
    </div>
  );
};

export default PageThumbnail; 