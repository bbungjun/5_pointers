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
      padding: 8,
      gap: 6
    }}>
      {/* 슬라이드 영역 (크기 확대) */}
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
        
        {/* 메인 슬라이드 (크기 확대) */}
        <div style={{
          width: 48,  // 40 → 48로 확대
          height: 32, // 28 → 32로 확대
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* 산 모양 + 태양 아이콘 */}
          <div style={{
            width: 16,  // 이미지 아이콘 크기 확대
            height: 16,
            backgroundColor: '#e5e7eb',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* 산 모양 */}
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '3px solid transparent',
              borderRight: '3px solid transparent',
              borderBottom: '4px solid #9ca3af',
              position: 'absolute',
              bottom: 2,
              left: 3
            }}></div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '3px solid #9ca3af',
              position: 'absolute',
              bottom: 2,
              right: 3
            }}></div>
            
            {/* 태양 */}
            <div style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              position: 'absolute',
              top: 2,
              right: 2
            }}></div>
          </div>
        </div>
        
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
