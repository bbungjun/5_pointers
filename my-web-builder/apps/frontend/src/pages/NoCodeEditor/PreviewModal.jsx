import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';

const PreviewModal = ({ isOpen, onClose, components }) => {
  const [viewMode, setViewMode] = useState('desktop');
  const iframeRef = useRef(null);
  const rootRef = useRef(null);

  // 컨텐츠 높이를 동적으로 계산
  const maxHeight = Math.max(
    1080,
    ...(components || []).map(comp => (comp.y || 0) + (comp.height || 100))
  );

  // iframe 초기화 (한 번만)
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;

    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body, #preview-root { 
              margin: 0; 
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              overflow: hidden; /* 스크롤 완전 제거 */
            }
            #preview-root { 
              width: 100%;
              height: 100%;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <div id="preview-root"></div>
        </body>
      </html>
    `);
    iframeDocument.close();

    // React root 생성
    const rootElement = iframeDocument.getElementById('preview-root');
    if (rootElement && !rootRef.current) {
      rootRef.current = createRoot(rootElement);
    }
  }, [isOpen]);

  // 컴포넌트 렌더링 (뷰포트 변경 시마다)
  useEffect(() => {
    if (!isOpen || !rootRef.current) return;

    try {
      rootRef.current.render(
        <PreviewRenderer pageContent={components} forcedViewport={viewMode} />
      );
    } catch (error) {
      console.error('Failed to render preview:', error);
    }
  }, [isOpen, components, viewMode]);

  // 모달이 닫힐 때만 unmount 처리
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      const timeoutId = setTimeout(() => {
        try {
          rootRef.current.unmount();
          rootRef.current = null;
        } catch (error) {
          console.warn('Failed to unmount preview:', error);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          padding: '16px',
          background: '#fff',
          borderBottom: '1px solid #eee',
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setViewMode('desktop')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'desktop' ? '2px solid #007bff' : '1px solid #ddd',
            borderRadius: '4px',
            background: viewMode === 'desktop' ? '#e7f1ff' : '#fff',
          }}
        >
          데스크톱
        </button>
        <button
          onClick={() => setViewMode('mobile')}
          style={{
            padding: '8px 16px',
            border: viewMode === 'mobile' ? '2px solid #007bff' : '1px solid #ddd',
            borderRadius: '4px',
            background: viewMode === 'mobile' ? '#e7f1ff' : '#fff',
          }}
        >
          모바일
        </button>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
          }}
        >
          닫기
        </button>
      </div>
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          padding: '0', // 여백 제거
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '1945px',
            height: '1080px',
            transform: 'translate(-50%, -50%) scale(0.65)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: '12px',
            overflowX: 'hidden',
            overflowY: 'auto',
            background: '#fff',
          }}
        >
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: `${maxHeight}px`,
              border: 'none',
              background: '#fff',
              borderRadius: '12px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;