import React, { useEffect, useRef } from "react";

export default function KakaoTalkShareRenderer({ comp, isEditor }) {
  const { title, description, imageUrl, buttonTitle } = comp.props;
  const isInitialized = useRef(false);

  // 디버깅: isEditor 값 확인 (SSR 안전)
  useEffect(() => {
    console.log('KakaoTalkShareRenderer - isEditor:', isEditor);
    console.log('KakaoTalkShareRenderer - window.location.href:', window.location.href);
  }, [isEditor]);

  useEffect(() => {
    // 배포 환경(Next.js)에서만 카카오 SDK 초기화
    if (!isEditor && typeof window !== "undefined" && window.Kakao && !isInitialized.current) {
      const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || 'abf280bb54e158e4414d83da34cfbd83';

      console.log('카카오 SDK 초기화 시도 - KAKAO_JS_KEY:', KAKAO_JS_KEY);

      if (KAKAO_JS_KEY && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
        console.log('카카오 SDK 초기화 완료');
      }
      isInitialized.current = true;
    }
  }, [isEditor]);

  const handleShare = () => {
    console.log('handleShare 클릭 - isEditor:', isEditor);

    // 명시적으로 true인 경우만 에디터로 판단
    if (isEditor === true) {
      alert("카카오톡 공유는 배포된 페이지에서만 사용할 수 있습니다.");
      return;
    }

    if (typeof window !== "undefined" && window.Kakao && window.Kakao.isInitialized()) {
      console.log('카카오 공유 실행 시작');

      window.Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: title || "페이지 제목",
          description: description || "페이지 설명",
          imageUrl: imageUrl || "https://via.placeholder.com/500x400/FFE500/000000?text=My+Website",
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: buttonTitle || "웹사이트 보기",
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
        ],
      });

      console.log('카카오 공유 실행 완료');
    }
  };

  return (
    <button onClick={handleShare} style={{
      padding: '8px 16px',
      backgroundColor: '#FEE500',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    }}>
      {buttonTitle || "카카오톡 공유"}
    </button>
  );

  // return (
  //   <button
  //     onClick={handleShare}
  //     style={{
  //       width: comp.width ? `${comp.width}px` : undefined,
  //       height: comp.height ? `${comp.height}px` : undefined,
  //       padding: '8px 16px',
  //       backgroundColor: '#FEE500',
  //       border: 'none',
  //       borderRadius: '4px',
  //       cursor: 'pointer',
  //       fontSize: '14px',
  //       boxSizing: 'border-box',
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center'
  //     }}
  //   >
  //     {buttonTitle || "카카오톡 공유"}
  //   </button>
  // );
}