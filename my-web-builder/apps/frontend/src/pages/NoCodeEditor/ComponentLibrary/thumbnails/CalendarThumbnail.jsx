import React from 'react';

function CalendarThumbnail() {
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
      <div style={{ fontSize: 16, marginBottom: 2 }}>📅</div>
      <div style={{ fontWeight: 'bold', fontSize: 7 }}>Wedding Calendar</div>
    </div>
  );
}

export default CalendarThumbnail;
