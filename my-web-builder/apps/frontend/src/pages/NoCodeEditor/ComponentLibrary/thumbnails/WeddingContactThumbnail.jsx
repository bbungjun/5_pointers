import React from 'react';

function WeddingContactThumbnail({ label }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: '#1d2129',
        marginBottom: 2
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 11,
        color: '#65676b'
      }}>
        Drag to canvas
      </div>
    </div>
  );
}

export default WeddingContactThumbnail;
