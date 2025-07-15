import React from 'react';
import { ComponentRenderers } from '../pages/NoCodeEditor/ComponentRenderers/index.js';
import ComponentErrorBoundary from './ComponentErrorBoundary';

// type 변환 함수 추가
function toKebabCase(str) {
  // 특수 케이스 처리
  if (str === 'dday') return 'd-day';
  if (str === 'slideGallery') return 'slide-gallery';
  if (str === 'weddingContent') return 'wedding-content';
  if (str === 'weddingContact') return 'wedding-contact';
  if (str === 'gridGallery') return 'grid-gallery';
  if (str === 'bankAccount') return 'bank-account';
  if (str === 'mapInfo') return 'map-info';
  if (str === 'weddingInvite') return 'wedding-invite';
  if (str === 'kakaotalkShare') return 'kakaotalk-share';
  if (str === 'musicPlayer') return 'music-player';
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const PageCanvasPreview = ({ page, className = '', editingMode = 'desktop' }) => {
  if (!page || !page.content) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">미리보기 없음</p>
        </div>
      </div>
    );
  }

  // 페이지 content는 배열이거나 객체일 수 있음
  let components = [];
  if (Array.isArray(page.content)) {
    components = page.content;
  } else if (page.content.components) {
    components = page.content.components;
  }

  if (components.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">빈 페이지</p>
        </div>
      </div>
    );
  }

  // 컴포넌트들의 전체 영역 계산
  const getBounds = () => {
    if (components.length === 0) return { minX: 0, minY: 0, maxX: 375, maxY: 600 };
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    components.forEach(comp => {
      const x = comp.x || 0;
      const y = comp.y || 0;
      const width = comp.width || 100;
      const height = comp.height || 50;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // 최소 영역 보장
    minX = Math.min(minX, 0);
    minY = Math.min(minY, 0);
    maxX = Math.max(maxX, 375);
    maxY = Math.max(maxY, 600);
    
    return { minX, minY, maxX, maxY };
  };

  const bounds = getBounds();
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  
  // 페이지 상태에 따른 미리보기 크기 설정
  const getPreviewDimensions = () => {
    if (editingMode === 'mobile') {
      return {
        width: 200,
        height: 400,
        aspectRatio: '1/2'
      };
    } else {
      return {
        width: 320,  // TemplateCanvasPreview와 동일한 크기
        height: 240,
        aspectRatio: '16/9'
      };
    }
  };

  const previewDimensions = getPreviewDimensions();
  const scaleX = previewDimensions.width / contentWidth;
  const scaleY = previewDimensions.height / contentHeight;
  
  // 편집 기준에 따른 스케일 전략
  let finalScale;
  if (editingMode === 'mobile') {
    // 모바일: 화면 너비를 꽉 채우도록 스케일 조정
    finalScale = Math.max(scaleX, scaleY, 0.4);
  } else {
    // 데스크톱: 너비를 기준으로 스케일 고정하여 높이 변화에 영향받지 않도록
    finalScale = Math.min(scaleX, 0.8);
  }

  // 컴포넌트 렌더링 함수
  const renderComponents = () => {
    return components.map((comp, index) => {            
      // 타입 변환 적용
      const rendererKey = ComponentRenderers[comp.type]
        ? comp.type
        : ComponentRenderers[toKebabCase(comp.type)]
          ? toKebabCase(comp.type)
          : comp.type;
      const RendererComponent = ComponentRenderers[rendererKey];
      
      if (!RendererComponent) {
        console.warn('렌더러를 찾을 수 없음:', comp.type);
        return (
          <div
            key={comp.id || index}
            className="absolute bg-gray-200 border border-gray-300 rounded flex items-center justify-center"
            style={{
              left: (comp.x || 0) - bounds.minX,
              top: (comp.y || 0) - bounds.minY,
              width: comp.width || 100,
              height: comp.height || 50,
            }}
          >
            <span className="text-xs text-gray-500">{comp.type}</span>
          </div>
        );
      }

      return (
        <div
          key={comp.id || index}
          className="absolute"
          style={{
            left: (comp.x || 0) - bounds.minX,
            top: (comp.y || 0) - bounds.minY,
            width: comp.width || 100,
            height: comp.height || 50,
          }}
        >
          <ComponentErrorBoundary>
            {React.createElement(RendererComponent, { 
              comp, 
              mode: "preview",
              key: comp.id || index 
            })}
          </ComponentErrorBoundary>
        </div>
      );
    });
  };

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 페이지 상태 및 viewport 표시 */}
      <div className="absolute top-2 left-2 z-10">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          page.status === 'DEPLOYED' 
            ? 'bg-emerald-100 text-emerald-800' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {page.status === 'DEPLOYED' ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              배포됨
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              임시저장
            </>
          )}
        </div>
      </div>
      
      {/* Viewport 표시 */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          editingMode === 'mobile' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {editingMode === 'mobile' ? (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" clipRule="evenodd" />
              </svg>
              모바일
            </>
          ) : (
            <>
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              데스크톱
            </>
          )}
        </div>
      </div>

      {/* 프레임 */}
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          {editingMode === 'mobile' ? (
            // 모바일 휴대폰 프레임
            <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] p-1">
              {/* 상단 노치 */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-900 rounded-b-lg z-20"></div>
              
              {/* 스크린 영역 */}
              <div 
                className="relative bg-white rounded-[1.25rem] overflow-hidden border border-gray-600"
                style={{
                  width: `${previewDimensions.width}px`,
                  height: `${previewDimensions.height}px`,
                }}
              >
                {/* 컨텐츠 영역 */}
                <div className="absolute inset-0 bg-gray-50 overflow-hidden">
                  {/* 컴포넌트들 렌더링 */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      transform: `scale(${finalScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    {renderComponents()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // 데스크톱 미리보기 (TemplateCanvasPreview와 동일한 스타일)
            <div 
              className="relative bg-gray-50 w-full overflow-hidden"
              style={{
                width: `${previewDimensions.width}px`,
                height: `${previewDimensions.height}px`,
                minHeight: '200px',
              }}
            >
              {/* 캔버스 배경 */}
              <div className="absolute inset-0 bg-white" />
              
              {/* 컴포넌트들 렌더링 */}
              <div 
                className="absolute inset-0"
                style={{
                  transform: `scale(${finalScale})`,
                  transformOrigin: 'top left',
                }}
              >
                {renderComponents()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageCanvasPreview; 