import React from 'react';

function ImageThumbnail() {
  return (
    <div style={{
      width: 80,
      height: 60,
      borderRadius: 6,
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
        width: 24,
        height: 24,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        position: 'relative'
      }}>
        {/* 산 모양 아이콘 */}
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderBottom: '6px solid #9ca3af',
          position: 'absolute',
          bottom: 2,
          left: 4
        }}></div>
        <div style={{
          width: 0,
          height: 0,
          borderLeft: '3px solid transparent',
          borderRight: '3px solid transparent',
          borderBottom: '4px solid #9ca3af',
          position: 'absolute',
          bottom: 2,
          right: 4
        }}></div>
        
        {/* 태양 */}
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: '#fbbf24',
          position: 'absolute',
          top: 3,
          right: 3
        }}></div>
      </div>
      
      {/* 텍스트 */}
      <div style={{
        fontSize: 8,
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
