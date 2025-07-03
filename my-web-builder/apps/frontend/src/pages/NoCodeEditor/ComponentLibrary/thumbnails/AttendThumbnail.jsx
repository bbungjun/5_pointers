import React from 'react';

function AttendThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: '#fff', 
      border: '1px solid #ddd',
      borderRadius: 6, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: 8,
      color: '#666', 
      textAlign: 'center', 
      lineHeight: 1.2
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 2 }}>참석 의사</div>
      <div style={{ 
        background: '#3B4EFF', 
        color: '#fff', 
        padding: '2px 6px', 
        borderRadius: 2, 
        fontSize: 7 
      }}>
        전달하기
      </div>
    </div>
  );
}

export default AttendThumbnail;
