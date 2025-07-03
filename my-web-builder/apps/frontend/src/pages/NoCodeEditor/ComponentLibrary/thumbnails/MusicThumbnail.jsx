import React from 'react';

function MusicThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: 8, 
      padding: 8,
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      {/* 상단 - 앨범 커버와 곡 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
        {/* 미니 앨범 커버 */}
        <div style={{
          width: 16,
          height: 16,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: '#fff'
        }}>
          🎵
        </div>
        
        {/* 곡 정보 */}
        <div style={{
          flex: 1,
          color: '#fff'
        }}>
          <div style={{
            fontSize: 6,
            fontWeight: 'bold',
            marginBottom: 1,
            opacity: 0.9
          }}>
            Wedding Song
          </div>
          <div style={{
            fontSize: 5,
            opacity: 0.7
          }}>
            Artist Name
          </div>
        </div>
      </div>
      
      {/* 중간 - 프로그레스 바 */}
      <div style={{
        width: '100%',
        height: 2,
        background: 'rgba(255,255,255,0.3)',
        borderRadius: 1,
        overflow: 'hidden',
        margin: '2px 0'
      }}>
        <div style={{
          width: '35%',
          height: '100%',
          background: '#fff',
          borderRadius: 1
        }}></div>
      </div>
      
      {/* 하단 - 컨트롤 버튼들 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6
      }}>
        {/* 이전 곡 */}
        <div style={{
          width: 8,
          height: 8,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 4,
          color: '#333',
          fontWeight: 'bold'
        }}>
          ⏮
        </div>
        
        {/* 재생/일시정지 (메인 버튼) */}
        <div style={{
          width: 12,
          height: 12,
          background: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 6,
          color: '#667eea',
          fontWeight: 'bold',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}>
          ▶
        </div>
        
        {/* 다음 곡 */}
        <div style={{
          width: 8,
          height: 8,
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 4,
          color: '#333',
          fontWeight: 'bold'
        }}>
          ⏭
        </div>
      </div>
      
      {/* 음파 애니메이션 효과 (장식용) */}
      <div style={{
        position: 'absolute',
        top: 4,
        right: 4,
        display: 'flex',
        alignItems: 'end',
        gap: 1,
        opacity: 0.6
      }}>
        <div style={{
          width: 1,
          height: 3,
          background: '#fff',
          borderRadius: 0.5
        }}></div>
        <div style={{
          width: 1,
          height: 5,
          background: '#fff',
          borderRadius: 0.5
        }}></div>
        <div style={{
          width: 1,
          height: 2,
          background: '#fff',
          borderRadius: 0.5
        }}></div>
        <div style={{
          width: 1,
          height: 4,
          background: '#fff',
          borderRadius: 0.5
        }}></div>
      </div>
    </div>
  );
}

export default MusicThumbnail;
