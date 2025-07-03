import React from 'react';

function MapThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      padding: 8,
      gap: 4
    }}>
      {/* 상단 - 주소 입력 필드 */}
      <div style={{
        height: 16,
        backgroundColor: '#f9fafb',
        border: '1px solid #d1d5db',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 6,
        paddingRight: 6
      }}>
        <div style={{
          fontSize: 7,
          color: '#9ca3af',
          flex: 1
        }}>
          주소를 입력하세요
        </div>
        <div style={{
          fontSize: 8,
          color: '#6b7280'
        }}>
          🔍
        </div>
      </div>
      
      {/* 중앙 - 지도 영역 */}
      <div style={{
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* 지도 격자 (미세하게) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1
        }}>
          <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, backgroundColor: '#9ca3af' }} />
        </div>
        
        {/* 위치 마커 */}
        <div style={{
          fontSize: 14,
          color: '#ef4444',
          zIndex: 1
        }}>
          📍
        </div>
      </div>
      
      {/* 하단 - 기능 설명 */}
      <div style={{
        fontSize: 7,
        color: '#64748b',
        textAlign: 'center'
      }}>
        주소 → 지도 표시
      </div>
    </div>
  );
}

export default MapThumbnail;
