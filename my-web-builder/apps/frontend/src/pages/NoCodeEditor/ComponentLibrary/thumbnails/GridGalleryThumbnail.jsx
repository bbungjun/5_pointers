import React from 'react';

function GridGalleryThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12
    }}>
      {/* 2x2 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
        width: 48,
        height: 36
      }}>
        {/* 그리드 셀들 */}
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 3,
          border: '1px solid #e2e8f0'
        }}></div>
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 3,
          border: '1px solid #e2e8f0'
        }}></div>
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 3,
          border: '1px solid #e2e8f0'
        }}></div>
        <div style={{
          backgroundColor: '#f1f5f9',
          borderRadius: 3,
          border: '1px solid #e2e8f0'
        }}></div>
      </div>
    </div>
  );
}

export default GridGalleryThumbnail;
