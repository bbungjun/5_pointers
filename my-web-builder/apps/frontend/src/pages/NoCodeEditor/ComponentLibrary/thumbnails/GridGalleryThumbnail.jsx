import React from 'react';

function GridGalleryThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: '#f8f9fa', 
      border: '1px solid #e1e5e9',
      borderRadius: 4, 
      padding: 4,
      display: 'flex', 
      flexDirection: 'column',
      gap: 2
    }}>
      {/* 상단 행 - 2개 이미지 */}
      <div style={{
        display: 'flex',
        gap: 2,
        height: '48%'
      }}>
        <div style={{
          flex: 1,
          background: '#e3f2fd',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: '#1976d2'
        }}>
          🖼️
        </div>
        <div style={{
          flex: 1,
          background: '#f3e5f5',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: '#7b1fa2'
        }}>
          🖼️
        </div>
      </div>
      
      {/* 하단 행 - 2개 이미지 */}
      <div style={{
        display: 'flex',
        gap: 2,
        height: '48%'
      }}>
        <div style={{
          flex: 1,
          background: '#e8f5e8',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: '#2e7d32'
        }}>
          🖼️
        </div>
        <div style={{
          flex: 1,
          background: '#fff3e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: '#f57c00'
        }}>
          🖼️
        </div>
      </div>
    </div>
  );
}

export default GridGalleryThumbnail;
