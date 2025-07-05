import React from 'react';

function WeddingInviteThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 10
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#9ca3af',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 6
      }}>
        Our Love Story
      </div>
      
      {/* 중앙 - 안내장 내용 (회색 선들) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        {/* 첫 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '85%'
        }}></div>
        
        {/* 두 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '90%'
        }}></div>
        
        {/* 세 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '95%'
        }}></div>
        
        {/* 빈 줄 */}
        <div style={{ height: 4 }}></div>
        
        {/* 네 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '80%'
        }}></div>
        
        {/* 다섯 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '88%'
        }}></div>
        
        {/* 여섯 번째 줄 */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '92%'
        }}></div>
      </div>
    </div>
  );
}

export default WeddingInviteThumbnail;
