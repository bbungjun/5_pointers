import React from 'react';

/**
 * RectangleLayerThumbnail - 사각형 레이어 컴포넌트의 썸네일
 * 
 * 컴포넌트 라이브러리에서 사각형 레이어 컴포넌트를 표시하는 썸네일
 */
function RectangleLayerThumbnail() {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#666',
      border: '1px dashed #ccc',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        bottom: '4px',
        right: '4px',
        width: '10px',
        height: '10px',
        backgroundColor: '#ddd',
        borderRadius: '2px'
      }} />
      <div>사각형 레이어</div>
    </div>
  );
}

export default RectangleLayerThumbnail;