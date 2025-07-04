import React from 'react';

function ButtonThumbnail() {
  return (
    <div style={{
      width: 100,  // 60 → 100
      height: 75,  // 24 → 75
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 80,  // 60 → 80
        height: 32,  // 24 → 32
        background: '#3B4EFF', 
        color: '#fff',
        borderRadius: 6,  // 4 → 6
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: 12,  // 10 → 12
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(59, 78, 255, 0.2)'
      }}>
        Button
      </div>
    </div>
  );
}

export default ButtonThumbnail;
