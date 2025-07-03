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
        계좌 정보
      </div>
      
      {/* 중앙 - 드롭다운 버튼들 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 3
      }}>
        {/* 신랑 측 드롭다운 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          padding: '3px 5px',
          fontSize: 7,
          color: '#374151'
        }}>
          <span>신랑 측 계좌번호</span>
          <span style={{
            fontSize: 5,
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
          borderRadius: 3,
          padding: '3px 5px',
          fontSize: 7,
          color: '#374151'
        }}>
          <span>신부 측 계좌번호</span>
          <span style={{
            fontSize: 5,
            color: '#6b7280'
          }}>
            ▼
          </span>
        </div>
      </div>
      
      {/* 하단 - 계좌 정보 미리보기 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginTop: 4
      }}>
        {/* 계좌 정보 (회색 선들) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* 은행명 라인 */}
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: 24
          }}></div>
          {/* 계좌번호 라인 */}
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: 32
          }}></div>
        </div>
        
        {/* 복사 버튼 */}
        <div style={{
          width: 16,
          height: 8,
          backgroundColor: '#374151',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 5,
          color: '#ffffff',
          fontWeight: '500'
        }}>
          복사
        </div>
      </div>
    </div>
  );
}

export default BankAccountThumbnail;
