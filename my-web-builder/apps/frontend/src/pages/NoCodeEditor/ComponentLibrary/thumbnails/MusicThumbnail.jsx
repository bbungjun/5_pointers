import React from 'react';

function MusicThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* 음악 재생 버튼 */}
      <div style={{
        width: 40,
        height: 40,
        backgroundColor: '#3b82f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        fontSize: 20,
        color: '#ffffff'
      }}>
        􀊖
      </div>
    </div>
  );
}

export default MusicThumbnail;
