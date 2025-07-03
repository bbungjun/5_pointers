import React from 'react';

function MapThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 8,
      position: 'relative'
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        marginBottom: 4
      }}>
        지도
      </div>
      
      {/* 중앙 - 간단한 지도 모양 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* 지도 배경 */}
        <div style={{
          width: 60,
          height: 40,
          backgroundColor: '#e2e8f0',
          borderRadius: 6,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* 위치 마커 */}
          <div style={{
            fontSize: 16,
            color: '#ef4444'
          }}>
            📍
          </div>
        </div>
      </div>
      
      {/* 하단 - 설명 */}
      <div style={{
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center'
      }}>
        위치 표시
      </div>
    </div>
  );
}

export default MapThumbnail;
