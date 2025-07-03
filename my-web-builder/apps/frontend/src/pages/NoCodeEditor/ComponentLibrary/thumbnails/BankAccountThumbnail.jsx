import React from 'react';

function BankAccountThumbnail() {
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
        계좌 정보
      </div>
      
      {/* 드롭다운 버튼들 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        {/* 신랑 측 드롭다운 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          padding: '4px 6px',
          fontSize: 7,
          color: '#374151'
        }}>
          <span>신랑 측 계좌번호</span>
          <span style={{
            fontSize: 6,
            color: '#6b7280'
          }}>
            ▼
          </span>
        </div>
        
        {/* 신부 측 드롭다운 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          padding: '4px 6px',
          fontSize: 7,
          color: '#374151'
        }}>
          <span>신부 측 계좌번호</span>
          <span style={{
            fontSize: 6,
            color: '#6b7280'
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {/* 하단 - 계좌 정보 미리보기 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        marginTop: 2
      }}>
        {/* 은행 아이콘 */}
        <div style={{
          width: 12,
          height: 8,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 5
        }}>
          🏦
        </div>
        
        {/* 계좌번호 표시 */}
        <div style={{
          display: 'flex',
          gap: 1
        }}>
          <div style={{
            width: 8,
            height: 2,
            backgroundColor: '#e2e8f0',
            borderRadius: 1
          }}></div>
          <div style={{
            width: 6,
            height: 2,
            backgroundColor: '#e2e8f0',
            borderRadius: 1
          }}></div>
          <div style={{
            width: 10,
            height: 2,
            backgroundColor: '#e2e8f0',
            borderRadius: 1
          }}></div>
        </div>
        
        {/* 복사 버튼 */}
        <div style={{
          width: 12,
          height: 6,
          backgroundColor: '#374151',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 4,
          color: '#ffffff'
        }}>
          복사
        </div>
      </div>
    </div>
  );
}

export default BankAccountThumbnail;
