import React from 'react';

function WeddingContactThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
      gap: 6
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center'
      }}>
        연락처
      </div>
      
      {/* 중앙 - 연락처 카드들 */}
      <div style={{
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }}>
        {/* 신랑 카드 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          {/* 프로필 아이콘 */}
          <div style={{
            width: 20,
            height: 20,
            backgroundColor: '#dbeafe',
            border: '1px solid #bfdbfe',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: '#3b82f6'
          }}>
            👤
          </div>
          
          {/* 이름 */}
          <div style={{
            fontSize: 7,
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'center'
          }}>
            신랑
          </div>
          
          {/* 연락처 정보 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <div style={{
              width: 16,
              height: 2,
              backgroundColor: '#e2e8f0',
              borderRadius: 1
            }}></div>
            <div style={{
              width: 12,
              height: 2,
              backgroundColor: '#e2e8f0',
              borderRadius: 1
            }}></div>
          </div>
        </div>
        
        {/* 구분선 */}
        <div style={{
          width: 1,
          height: 30,
          backgroundColor: '#e5e7eb'
        }}></div>
        
        {/* 신부 카드 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          {/* 프로필 아이콘 */}
          <div style={{
            width: 20,
            height: 20,
            backgroundColor: '#fce7f3',
            border: '1px solid #f9a8d4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            color: '#ec4899'
          }}>
            👤
          </div>
          
          {/* 이름 */}
          <div style={{
            fontSize: 7,
            fontWeight: '600',
            color: '#1e293b',
            textAlign: 'center'
          }}>
            신부
          </div>
          
          {/* 연락처 정보 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <div style={{
              width: 16,
              height: 2,
              backgroundColor: '#e2e8f0',
              borderRadius: 1
            }}></div>
            <div style={{
              width: 12,
              height: 2,
              backgroundColor: '#e2e8f0',
              borderRadius: 1
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeddingContactThumbnail;
