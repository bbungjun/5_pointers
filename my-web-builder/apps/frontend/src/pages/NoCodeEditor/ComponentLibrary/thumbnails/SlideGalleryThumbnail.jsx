import React from 'react';

function SlideGalleryThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      gap: 6
    }}>
      {/* 슬라이드 영역 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        {/* 좌측 화살표 */}
        <div style={{
          width: 8,
          height: 8,
          border: '2px solid #94a3b8',
          borderRight: 'none',
          borderBottom: 'none',
          transform: 'rotate(-45deg)'
        }}></div>
        
        {/* 메인 슬라이드 */}
        <div style={{
          width: 40,
          height: 28,
          backgroundColor: '#f1f5f9',
          borderRadius: 4,
          border: '1px solid #e2e8f0'
        }}></div>
        
        {/* 우측 화살표 */}
        <div style={{
          width: 8,
          height: 8,
          border: '2px solid #94a3b8',
          borderLeft: 'none',
          borderBottom: 'none',
          transform: 'rotate(45deg)'
        }}></div>
      </div>
      
      {/* 인디케이터 점들 */}
      <div style={{
        display: 'flex',
        gap: 3
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: '#3b82f6'
        }}></div>
        <div style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          backgroundColor: '#d1d5db'
        }}></div>
        <div style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          backgroundColor: '#d1d5db'
        }}></div>
      </div>
    </div>
  );
}

export default SlideGalleryThumbnail;
