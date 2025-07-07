import React, { useState } from 'react';
import { usePageNavigation } from '../hooks/usePageNavigation';

const PageNavigation = ({ components = [], onPageChange }) => {
  const { 
    pages, 
    currentPageId, 
    loading, 
    error, 
    navigateToPage,
    hasPages,
    pageCount 
  } = usePageNavigation(components);
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePageClick = (pageId) => {
    navigateToPage(pageId);
    onPageChange && onPageChange(pageId);
    setIsExpanded(false);
  };

  const currentPage = pages.find(page => page.id === currentPageId);

  if (loading) {
    return (
      <div className="page-navigation loading">
        <div className="loading-spinner">⏳</div>
        <span>페이지 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-navigation error">
        <span>⚠️ 페이지 로드 실패: {error}</span>
      </div>
    );
  }

  if (!hasPages) {
    return (
      <div className="page-navigation empty">
        <span>📄 페이지가 없습니다</span>
      </div>
    );
  }

  return (
    <div className={`page-navigation ${isExpanded ? 'expanded' : ''}`}>
      {/* 현재 페이지 표시 */}
      <div 
        className="current-page"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="page-info">
          <span className="page-icon">📄</span>
          <span className="page-name">
            {currentPage?.name || '페이지'}
          </span>
          <span className="page-count">({pageCount})</span>
        </div>
        <div className="expand-icon">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* 페이지 목록 */}
      {isExpanded && (
        <div className="page-list">
          {pages.map(page => (
            <div
              key={page.id}
              className={`page-item ${page.id === currentPageId ? 'active' : ''}`}
              onClick={() => handlePageClick(page.id)}
            >
              <div className="page-item-content">
                <span className="page-item-icon">
                  {page.id === currentPageId ? '📍' : '📄'}
                </span>
                <span className="page-item-name">
                  {page.name || `페이지 ${page.id.slice(-4)}`}
                </span>
                {page.deployUrl && (
                  <span className="page-item-status deployed">
                    🚀
                  </span>
                )}
              </div>
              {page.content?.components && (
                <span className="page-item-count">
                  {page.content.components.length}개
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page-navigation {
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .page-navigation.expanded {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .current-page {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transition: all 0.2s ease;
        }

        .current-page:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }

        .page-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-icon {
          font-size: 16px;
        }

        .page-name {
          font-weight: 600;
          font-size: 14px;
        }

        .page-count {
          font-size: 12px;
          opacity: 0.8;
        }

        .expand-icon {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .page-list {
          max-height: 300px;
          overflow-y: auto;
          background: #fafafa;
        }

        .page-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.2s ease;
        }

        .page-item:hover {
          background: #f5f5f5;
        }

        .page-item.active {
          background: #e3f2fd;
          border-left: 3px solid #2196f3;
        }

        .page-item-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .page-item-icon {
          font-size: 14px;
        }

        .page-item-name {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .page-item-status {
          font-size: 12px;
        }

        .page-item-status.deployed {
          color: #4caf50;
        }

        .page-item-count {
          font-size: 12px;
          color: #666;
          background: #e0e0e0;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .loading, .error, .empty {
          padding: 16px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        .error {
          color: #f44336;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 스크롤바 스타일링 */
        .page-list::-webkit-scrollbar {
          width: 6px;
        }

        .page-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .page-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .page-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default PageNavigation; 