import React from 'react';

function BankAccountThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: '#fff', 
      border: '1px solid #ddd',
      borderRadius: 6, 
      padding: 4, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: 2, 
      fontSize: 6, 
      lineHeight: 1.1
    }}>
      <div style={{
        background: '#f3f4f6', 
        borderRadius: 3, 
        padding: '2px 4px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <span style={{ fontSize: 6, color: '#374151' }}>신랑 측 계좌</span>
        <span style={{ fontSize: 5 }}>▼</span>
      </div>
      <div style={{
        background: '#f3f4f6', 
        borderRadius: 3, 
        padding: '2px 4px',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <span style={{ fontSize: 6, color: '#374151' }}>신부 측 계좌</span>
        <span style={{ fontSize: 5 }}>▼</span>
      </div>
    </div>
  );
}

export default BankAccountThumbnail;
