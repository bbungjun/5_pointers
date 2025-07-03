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
      justifyContent: 'space-between',
      padding: 8
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        marginBottom: 4
      }}>
        D-DAY
      </div>
      
      {/* 중앙 - 카운트다운 블록들 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3
      }}>
        {/* 일 블록 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <div style={{
            width: 14,
            height: 12,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 7,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            15
          </div>
          <div style={{
            fontSize: 5,
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
          gap: 2
        }}>
          <div style={{
            width: 14,
            height: 12,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 7,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            08
          </div>
          <div style={{
            fontSize: 5,
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
          gap: 2
        }}>
          <div style={{
            width: 14,
            height: 12,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 7,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            42
          </div>
          <div style={{
            fontSize: 5,
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
          gap: 2
        }}>
          <div style={{
            width: 14,
            height: 12,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 7,
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            30
          </div>
          <div style={{
            fontSize: 5,
            color: '#64748b',
            fontWeight: '500'
          }}>
            SEC
          </div>
        </div>
      </div>
      
      {/* 하단 - 설명 */}
      <div style={{
        fontSize: 8,
        color: '#64748b',
        textAlign: 'center'
      }}>
        결혼식까지 남은 시간
      </div>
    </div>
  );
}

export default DdayThumbnail;
