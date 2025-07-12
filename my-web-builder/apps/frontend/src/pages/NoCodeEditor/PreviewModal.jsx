import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import PreviewRenderer from "./PreviewRenderer";

const PREVIEW_CSS = `
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow-y: auto;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
  }
  #preview-root {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .mobile-viewport {
    width: 375px;
    height: 812px;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  .desktop-viewport {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  
  /* 모든 스크롤바 완전히 숨기기 */
  html::-webkit-scrollbar,
  body::-webkit-scrollbar,
  #preview-root::-webkit-scrollbar,
  .mobile-viewport::-webkit-scrollbar,
  .desktop-viewport::-webkit-scrollbar,
  *::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
    display: none;
  }
  
  html,
  body,
  #preview-root,
  .mobile-viewport,
  .desktop-viewport,
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* 추가 스크롤바 제거 */
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  
  ::-webkit-scrollbar-track {
    display: none !important;
  }
  
  ::-webkit-scrollbar-thumb {
    display: none !important;
  }
`;

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  components = [], 
  editingViewport = "desktop",
  templateCategory 
}) => {
  const [viewMode, setViewMode] = useState(editingViewport);
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const containerRef = useRef(null);

  // iframe 초기화
  useEffect(() => {
    if (!isOpen || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;

    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html style="overflow-x: hidden; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${PREVIEW_CSS}</style>
        </head>
        <body style="overflow-x: hidden; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none;">
          <div id="preview-root"></div>
        </body>
      </html>
    `);
    iframeDocument.close();

    const rootElement = iframeDocument.getElementById("preview-root");
    if (rootElement && !rootRef.current) {
      rootRef.current = createRoot(rootElement);
    }
  }, [isOpen]);

  // 컴포넌트 렌더링
  useEffect(() => {
    if (!isOpen || !rootRef.current) return;

    try {
      const viewportClass = viewMode === "mobile" ? "mobile-viewport" : "desktop-viewport";
      
      rootRef.current.render(
        React.createElement("div", { className: viewportClass },
          React.createElement(PreviewRenderer, {
            components: components,
            forcedViewport: viewMode,
            editingViewport: editingViewport
          })
        )
      );
    } catch (error) {
      console.error("Failed to render preview:", error);
    }
  }, [isOpen, components, viewMode, editingViewport]);

  // 모달 정리
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      const timeoutId = setTimeout(() => {
        try {
          rootRef.current.unmount();
          rootRef.current = null;
        } catch (error) {
          console.warn("Failed to unmount preview:", error);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // ESC 키 처리
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return React.createElement("div", { className: "modal-overlay" },
    // 헤더
    React.createElement("div", { className: "modal-header" },
      React.createElement("div", { className: "viewport-controls" },
        templateCategory !== "wedding" && React.createElement("button", {
          onClick: () => setViewMode("desktop"),
          className: `viewport-btn ${viewMode === "desktop" ? "active" : ""}`
        }, "Desktop"),
        React.createElement("button", {
          onClick: () => setViewMode("mobile"),
          className: `viewport-btn ${viewMode === "mobile" ? "active" : ""}`
        }, "Mobile")
      ),
      React.createElement("button", {
        onClick: onClose,
        className: "close-btn"
      }, "✕")
    ),

    // 프리뷰 영역
    React.createElement("div", { className: "preview-container", ref: containerRef },
      viewMode === "mobile" ? 
        React.createElement("div", { className: "iphone-wrapper" },
          React.createElement("div", { className: "iphone-frame" },
            React.createElement("div", { className: "iphone-notch" }),
            React.createElement("div", { className: "iphone-screen" },
              React.createElement("iframe", {
                ref: iframeRef,
                className: "preview-iframe mobile",
                title: "Mobile Preview",
                style: {
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  width: "375px",
                  height: "100%"
                }
              })
            ),
            React.createElement("div", { className: "iphone-home-indicator" })
          )
        ) :
        React.createElement("iframe", {
          ref: iframeRef,
          className: "preview-iframe desktop",
          title: "Desktop Preview"
        })
    ),

    // Styles
    React.createElement("style", { jsx: true }, `
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
        background: #fff;
        padding: 16px 24px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .viewport-controls {
        display: flex;
        gap: 8px;
      }

      .viewport-btn {
        padding: 8px 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        color: #374151;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .viewport-btn:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .viewport-btn.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: #fff;
      }

      .close-btn {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        background: #fff;
        color: #6b7280;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .close-btn:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .preview-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        background: #f8fafc;
      }

      .preview-iframe.desktop {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        background: #fff;
      }

      .preview-iframe.mobile {
        width: 375px !important;
        height: 100%;
        border: none;
        background: #fff;
        scrollbar-width: none;
        -ms-overflow-style: none;
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
        transform-origin: top center; /* 위쪽 중앙 기준으로 축소 */
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
        overflow: hidden;
        position: relative;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
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

      @media (max-width: 768px) {
        .preview-container {
          padding: 20px;
        }
        
        .iphone-wrapper {
          transform: scale(0.8);
          transform-origin: top center;
        }
      }

      @media (max-width: 480px) {
        .modal-header {
          padding: 12px 16px;
        }
        
        .viewport-btn {
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .preview-container {
          padding: 10px;
        }
        
        .iphone-wrapper {
          transform: scale(0.6);
        }
      }
    `)
  );
};

export default PreviewModal;
