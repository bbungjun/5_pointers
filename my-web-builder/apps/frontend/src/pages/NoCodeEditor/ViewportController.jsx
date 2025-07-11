import React from 'react';
import { VIEWPORT_CONFIGS } from './utils/editorUtils';

/**
 * ViewportController - 뷰포트 모드 전환을 위한 컨트롤러 컴포넌트
 *
 * Webflow/Figma 스타일의 직관적인 뷰포트 전환 UI를 제공합니다.
 * 사용자는 데스크탑, 태블릿, 모바일 뷰 간을 즉시 전환할 수 있습니다.
 */
const ViewportController = ({ currentViewport, onViewportChange, templateCategory }) => {
  // 뷰포트 설정을 중앙 집중식으로 관리
  let viewports = Object.entries(VIEWPORT_CONFIGS).map(([id, config]) => ({
    id,
    ...config,
  }));
  
  // 웨딩 카테고리인 경우 모바일만 표시
  if (templateCategory === 'wedding') {
    viewports = viewports.filter(viewport => viewport.id === 'mobile');
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: '#f8f9fa',
        borderRadius: 8,
        padding: 4,
        border: '1px solid #e9ecef',
      }}
    >
      {viewports.map((viewport) => {
        const isActive = currentViewport === viewport.id;

        return (
          <button
            key={viewport.id}
            onClick={() => onViewportChange(viewport.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive ? '#3B4EFF' : 'transparent',
              color: isActive ? '#ffffff' : '#495057',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.background = '#e9ecef';
                e.target.style.color = '#212529';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#495057';
              }
            }}
            title={`${viewport.label} 뷰 (${viewport.description})`}
          >
            {/* 뷰포트 아이콘 */}
            <span
              style={{
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {viewport.icon}
            </span>

            {/* 뷰포트 라벨 */}
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.3px',
              }}
            >
              {viewport.label}
            </span>

            {/* 활성 상태 인디케이터 */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 20,
                  height: 2,
                  background: '#ffffff',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            )}
          </button>
        );
      })}

      {/* 현재 뷰포트 정보 표시 */}
      <div
        style={{
          marginLeft: 12,
          padding: '4px 8px',
          background: '#ffffff',
          border: '1px solid #e9ecef',
          borderRadius: 4,
          fontSize: 12,
          color: '#6c757d',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {VIEWPORT_CONFIGS[currentViewport]?.width || '1920'}px
      </div>
    </div>
  );
};

export default ViewportController;
