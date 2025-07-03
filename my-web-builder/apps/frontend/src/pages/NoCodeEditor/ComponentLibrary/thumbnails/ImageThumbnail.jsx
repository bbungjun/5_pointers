import React from 'react';

function ImageThumbnail() {
  return (
    <div style={{
      width: 60, 
      height: 40, 
      background: '#f3f4f6', 
      border: '1px solid #ddd',
      borderRadius: 4, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: 20,
      color: '#9ca3af'
    }}>
      🖼️
    </div>
  );
}

export default ImageThumbnail;
