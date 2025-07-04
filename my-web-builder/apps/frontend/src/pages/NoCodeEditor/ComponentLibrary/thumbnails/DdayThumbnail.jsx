import React from 'react';

function DdayThumbnail() {
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
      gap: 8
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center'
      }}>
        D-DAY
      </div>
      
      {/* 카운트다운 블록들 (크기 확대) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4  // 3 → 4로 확대
      }}>
        {/* 일 블록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3  // 2 → 3으로 확대
        }}>
          <div style={{
            width: 16,  // 14 → 16으로 확대
            height: 14, // 12 → 14로 확대
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,  // 7 → 8로 확대
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            15
          </div>
          <div style={{
            fontSize: 6,  // 5 → 6으로 확대
            color: '#64748b',
            fontWeight: '500'
          }}>
            DAYS
          </div>
        </div>
        
        {/* 시 블록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <div style={{
            width: 16,
            height: 14,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            08
          </div>
          <div style={{
            fontSize: 6,
            color: '#64748b',
            fontWeight: '500'
          }}>
            HRS
          </div>
        </div>
        
        {/* 분 블록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <div style={{
            width: 16,
            height: 14,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            42
          </div>
          <div style={{
            fontSize: 6,
            color: '#64748b',
            fontWeight: '500'
          }}>
            MIN
          </div>
        </div>
        
        {/* 초 블록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <div style={{
            width: 16,
            height: 14,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            30
          </div>
          <div style={{
            fontSize: 6,
            color: '#64748b',
            fontWeight: '500'
          }}>
            SEC
          </div>
        </div>
      </div>
    </div>
  );
}

export default DdayThumbnail;
