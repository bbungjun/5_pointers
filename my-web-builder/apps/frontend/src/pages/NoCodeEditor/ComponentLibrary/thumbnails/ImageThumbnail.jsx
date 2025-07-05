import React from 'react';

function ImageThumbnail() {
  return (
    <div style={{
      width: 100,  // 80 → 100
      height: 75,  // 60 → 75
      borderRadius: 8,  // 6 → 8
      border: '2px dashed #d1d5db',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      position: 'relative'
    }}>
      {/* 이미지 아이콘 - SVG 스타일 */}
      <div style={{
        width: 28,  // 24 → 28
        height: 28,  // 24 → 28
        backgroundColor: '#e5e7eb',
        borderRadius: 5,  // 4 → 5
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,  // 4 → 6
        position: 'relative'
      }}>
        {/* 산 모양 아이콘 */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',  // 4 → 5
          borderRight: '5px solid transparent',
          borderBottom: '7px solid #9ca3af',  // 6 → 7
          position: 'absolute',
          bottom: 3,  // 2 → 3
          left: 5  // 4 → 5
        }}></div>
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',  // 3 → 4
          borderRight: '4px solid transparent',
          borderBottom: '5px solid #9ca3af',  // 4 → 5
          position: 'absolute',
          bottom: 3,  // 2 → 3
          right: 5  // 4 → 5
        }}></div>
        
        {/* 태양 */}
        <div style={{
          width: 5,  // 4 → 5
          height: 5,  // 4 → 5
          borderRadius: '50%',
          backgroundColor: '#fbbf24',
          position: 'absolute',
          top: 4,  // 3 → 4
          right: 4  // 3 → 4
        }}></div>
      </div>
      
      {/* 텍스트 */}
      <div style={{
        fontSize: 9,  // 8 → 9
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 1.2
      }}>
        이미지 추가
      </div>
    </div>
  );
}

export default ImageThumbnail;
