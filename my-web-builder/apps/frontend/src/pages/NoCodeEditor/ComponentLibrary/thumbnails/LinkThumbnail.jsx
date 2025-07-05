import React from 'react';

function LinkThumbnail() {
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
        color: '#3B4EFF', 
        textDecoration: 'underline',
        textAlign: 'center',
        fontWeight: '500'
      }}>
        Link Text
      </div>
      <div style={{
        fontSize: 10,
        color: '#666',
        textAlign: 'center'
      }}>
        클릭 가능한 링크
      </div>
    </div>
  );
}

export default LinkThumbnail;
