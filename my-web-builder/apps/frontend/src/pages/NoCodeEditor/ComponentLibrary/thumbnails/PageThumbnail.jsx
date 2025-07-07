import React from 'react';

const PageThumbnail = () => {
  return (
    <div style={{
      width: '80px',
      height: '60px',
      backgroundColor: '#f8f9fa',
      border: '2px solid #007bff',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      cursor: 'grab'
    }}>
      <div style={{ fontSize: '20px' }}>📄</div>
      <div style={{ 
        fontSize: '10px', 
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'center'
      }}>
        Page
      </div>
    </div>
  );
};

export default PageThumbnail;
