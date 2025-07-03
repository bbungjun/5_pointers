import React from 'react';

function DdayThumbnail() {
  return (
    <div style={{
      width: 70, 
      height: 50, 
      background: '#fff', 
      border: '1px solid #ddd',
      borderRadius: 6, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: 8,
      color: '#666', 
      textAlign: 'center'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 10 }}>D-DAY</div>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3B4EFF' }}>-30</div>
    </div>
  );
}

export default DdayThumbnail;
