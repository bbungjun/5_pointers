import React from 'react';

function TextThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 4
    }}>
      <div style={{
        fontSize: 14,  // 12 → 14
        color: '#333', 
        fontWeight: 'bold',
        textAlign: 'center', 
        lineHeight: 1.2
      }}>
        Sample Text
      </div>
      <div style={{
        fontSize: 10,
        color: '#666',
        textAlign: 'center'
      }}>
        텍스트 컴포넌트
      </div>
    </div>
  );
}

export default TextThumbnail;
