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

  // 편집 기준 확인 (기본값: desktop)
  const editingMode = template.editingMode || 'desktop';

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
  
  // 편집 기준에 따른 미리보기 크기 설정
  const getPreviewDimensions = () => {
    if (editingMode === 'mobile') {
      return {
        width: 200,  // 모바일 화면 영역 크기
        height: 400, // 더 길게 만든 높이
        aspectRatio: '1/2'
      };
    } else {
      return {
        width: 300,  // 데스크톱 비율 (16:9)
        height: 200,
        aspectRatio: '16/9'
      };
    }
  };

  const previewDimensions = getPreviewDimensions();
  const scaleX = previewDimensions.width / contentWidth;
  const scaleY = previewDimensions.height / contentHeight;
  const finalScale = Math.min(scaleX, scaleY, 0.25); // 최대 0.25 스케일

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* 디바이스 타입 표시 */}
      <div className="absolute top-2 left-2 z-10">
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

      {editingMode === 'mobile' ? (
        // 모바일 휴대폰 프레임 (단순화된 버전)
        <div className="flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="relative">
            {/* 휴대폰 외곽 프레임 */}
            <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] p-1 shadow-2xl border border-gray-700">
              {/* 상단 노치 (단순화) */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-900 rounded-b-xl z-20"></div>
              
              {/* 스크린 영역 (세로로 길게) */}
              <div 
                className="relative bg-white rounded-[1.75rem] overflow-hidden border border-gray-600"
                style={{
                  width: '200px',
                  height: '400px', // 더 길게 만듦
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
                            pointerEvents: 'none',
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
                                  fontSize: Math.max(6, (comp.props?.style?.fontSize || 14) * finalScale) + 'px',
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
              </div>
              
              {/* 홈 인디케이터 (하단) */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-600 rounded-full"></div>
              
              {/* 사이드 버튼들 (단순화) */}
              <div className="absolute left-0 top-16 w-0.5 h-6 bg-gray-700 rounded-r-full"></div>
              <div className="absolute left-0 top-28 w-0.5 h-10 bg-gray-700 rounded-r-full"></div>
              <div className="absolute right-0 top-20 w-0.5 h-12 bg-gray-700 rounded-l-full"></div>
            </div>
            
            {/* 휴대폰 그림자 */}
            <div className="absolute inset-0 bg-black opacity-20 rounded-[2rem] transform translate-y-2 translate-x-1 -z-10"></div>
          </div>
        </div>
      ) : (
        // 데스크톱 미리보기 (기존)
        <div 
          className="relative bg-gray-50 w-full aspect-[16/9]"
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
                    pointerEvents: 'none',
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
      )}
      
      {/* 컴포넌트 개수 표시 */}
      {components.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded z-10">
          {components.length}개 컴포넌트
        </div>
      )}
    </div>
  );
};

export default TemplateCanvasPreview; 