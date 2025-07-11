import React from 'react';

function KakaoTalkShareThumbnail({ label }) {
  return (
    <div style={{
      width: 80, 
      height: 50, 
      background: '#FEE500', 
      border: '1px solid #FEE500',
      borderRadius: 6, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: 7,
      color: '#3c1e1e', 
      textAlign: 'center', 
      lineHeight: 1.2,
      fontFamily: '"Noto Sans KR", "맑은 고딕", "Malgun Gothic", sans-serif'
    }}>
      <div style={{ fontSize: 12, marginBottom: 2 }}>💬</div>
      <div style={{ fontWeight: 'bold', fontSize: 8 }}>카카오톡</div>
      <div style={{ fontSize: 6 }}>공유하기</div>
    </div>
  );
}

export default KakaoTalkShareThumbnail;
