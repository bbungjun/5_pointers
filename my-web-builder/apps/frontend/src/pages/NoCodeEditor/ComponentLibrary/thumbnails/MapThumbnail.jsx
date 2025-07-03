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
      {/* 지도 영역 */}
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
          <div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', left: '25%', top: 0, bottom: 0, width: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: '#9ca3af' }} />
          <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: 1, backgroundColor: '#9ca3af' }} />
        </div>
        
        {/* 물방울 모양 위치 마커 */}
        <div style={{
          position: 'relative',
          zIndex: 1
        }}>
          {/* 마커 핀 (물방울 모양) */}
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#ef4444',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            border: '1px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* 마커 내부 점 */}
            <div style={{
              width: 4,
              height: 4,
              backgroundColor: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)'
            }}></div>
          </div>
          
          {/* 마커 그림자 */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 2,
            width: 8,
            height: 3,
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '50%',
            filter: 'blur(1px)'
          }}></div>
        </div>
      </div>
      
      {/* 하단 - 기능 설명 */}
      <div style={{
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center'
      }}>
        주소 → 지도 표시
      </div>
    </div>
  );
}

export default MapThumbnail;
