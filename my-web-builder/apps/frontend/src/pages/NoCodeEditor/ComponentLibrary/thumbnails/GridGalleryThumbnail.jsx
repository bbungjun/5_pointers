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
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 8
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        marginBottom: 4
      }}>
        그리드 갤러리
      </div>
      
      {/* 중앙 - 2x2 그리드 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        justifyContent: 'center'
      }}>
        {/* 상단 행 */}
        <div style={{
          display: 'flex',
          gap: 3,
          height: '48%'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            color: '#9ca3af'
          }}>
            🖼️
          </div>
          <div style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            color: '#9ca3af'
          }}>
            🖼️
          </div>
        </div>
        
        {/* 하단 행 */}
        <div style={{
          display: 'flex',
          gap: 3,
          height: '48%'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            color: '#9ca3af'
          }}>
            🖼️
          </div>
          <div style={{
            flex: 1,
            backgroundColor: '#f3f4f6',
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            color: '#9ca3af'
          }}>
            🖼️
          </div>
        </div>
      </div>
      
      {/* 하단 - 설명 */}
      <div style={{
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center'
      }}>
        격자형 사진 배치
      </div>
    </div>
  );
}

export default GridGalleryThumbnail;
