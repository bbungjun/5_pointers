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
    // 배포 환경에서만 카카오 SDK 초기화
    if (!isEditor && typeof window !== "undefined" && window.Kakao && !isInitialized.current) {
      // 환경 변수 안전하게 접근
      let KAKAO_JS_KEY = 'abf280bb54e158e4414d83da34cfbd83'; // 기본값
      
      try {
        // 브라우저 환경에서 환경 변수 접근 시도
        if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
          KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        }
      } catch (error) {
        console.log('환경 변수 접근 실패, 기본값 사용:', error);
      }

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
    <button 
      onClick={handleShare} 
      style={{
        width: '100%',
        height: '100%',
        padding: 0,
        backgroundColor: '#FEE500',
        color: '#191600', 
        border: '1px solid #FEE500',
        borderRadius: 0,
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(189, 181, 166, 0.2)',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}
      // onMouseEnter={(e) => {
      //   e.target.style.backgroundColor = '#A6A099';
      //   e.target.style.transform = 'translateY(-1px)';
      //   e.target.style.boxShadow = '0 4px 12px rgba(189, 181, 166, 0.3)';
      // }}
      // onMouseLeave={(e) => {
      //   e.target.style.backgroundColor = '#BDB5A6';
      //   e.target.style.transform = 'translateY(0)';
      //   e.target.style.boxShadow = '0 2px 8px rgba(189, 181, 166, 0.2)';
      // }}
    >
      <span style={{
        fontSize: '18px',
        marginRight: '4px'
      }}></span>
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