import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';

const PREVIEW_CSS = `
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    width: 100%;
    overflow-x: hidden;
  }
  #preview-root {
    width: 100%;
    min-height: 100%;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }
  .mobile-viewport {
    width: 375px;
    min-height: 812px;
    height: auto;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    margin: 0;
    padding: 0;
    /* 스크롤바 완전히 숨기기 */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .desktop-viewport {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
    /* 스크롤바 완전히 숨기기 */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* 모든 뷰포트에서 스크롤바 숨기기 */
  .mobile-viewport::-webkit-scrollbar,
  .desktop-viewport::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
    display: none;
  }
  
  /* iframe 내부의 모든 스크롤바 숨기기 */
  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
    display: none;
  }
  
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const PreviewModal = ({
  isOpen,
  onClose,
  components = [],
  editingViewport = 'desktop',
  templateCategory,
  pageId,
}) => {
  const [viewMode, setViewMode] = useState(editingViewport);
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const iframeContainerRef = useRef(null);

  // editingViewport 변경 시 viewMode 동기화
  useEffect(() => {
    setViewMode(editingViewport === 'mobile' ? 'mobile' : 'desktop');
  }, [editingViewport]);

  // ❗️ 이 useEffect 하나로 모든 것을 처리합니다. (수정된 최종 버전)
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;

    const iframe = iframeRef.current;
    let isMounted = true; // 클린업 후 비동기 작업 방지 플래그

    const renderIframeContent = () => {
      // isMounted 플래그를 확인하여 이미 unmount된 후에는 실행되지 않도록 함
      if (!isMounted || !iframe.contentDocument) return;

      const iframeDocument = iframe.contentDocument;

      // document.write는 비우고 새로 쓰는 효과가 있으므로,
      // iframe이 로드된 후에 호출하면 항상 깨끗한 상태로 시작할 수 있음.
      iframeDocument.open();
      iframeDocument.write(`
        <!DOCTYPE html><html><head><style>${PREVIEW_CSS}</style></head>
        <body><div id="preview-root"></div></body></html>
      `);
      iframeDocument.close();

      const rootElement = iframeDocument.getElementById('preview-root');
      if (rootElement) {
        // 이전 root가 있다면 안전하게 unmount (이젠 클린업에서 처리)
        // if (rootRef.current) rootRef.current.unmount();

        const newRoot = createRoot(rootElement);
        rootRef.current = newRoot;

        const viewportClass =
          viewMode === 'mobile' ? 'mobile-viewport' : 'desktop-viewport';

        newRoot.render(
          React.createElement(
            'div',
            { className: viewportClass },
            React.createElement(PreviewRenderer, {
              components,
              forcedViewport: viewMode,
              editingViewport,
              pageId,
            })
          )
        );
      }
    };

    // iframe이 로드 완료된 후 렌더링 함수를 호출
    iframe.addEventListener('load', renderIframeContent);

    // ❗️ 중요: 일부 브라우저(특히 Firefox)에서는 iframe의 src가 없을 때
    // load 이벤트가 발생하지 않을 수 있습니다. 강제로 트리거합니다.
    // 또한 viewMode 변경으로 iframe이 재생성될 때 재로딩을 유도합니다.
    iframe.src = 'about:blank';

    // ✅ 클린업 함수: 이 useEffect가 재실행되거나 컴포넌트가 사라질 때 호출
    return () => {
      isMounted = false; // 플래그를 false로 설정
      iframe.removeEventListener('load', renderIframeContent); // 이벤트 리스너 제거

      if (rootRef.current) {
        // setTimeout으로 다음 이벤트 루프에서 안전하게 unmount
        // 이것이 경고를 막는 핵심입니다.
        setTimeout(() => {
          rootRef.current.unmount();
          rootRef.current = null;
        }, 0);
      }
    };

    // ❗️ 의존성 배열에는 iframe의 재생성을 유발하는 모든 값을 포함
  }, [isOpen, viewMode]);

  // ❗️ 중요: components 데이터가 바뀔 때만 리렌더링하는 별도의 useEffect
  useEffect(() => {
    // iframe이 준비되었고, root가 생성된 상태에서만 실행
    if (isOpen && iframeRef.current && rootRef.current) {
      const viewportClass =
        viewMode === 'mobile' ? 'mobile-viewport' : 'desktop-viewport';

      // 내용만 업데이트
      rootRef.current.render(
        React.createElement(
          'div',
          { className: viewportClass },
          React.createElement(PreviewRenderer, {
            components,
            forcedViewport: viewMode,
            editingViewport,
            pageId,
          })
        )
      );
    }
  }, [components]); // components 데이터가 바뀔 때만 실행

  // iframe 크기 조정 (수정)
  useEffect(() => {
    if (!iframeRef.current) return;
    const iframe = iframeRef.current;

    if (viewMode === 'mobile') {
      iframe.style.width = '375px';
      iframe.style.height = '100%';
      iframe.style.transform = 'none';
    } else {
      // 데스크톱 모드
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.transform = 'none'; // ❗️ 스케일링 제거
    }

    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.backgroundColor = '#ffffff';
    iframe.style.margin = '0';
    iframe.style.padding = '0';
    iframe.style.boxSizing = 'border-box';
    iframe.style.overflowY = 'auto'; // iframe 자체에 스크롤 허용
    iframe.style.overflowX = 'hidden';
  }, [viewMode, isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return React.createElement(
    'div',
    { className: 'modal-overlay' },
    // 헤더
    React.createElement(
      'div',
      { className: 'modal-header' },
      React.createElement(
        'div',
        { className: 'viewport-controls' },
        //데스크톱 버튼 : 편집모드가 데스크톱일 때만 표시
        editingViewport === 'desktop' &&
          React.createElement(
            'button',
            {
              onClick: () => setViewMode('desktop'),
              className: `viewport-btn ${viewMode === 'desktop' ? 'active' : ''}`,
            },
            'Desktop'
          ),
        //모바일 버튼: 항상 표시
        React.createElement(
          'button',
          {
            onClick: () => setViewMode('mobile'),
            className: `viewport-btn ${viewMode === 'mobile' ? 'active' : ''}`,
          },
          'Mobile'
        )
      ),
      React.createElement(
        'button',
        {
          onClick: onClose,
          className: 'close-btn',
        },
        '✕'
      )
    ),

    // 프리뷰 영역
    React.createElement(
      'div',
      { className: 'preview-container', ref: iframeContainerRef },
      viewMode === 'mobile'
        ? React.createElement(
            'div',
            { className: 'iphone-wrapper' },
            React.createElement(
              'div',
              { className: 'iphone-frame' },
              React.createElement('div', { className: 'iphone-notch' }),
              React.createElement(
                'div',
                { className: 'iphone-screen' },
                React.createElement('iframe', {
                  ref: iframeRef,
                  className: 'preview-iframe mobile hide-scrollbar',
                  title: 'Mobile Preview',
                  style: {
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    width: '375px',
                    height: '100%',
                  },
                })
              ),
              React.createElement('div', { className: 'iphone-home-indicator' })
            )
          )
        : React.createElement('iframe', {
            ref: iframeRef,
            className: 'preview-iframe desktop hide-scrollbar',
            title: 'Desktop Preview',
          })
    ),

    // Styles
    React.createElement(
      'style',
      null,
      `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        z-index: 1000;
      }

      .modal-header {
        background: linear-gradient(to right, #FE969B, #CF9AC0);
        padding: 0 24px;
        height: 64px;
        border-bottom: 1px solid #fce7f3;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      }

      .viewport-controls {
        display: flex;
        gap: 8px;
        justify-content: center;
      }

      .viewport-btn {
        padding: 8px 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        backdrop-blur: 4px;
      }

      .viewport-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      .viewport-btn.active {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(255, 255, 255, 0.6);
        color: white;
      }

      .close-btn {
        position: absolute;
        right: 24px;
        padding: 8px;
        border: none;
        background: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .close-btn:hover {
        opacity: 0.7;
      }

      .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: #f8fafc;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .preview-iframe.desktop {
        border: none;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        background: #fff;
        overflow-y: auto;
        overflow-x: hidden;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .preview-iframe.desktop::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      .preview-iframe.mobile {
        width: 375px !important;
        height: 100%;
        border: none;
        background: #fff;
        scrollbar-width: none;
        -ms-overflow-style: none;
        overflow: auto;
      }

      .preview-iframe.mobile::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      .iphone-wrapper {
        position: relative;
        width: 395px;
        height: 812px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: scale(0.8);
        transform-origin: center center; /* 중앙 기준으로 축소 */
      }

      .iphone-frame {
        position: relative;
        width: 395px;
        height: 812px;
        background: #000;
        border-radius: 40px;
        padding: 10px;
        box-shadow: 
          0 0 0 2px #1a1a1a,
          0 0 0 7px #2a2a2a,
          0 20px 40px rgba(0, 0, 0, 0.4);
      }

      .iphone-notch {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 164px;
        height: 32px;
        background: #000;
        border-radius: 0 0 20px 20px;
        z-index: 10;
      }

      .iphone-notch::before {
        content: "";
        position: absolute;
        top: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 6px;
        background: #333;
        border-radius: 3px;
      }

      .iphone-screen {
        width: 100%;
        height: 100%;
        border-radius: 32px;
        overflow: auto;
        position: relative;
        background: #fff;
        display: block;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .iphone-screen::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      .iphone-home-indicator {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        width: 134px;
        height: 5px;
        background: #fff;
        border-radius: 3px;
        opacity: 0.8;
      }

      /* 모바일 미리보기는 고정 크기로 설정 - 반응형 제거 */
    `
    )
  );
};

export default PreviewModal;
