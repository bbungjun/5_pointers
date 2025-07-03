import React from 'react';

function MapThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#f0f9ff',
      borderRadius: 8,
      border: '1px solid #e0e7ff',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 지도 배경 패턴 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1
      }}>
        {/* 수평 격자선들 */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '12.5%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '37.5%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '62.5%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', height: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '87.5%', height: 1, backgroundColor: '#3b82f6' }} />
        
        {/* 수직 격자선들 */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '10%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '30%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '60%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '70%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '80%', width: 1, backgroundColor: '#3b82f6' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '90%', width: 1, backgroundColor: '#3b82f6' }} />
      </div>
      
      {/* 상단 - 지도 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#1e40af',
        textAlign: 'center',
        marginBottom: 4,
        zIndex: 1
      }}>
        지도
      </div>
      
      {/* 중앙 - 위치 마커와 도로 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        {/* 도로 라인들 */}
        <div style={{
          position: 'absolute',
          width: '80%',
          height: 2,
          backgroundColor: '#94a3b8',
          borderRadius: 1,
          top: '30%'
        }}></div>
        <div style={{
          position: 'absolute',
          width: 2,
          height: '60%',
          backgroundColor: '#94a3b8',
          borderRadius: 1,
          left: '40%'
        }}></div>
        
        {/* 위치 마커 */}
        <div style={{
          width: 16,
          height: 20,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* 마커 핀 */}
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#ef4444',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            border: '2px solid #fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
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
        </div>
      </div>
      
      {/* 하단 - 위치 정보 */}
      <div style={{
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center',
        zIndex: 1
      }}>
        위치 표시
      </div>
    </div>
  );
}

export default MapThumbnail;
