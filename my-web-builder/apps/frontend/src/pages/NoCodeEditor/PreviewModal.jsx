import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';
import { VIEWPORT_CONFIGS } from './utils/editorUtils';

const PreviewModal = ({ isOpen, onClose, components }) => {
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const iframeRef = useRef(null);
  const rootRef = useRef(null);

  // 뷰 모드별 크기 설정
  const getViewportSize = (mode) => {
    if (mode === 'desktop') {
      return { width: '100%', height: '100%' };
    }

    const config = VIEWPORT_CONFIGS[mode];
    return config
      ? { width: config.width, height: config.height }
      : { width: '100%', height: '100%' };
  };

  // iframe 초기화
  const initializeIframe = (iframe) => {
    const iframeDocument = iframe.contentDocument;

    if (!iframeDocument) return false;

    // iframe 내부 HTML 구조 설정
    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            overflow-x: hidden;
            min-height: 100vh;
          }
          #preview-root {
            width: 100%;
            min-height: 100vh;
            position: relative;
          }
        </style>
      </head>
      <body>
        <div id="preview-root"></div>
      </body>
      </html>
    `);
    iframeDocument.close();

    return true;
  };

  // iframe에 React 컴포넌트 렌더링
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;

    const iframe = iframeRef.current;
    let isMounted = true;

    const renderPreview = () => {
      if (!isMounted) return;

      try {
        const rootElement =
          iframe.contentDocument?.getElementById('preview-root');
        if (!rootElement) return;

        // 이전 root가 있다면 제거
        if (rootRef.current) {
          try {
            rootRef.current.unmount();
          } catch (error) {
            console.warn('Failed to unmount previous root:', error);
          }
          rootRef.current = null;
        }

        // 새 root 생성 및 렌더링
        rootRef.current = createRoot(rootElement);
        rootRef.current.render(
          <PreviewRenderer pageContent={components} forcedViewport={viewMode} />
        );
      } catch (error) {
        console.error('Failed to render preview:', error);
      }
    };

    // iframe 로드 이벤트 핸들러
    const handleIframeLoad = () => {
      if (initializeIframe(iframe)) {
        renderPreview();
      }
    };

    // iframe 로드 이벤트 리스너 등록
    iframe.addEventListener('load', handleIframeLoad);

    // iframe이 이미 로드된 경우 즉시 실행
    if (iframe.contentDocument?.readyState === 'complete') {
      handleIframeLoad();
    }

    return () => {
      isMounted = false;
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [isOpen, components, viewMode]);

  // 모달이 닫힐 때 정리
  useEffect(() => {
    return () => {
      if (rootRef.current) {
        const cleanup = () => {
          try {
            rootRef.current.unmount();
            rootRef.current = null;
          } catch (error) {
            console.warn('Cleanup: Failed to unmount root:', error);
          }
        };

        // requestAnimationFrame을 사용하여 다음 프레임에서 unmount
        if (typeof window !== 'undefined') {
          window.requestAnimationFrame(cleanup);
        } else {
          cleanup();
        }
      }
    };
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const viewport = getViewportSize(viewMode);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '12px 16px',
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#111827',
            }}
          >
            미리보기
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#6b7280',
              background: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {components?.length || 0}개 컴포넌트
          </div>
        </div>

        {/* 뷰포트 전환 버튼 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: viewMode === 'desktop' ? '#f3f4f6' : '#fff',
              color: viewMode === 'desktop' ? '#111827' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            💻 Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: viewMode === 'mobile' ? '#f3f4f6' : '#fff',
              color: viewMode === 'mobile' ? '#111827' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            📱 Mobile
          </button>
          <button
            onClick={onClose}
            style={{
              marginLeft: 8,
              padding: '6px 12px',
              fontSize: 13,
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              background: '#fff',
              color: '#111827',
              cursor: 'pointer',
            }}
          >
            닫기
          </button>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: viewport.width,
            height: viewport.height,
            background: '#fff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="preview"
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
