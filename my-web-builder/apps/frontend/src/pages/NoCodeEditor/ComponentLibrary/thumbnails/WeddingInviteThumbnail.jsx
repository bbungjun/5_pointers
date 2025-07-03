import React from 'react';
import WeddingInviteRenderer from '../../ComponentRenderers/WeddingInviteRenderer';

function WeddingInviteThumbnail() {
  // 썸네일용 축소된 props
  const thumbnailProps = {
    props: {
      containerWidth: 320,
      containerHeight: 240,
      title: "Our Love Story",
      titleFontFamily: "Dancing Script, cursive, Noto Sans KR, 맑은 고딕, sans-serif",
      titleFontSize: 12, // 축소
      titleFontStyle: "italic",
      titleColor: "#222",
      titleAlign: "center",
      
      content: [
        "서로가 마주보며 다져온 사랑을",
        "이제 함께 한 곳을 바라보며",
        "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
        "",
        "저희 두 사람이 사랑의 이름으로",
        "지켜나갈 수 있게 앞날을",
        "축복해 주시면 감사하겠습니다."
      ],
      contentFontFamily: "Noto Sans KR, 맑은 고딕, sans-serif",
      contentFontSize: 6, // 축소
      contentFontWeight: "normal",
      contentColor: "#444",
      contentAlign: "center",
      backgroundColor: "#fff"
    }
  };

  return (
    <div style={{
      width: 80,
      height: 60,
      overflow: 'hidden',
      borderRadius: 4,
      border: '1px solid #e1e5e9',
      position: 'relative',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 320, // 실제 렌더러 크기
        height: 240, // 실제 렌더러 크기
        transform: 'scale(0.25)', // 25%로 축소 (80/320 = 0.25)
        transformOrigin: 'top left'
      }}>
        <WeddingInviteRenderer comp={thumbnailProps} />
      </div>
    </div>
  );
}

export default WeddingInviteThumbnail;
