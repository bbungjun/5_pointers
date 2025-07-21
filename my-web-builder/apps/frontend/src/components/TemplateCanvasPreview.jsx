import React from 'react';
import { ComponentRenderers } from '../pages/NoCodeEditor/ComponentRenderers/index.js';

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

const TemplateCanvasPreview = ({ template, className = '' }) => {
  if (!template || !template.content) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
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
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-sm">빈 템플릿</p>
        </div>
      </div>
    );
  }

  // 컴포넌트들의 전체 영역 계산
  const getBounds = () => {
    if (components.length === 0)
      return { minX: 0, minY: 0, maxX: 375, maxY: 600 };

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    components.forEach((comp) => {
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
        width: 200, // 모바일 고정 너비 (더 넓게)
        height: 400, // 모바일 고정 높이 (더 길게)
        aspectRatio: '1/2',
      };
    } else {
      return {
        width: 220, // 데스크톱 컨테이너 너비에 맞춤
        height: 150, // 데스크톱 컨테이너 높이에 맞춤
        aspectRatio: '16/9',
      };
    }
  };

  const previewDimensions = getPreviewDimensions();
  const scaleX = previewDimensions.width / contentWidth;
  const scaleY = previewDimensions.height / contentHeight;

  // 편집 기준에 따른 스케일 전략
  let finalScale;
  if (editingMode === 'mobile') {
    // 모바일: 가로에 꽉 차고 세로는 넘치는 부분 hidden
    const mobileWidth = 375;
    const mobileHeight = 795; // 스크린 높이 (사용자가 설정한 값)
    const scaleX = mobileWidth / contentWidth;
    finalScale = scaleX; // 가로 기준으로 스케일 고정
  } else {
    // 데스크톱: 가로를 정확히 220px에 맞추고, 세로는 아래쪽이 짤리도록
    finalScale = scaleX; // 가로 기준으로 정확히 맞춤
  }

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {editingMode === 'mobile' ? (
        // 모바일 휴대폰 프레임 (PreviewModal과 동일한 스타일)
        <div
          className="flex items-center justify-center w-full h-full"
          style={{ width: '200px', height: '360px' }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            {/* iPhone 프레임 (크기 조정) */}
            <div
              className="relative bg-black rounded-[2.5rem] p-2.5"
              style={{
                width: '395px',
                height: '812px',
                transform: 'scale(0.35)', // 더 작게 조정
                transformOrigin: 'center center',
                boxShadow:
                  '0 0 0 2px #1a1a1a, 0 0 0 7px #2a2a2a, 0 20px 40px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* 상단 노치 (PreviewModal과 정확히 동일) */}
              <div
                className="absolute bg-black z-10"
                style={{
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '164px',
                  height: '32px',
                  borderRadius: '0 0 20px 20px',
                }}
              >
                <div
                  className="absolute bg-gray-700"
                  style={{
                    top: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '6px',
                    borderRadius: '3px',
                  }}
                ></div>
              </div>

              {/* 스크린 영역 */}
              <div
                className="relative bg-white rounded-[2rem] overflow-hidden"
                style={{
                  width: '375px',
                  height: '795px',
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
                            <span className="text-xs text-gray-500">
                              {comp.type}
                            </span>
                          </div>
                        );
                      }

                      try {
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
                                    fontSize:
                                      Math.max(
                                        8,
                                        (comp.props?.style?.fontSize || 14) *
                                          finalScale
                                      ) + 'px',
                                    ...comp.props?.style,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      } catch (error) {
                        console.error(
                          '컴포넌트 렌더링 에러:',
                          comp.type,
                          error
                        );
                        return (
                          <div
                            key={comp.id || index}
                            className="absolute bg-red-100 border border-red-300 rounded flex items-center justify-center"
                            style={{
                              left: (comp.x || 0) - bounds.minX,
                              top: (comp.y || 0) - bounds.minY,
                              width: comp.width || 100,
                              height: comp.height || 50,
                            }}
                          >
                            <span className="text-xs text-red-500">
                              에러: {comp.type}
                            </span>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>

              {/* 홈 인디케이터 (PreviewModal과 정확히 동일) */}
              <div
                className="absolute bg-white opacity-80"
                style={{
                  bottom: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '134px',
                  height: '5px',
                  borderRadius: '3px',
                }}
              ></div>
            </div>
          </div>
        </div>
      ) : (
        // 데스크톱 미리보기 (기존)
        <div
          className="relative bg-gray-50 w-full h-full overflow-hidden"
          style={{
            width: '100%',
            height: '100%',
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
              // 타입 변환 적용
              const rendererKey = ComponentRenderers[comp.type]
                ? comp.type
                : ComponentRenderers[toKebabCase(comp.type)]
                  ? toKebabCase(comp.type)
                  : comp.type;
              const RendererComponent = ComponentRenderers[rendererKey];

              if (!RendererComponent) {
                console.warn('데스크톱 렌더러를 찾을 수 없음:', comp.type);
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

              try {
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
                          style={{
                            width: '100%',
                            height: '100%',
                            fontSize:
                              Math.max(
                                8,
                                (comp.props?.style?.fontSize || 14) * finalScale
                              ) + 'px',
                            ...comp.props?.style,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              } catch (error) {
                console.error(
                  '데스크톱 컴포넌트 렌더링 에러:',
                  comp.type,
                  error
                );
                return (
                  <div
                    key={comp.id || index}
                    className="absolute bg-red-100 border border-red-300 rounded flex items-center justify-center"
                    style={{
                      left: (comp.x || 0) - bounds.minX,
                      top: (comp.y || 0) - bounds.minY,
                      width: comp.width || 100,
                      height: comp.height || 50,
                    }}
                  >
                    <span className="text-xs text-red-500">
                      에러: {comp.type}
                    </span>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCanvasPreview;
