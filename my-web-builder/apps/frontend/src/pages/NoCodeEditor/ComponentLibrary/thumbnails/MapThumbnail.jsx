import React from 'react';

function MapThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#e8f4f8',  // 연한 청록색 (물/바다 느낌)
      borderRadius: 8,
      border: '1px solid #d1d5db',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* 지형 영역들 */}
      {/* 육지 영역 1 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 15,
        width: 35,
        height: 25,
        backgroundColor: '#f3f4f6',  // 연한 회색 (육지)
        borderRadius: '8px 12px 6px 10px',
        border: '1px solid #d6d3d1'
      }}></div>
      
      {/* 육지 영역 2 */}
      <div style={{
        position: 'absolute',
        top: 25,
        right: 12,
        width: 28,
        height: 20,
        backgroundColor: '#f3f4f6',
        borderRadius: '6px 8px 10px 4px',
        border: '1px solid #d6d3d1'
      }}></div>
      
      {/* 공원/녹지 영역 */}
      <div style={{
        position: 'absolute',
        top: 45,
        left: 20,
        width: 25,
        height: 15,
        backgroundColor: '#dcfce7',  // 연한 초록 (공원)
        borderRadius: '4px 6px 8px 3px',
        border: '1px solid #bbf7d0'
      }}></div>
      
      {/* 도로들 */}
      {/* 주요 도로 (수평) */}
      <div style={{
        position: 'absolute',
        top: 35,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#fbbf24',  // 노란색 도로
        border: '1px solid #f59e0b'
      }}></div>
      
      {/* 주요 도로 (수직) */}
      <div style={{
        position: 'absolute',
        left: 45,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: '#fbbf24',
        border: '1px solid #f59e0b'
      }}></div>
      
      {/* 보조 도로들 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 10,
        width: 30,
        height: 2,
        backgroundColor: '#e5e7eb',
        borderRadius: 1
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: 50,
        right: 15,
        width: 25,
        height: 2,
        backgroundColor: '#e5e7eb',
        borderRadius: 1
      }}></div>
      
      {/* 위치 마커 */}
      <div style={{
        position: 'absolute',
        top: 28,
        left: 42,
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderBottom: '10px solid #dc2626',  // 빨간 마커
        zIndex: 10
      }}>
        {/* 마커 내부 점 */}
        <div style={{
          position: 'absolute',
          top: 6,
          left: -2,
          width: 4,
          height: 4,
          backgroundColor: '#fff',
          borderRadius: '50%'
        }}></div>
      </div>
      
      {/* 마커 그림자 */}
      <div style={{
        position: 'absolute',
        top: 38,
        left: 44,
        width: 8,
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '50%',
        filter: 'blur(1px)'
      }}></div>
      
      {/* 상단 제목 오버레이 */}
      <div style={{
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: 8,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        backdropFilter: 'blur(2px)'
      }}>
        지도
      </div>
      
      {/* 하단 위치 정보 오버레이 */}
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 4,
        padding: '2px 6px',
        fontSize: 7,
        color: '#fff',
        textAlign: 'center'
      }}>
        📍 위치 표시
      </div>
    </div>
  );
}

export default MapThumbnail;
