import React from 'react';

function LinkCopyThumbnail({ label }) {
  return (
    <div style={{
      width: 80,
      height: 50,
      background: '#f5f6fa',
      border: '1px solid #e0e0e0',
      borderRadius: 6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 7,
      color: '#222',
      textAlign: 'center',
      lineHeight: 1.2,
      fontFamily: '"Noto Sans KR", "맑은 고딕", "Malgun Gothic", sans-serif'
    }}>
      <div style={{ fontSize: 14, marginBottom: 2 }}>🔗</div>
      <div style={{ fontWeight: 'bold', fontSize: 8 }}>링크복사</div>
      <div style={{ fontSize: 6 }}>Link Copy</div>
    </div>
  );
}

export default LinkCopyThumbnail;