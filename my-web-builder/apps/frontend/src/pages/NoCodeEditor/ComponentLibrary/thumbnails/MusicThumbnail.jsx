import React from 'react';

function MusicThumbnail() {
  return (
    <div style={{
      width: 100,  // 80 → 100
      height: 75,  // 60 → 75
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderRadius: 10,  // 8 → 10
      padding: 10,  // 8 → 10
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      boxShadow: '0 3px 10px rgba(0,0,0,0.15)'  // 그림자 확대
    }}>
      {/* 상단 - 앨범 커버와 곡 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5  // 4 → 5
      }}>
        {/* 미니 앨범 커버 */}
        <div style={{
          width: 18,  // 16 → 18
          height: 18,  // 16 → 18
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 3,  // 2 → 3
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 9,  // 8 → 9
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
            fontSize: 7,  // 6 → 7
            fontWeight: 'bold',
            marginBottom: 1,
            opacity: 0.9
          }}>
            Wedding Song
          </div>
          <div style={{
            fontSize: 6,  // 5 → 6
            opacity: 0.7
          }}>
            Artist Name
          </div>
        </div>
      </div>
      
      {/* 중간 - 프로그레스 바 */}
      <div style={{
        width: '100%',
        height: 3,  // 2 → 3
        background: 'rgba(255,255,255,0.3)',
        borderRadius: 1.5,
        overflow: 'hidden',
        margin: '3px 0'  // 2px → 3px
      }}>
        <div style={{
          width: '35%',
          height: '100%',
          background: '#fff',
          borderRadius: 1.5
        }}></div>
      </div>
      
      {/* 하단 - 컨트롤 버튼들 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8  // 6 → 8
      }}>
        {/* 이전 곡 */}
        <div style={{
          width: 10,  // 8 → 10
          height: 10,  // 8 → 10
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 5,  // 4 → 5
          color: '#333',
          fontWeight: 'bold'
        }}>
          ⏮
        </div>
        
        {/* 재생/일시정지 (메인 버튼) */}
        <div style={{
          width: 14,  // 12 → 14
          height: 14,  // 12 → 14
          background: '#fff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 7,  // 6 → 7
          color: '#667eea',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          ▶
        </div>
        
        {/* 다음 곡 */}
        <div style={{
          width: 10,  // 8 → 10
          height: 10,  // 8 → 10
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 5,  // 4 → 5
          color: '#333',
          fontWeight: 'bold'
        }}>
          ⏭
        </div>
      </div>
      
      {/* 음파 애니메이션 효과 (장식용) */}
      <div style={{
        position: 'absolute',
        top: 5,  // 4 → 5
        right: 5,  // 4 → 5
        display: 'flex',
        alignItems: 'end',
        gap: 1,
        opacity: 0.6
      }}>
        <div style={{
          width: 1.5,  // 1 → 1.5
          height: 4,  // 3 → 4
          background: '#fff',
          borderRadius: 0.75
        }}></div>
        <div style={{
          width: 1.5,  // 1 → 1.5
          height: 6,  // 5 → 6
          background: '#fff',
          borderRadius: 0.75
        }}></div>
        <div style={{
          width: 1.5,  // 1 → 1.5
          height: 3,  // 2 → 3
          background: '#fff',
          borderRadius: 0.75
        }}></div>
        <div style={{
          width: 1.5,  // 1 → 1.5
          height: 5,  // 4 → 5
          background: '#fff',
          borderRadius: 0.75
        }}></div>
      </div>
    </div>
  );
}

export default MusicThumbnail;
