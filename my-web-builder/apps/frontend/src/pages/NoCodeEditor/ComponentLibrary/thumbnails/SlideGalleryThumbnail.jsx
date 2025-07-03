import React from 'react';

function SlideGalleryThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: '#f8f9fa', 
      border: '1px solid #e1e5e9',
      borderRadius: 4, 
      padding: 6,
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 메인 슬라이드 영역 */}
      <div style={{
        flex: 1,
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden'
      }}>
        {/* 현재 보이는 슬라이드 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#fff',
          fontWeight: 'bold'
        }}>
          🖼️
        </div>
        
        {/* 다음 슬라이드 (살짝 보이는 효과) */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: '-60%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: '#fff',
          fontWeight: 'bold',
          opacity: 0.7
        }}>
          🖼️
        </div>
        
        {/* 좌측 화살표 */}
        <div style={{
          position: 'absolute',
          left: 2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 6,
          color: '#333',
          fontWeight: 'bold'
        }}>
          ‹
        </div>
        
        {/* 우측 화살표 */}
        <div style={{
          position: 'absolute',
          right: 2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 6,
          color: '#333',
          fontWeight: 'bold'
        }}>
          ›
        </div>
      </div>
      
      {/* 하단 인디케이터 점들 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        marginTop: 4,
        height: 8
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: '#3B4EFF'
        }}></div>
        <div style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: '#ccc'
        }}></div>
        <div style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: '#ccc'
        }}></div>
        <div style={{
          width: 3,
          height: 3,
          borderRadius: '50%',
          background: '#ccc'
        }}></div>
      </div>
    </div>
  );
}

export default SlideGalleryThumbnail;
