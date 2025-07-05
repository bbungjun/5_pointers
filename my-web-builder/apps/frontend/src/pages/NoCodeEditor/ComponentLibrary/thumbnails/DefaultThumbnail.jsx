import React from 'react';

function DefaultThumbnail({ label }) {
  return (
    <div style={{
      width: 60,
      height: 40,
      background: '#f8f9fa',
      border: '1px solid #e1e5e9',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      color: '#65676b',
      textAlign: 'center'
    }}>
      {label}
    </div>
  );
}

export default DefaultThumbnail;
