import React from 'react';
import { ComponentRenderers } from '../pages/NoCodeEditor/ComponentRenderers/index.js';

const TemplateCanvasPreview = ({ template, className = '' }) => {
  if (!template || !template.content) {
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

  // 템플릿 content는 배열이거나 객체일 수 있음
  let components = [];
  if (Array.isArray(template.content)) {
    components = template.content;
  } else if (template.content.components) {
    components = template.content.components;
  }

  if (components.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">빈 템플릿</p>
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
  
  // 스케일 조정 (미리보기 영역에 맞게) - 16:9 비율 기준
  const previewWidth = 300;
  const previewHeight = 200;
  const scaleX = previewWidth / contentWidth;
  const scaleY = previewHeight / contentHeight;
  const finalScale = Math.min(scaleX, scaleY, 0.25); // 최대 0.25 스케일

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div 
        className="relative bg-gray-50 w-full h-full"
        style={{
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
          {components.map((comp, index) => {
            const RendererComponent = ComponentRenderers[comp.type];
            
            if (!RendererComponent) {
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
                  pointerEvents: 'none', // 미리보기에서는 상호작용 비활성화
                }}
              >
                <div className="w-full h-full overflow-hidden">
                  <div className="w-full h-full">
                    <RendererComponent
                      comp={comp}
                      isPreview={true}
                      isEditor={false}
                      style={{
                        width: '100%',
                        height: '100%',
                        fontSize: Math.max(8, (comp.props?.style?.fontSize || 14) * finalScale) + 'px',
                        ...comp.props?.style,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 컴포넌트 개수 표시 */}
      {components.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {components.length}개 컴포넌트
        </div>
      )}
    </div>
  );
};

export default TemplateCanvasPreview; 