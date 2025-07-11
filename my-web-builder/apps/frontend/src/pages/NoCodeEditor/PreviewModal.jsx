import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import PreviewRenderer from './PreviewRenderer';

// 최소화된 CSS
const PREVIEW_CSS = `
  body { margin: 0; padding: 0; }
  #preview-root { width: 100%; height: 100%; }
`;

const PreviewModal = ({ isOpen, onClose, components, editingViewport = 'desktop', templateCategory }) => {
  const [viewMode, setViewMode] = useState(editingViewport);
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const iframeContainerRef = useRef(null);

  // 컨텐츠 높이 계산은 PreviewRenderer에서 자동으로 처리됨

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${PREVIEW_CSS}</style>
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
        <PreviewRenderer components={components} forcedViewport={viewMode} editingViewport={editingViewport} />
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

  // iframe 크기 조정 (단순화)
  useEffect(() => {
    if (!iframeRef.current || !iframeContainerRef.current) return;

    const iframe = iframeRef.current;
    const container = iframeContainerRef.current;

    // 컨테이너 크기 가져오기
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 20;
    const availableHeight = containerRect.height - 20;

    // iframe을 컨테이너 크기에 맞게 설정
    iframe.style.width = `${availableWidth}px`;
    iframe.style.height = `${availableHeight}px`;
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.backgroundColor = '#ffffff';
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
        {templateCategory !== 'wedding' && (
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '8px 16px',
              border:
                viewMode === 'desktop' ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '4px',
              background: viewMode === 'desktop' ? '#e7f1ff' : '#fff',
            }}
          >
            데스크톱
          </button>
        )}
        <button
          onClick={() => setViewMode('mobile')}
          style={{
            padding: '8px 16px',
            border:
              viewMode === 'mobile' ? '2px solid #007bff' : '1px solid #ddd',
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
        ref={iframeContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#f8f9fa'
        }}
      >
        <iframe
          ref={iframeRef}
          style={{
            width: viewMode === 'mobile' ? '375px' : '100%',
            maxWidth: viewMode === 'mobile' ? '375px' : '100%',
            height: '100%',
            border: '1px solid #ddd',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            background: '#ffffff',
          }}
          title="Preview"
        />
      </div>
    </div>
  );
};

export default PreviewModal;
