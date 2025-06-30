// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React, { useState, useEffect, useRef } from 'react';

// 그리드 크기 상수 import 또는 선언
const GRID_SIZE = 50;

// 컴포넌트 타입별 기본 크기와 최소 크기 정의 (NoCodeEditor.jsx와 동일)
function getComponentDimensions(type) {
  const dimensions = {
    button: { defaultWidth: 120, defaultHeight: 48, minWidth: 80, minHeight: 32 },
    text: { defaultWidth: 200, defaultHeight: 30, minWidth: 50, minHeight: 20 },
    image: { defaultWidth: 200, defaultHeight: 150, minWidth: 50, minHeight: 50 },
    map: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 150 },
    link: { defaultWidth: 150, defaultHeight: 30, minWidth: 50, minHeight: 20 },
    attend: { defaultWidth: 300, defaultHeight: 200, minWidth: 200, minHeight: 150 },
    dday: { defaultWidth: 200, defaultHeight: 100, minWidth: 150, minHeight: 80 },
    weddingContact: { defaultWidth: 300, defaultHeight: 250, minWidth: 250, minHeight: 200 },
    gridGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    slideGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    mapInfo: { defaultWidth: 300, defaultHeight: 200, minWidth: 200, minHeight: 150 },
    calendar: { defaultWidth: 350, defaultHeight: 400, minWidth: 250, minHeight: 300 },
    bankAccount: { defaultWidth: 300, defaultHeight: 180, minWidth: 250, minHeight: 150 }
  };
  return dimensions[type] || { defaultWidth: 120, defaultHeight: 40, minWidth: 80, minHeight: 30 };
}

function CanvasArea({
  canvasRef,
  containerRef,
  components,
  selectedId,
  users,
  nickname,
  snapLines,
  setSnapLines,
  onDrop, onDragOver,
  onClick, onMouseMove, onMouseUp,
  onSelect,
  onUpdate,
  onDelete,
  CanvasComponent,
  UserCursor,
  zoom = 100,
  onZoomChange,
  viewport = 'desktop', // 새로 추가: 뷰포트 모드
  isInspectorOpen = false // Inspector 열림 상태
}) {
  const [localZoom, setLocalZoom] = useState(zoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // 패닝(캔버스 드래그 이동) 관련 상태
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const LIBRARY_WIDTH = 240; // 좌측 패널(컴포넌트 라이브러리) width와 동일하게!

  // 줌 핸들러
  const handleZoom = (delta) => {
    const newZoom = Math.max(25, Math.min(400, localZoom + delta));
    setLocalZoom(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  // 마우스 휠로 줌
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -10 : 10;
      handleZoom(delta);
    }
  };

  // 패닝 시작
  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.spaceKey)) { // 중간 버튼 또는 스페이스바 + 좌클릭
      e.preventDefault();
      setIsDragging(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  // 패닝 중
  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
    onMouseMove(e);
  };

  // 드롭 시 snapLines 항상 초기화
  const handleDrop = (e) => {
    if (onDrop) onDrop(e);
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 마우스 업 시 snapLines 항상 초기화
  const handleMouseUp = (e) => {
    setIsDragging(false);
    if (onMouseUp) onMouseUp(e);
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 캔버스 컨테이너에서 마우스 드래그로 스크롤 이동
  const handleContainerMouseDown = (e) => {
    // 컨테이너의 빈 영역에서만 동작 (컴포넌트 위에서는 무시)
    if (e.target === containerRef.current) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: containerRef.current.scrollLeft,
        scrollTop: containerRef.current.scrollTop,
      });
    }
  };
  const handleContainerMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      containerRef.current.scrollLeft = panStart.scrollLeft - dx;
      containerRef.current.scrollTop = panStart.scrollTop - dy;
    }
  };
  const handleContainerMouseUp = () => setIsPanning(false);

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleContainerMouseMove);
      window.addEventListener('mouseup', handleContainerMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleContainerMouseMove);
        window.removeEventListener('mouseup', handleContainerMouseUp);
      };
    }
  }, [isPanning, panStart]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        document.body.style.cursor = 'grab';
      }
      // G 키로 그리드 토글
      if (e.code === 'KeyG') {
        e.preventDefault();
        setShowGrid(prev => !prev);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        document.body.style.cursor = 'default';
      }
    };

    // 전역 휠 이벤트로 브라우저 줌 방지
    const handleGlobalWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // 전역 키보드 이벤트로 브라우저 줌 방지
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('wheel', handleGlobalWheel);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const scale = localZoom / 100;

  useEffect(() => {
    const scrollToCenter = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        
        // 스케일을 적용한 실제 캔버스 크기
        const baseCanvasWidth = viewport === 'mobile' ? 375 : 1920;
        const baseCanvasHeight = viewport === 'mobile' ? 667 : 1080;
        
        // 컴포넌트들의 최대 위치 계산하여 동적 높이 결정
        let maxY = baseCanvasHeight;
        if (components && components.length > 0) {
          const componentsMaxY = Math.max(...components.map(comp => {
            const compDimensions = getComponentDimensions(comp.type);
            return comp.y + (comp.height || compDimensions.defaultHeight);
          }));
          maxY = Math.max(baseCanvasHeight, componentsMaxY + 200);
        }
        
        // 그리드에 맞춘 최종 크기
        const gridSize = GRID_SIZE;
        const gridColumns = Math.ceil(baseCanvasWidth / gridSize);
        const gridRows = Math.ceil(maxY / gridSize);
        const finalWidth = gridColumns * gridSize;
        const finalHeight = gridRows * gridSize;
        
        // 스케일 적용된 실제 크기
        const scaledWidth = finalWidth * scale;
        const scaledHeight = finalHeight * scale;
        
        // 패딩 고려 (모바일은 작게, 데스크톱은 크게)
        const paddingX = viewport === 'mobile' ? 20 : 60;
        const paddingY = viewport === 'mobile' ? 10 : 20;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        if (viewport === 'mobile') {
          // 모바일: 좌우 중앙 정렬만, 상하는 스크롤 가능
          const scrollX = Math.max(0, (scaledWidth + paddingX * 2 - containerWidth) / 2);
          container.scrollLeft = scrollX;
          container.scrollTop = 0; // 상단 고정
        } else {
          // 데스크톱: Inspector 상태에 따른 중앙 정렬 조정
          // Inspector가 열려있을 때 좀 더 중앙으로 이동하도록 조정
          const inspectorOffset = isInspectorOpen ? -170 : 0; // Inspector 너비의 절반만큼 왼쪽으로 이동
          const scrollX = Math.max(0, (scaledWidth + paddingX * 2 - containerWidth) / 2 + inspectorOffset);
          const scrollY = Math.max(0, (scaledHeight + paddingY * 2 - containerHeight) / 2);
          container.scrollLeft = scrollX;
          container.scrollTop = scrollY;
        }
      }
    };
    
    // 초기 중앙 정렬 (Inspector 애니메이션 고려)
    const delay = isInspectorOpen ? 200 : 100; // Inspector 열림 시 더 긴 딜레이
    setTimeout(scrollToCenter, delay);
    window.addEventListener('resize', scrollToCenter);
    return () => window.removeEventListener('resize', scrollToCenter);
  }, [localZoom, viewport, components, scale, isInspectorOpen]);
  // 그리드 크기를 고정하여 줌 레벨에 관계없이 일관된 그리드 간격 유지
  const gridSize = GRID_SIZE; // 고정된 그리드 크기

  const handleSliderChange = (e) => {
    handleZoom(Number(e.target.value) - localZoom);
  };

  // ===== 뷰포트별 캔버스 크기 설정 =====
  const getCanvasStyles = () => {
    // 캔버스 기본 크기 정의
    const baseCanvasWidth = viewport === 'mobile' ? 375 : 1920;
    const baseCanvasHeight = viewport === 'mobile' ? 667 : 1080;
    
    // 컴포넌트들의 최대 위치 계산하여 동적 높이 결정
    let maxY = baseCanvasHeight;
    if (components && components.length > 0) {
      const componentsMaxY = Math.max(...components.map(comp => {
        const compDimensions = getComponentDimensions ? getComponentDimensions(comp.type) : { defaultHeight: 40 };
        return comp.y + (comp.height || compDimensions.defaultHeight);
      }));
      // 최소 여백 200px 추가
      maxY = Math.max(baseCanvasHeight, componentsMaxY + 200);
    }
    
    // 그리드가 딱 떨어지도록 계산
    const adjustedGridSize = gridSize;
    const gridColumns = Math.ceil(baseCanvasWidth / adjustedGridSize);
    const gridRows = Math.ceil(maxY / adjustedGridSize);
    const finalWidth = gridColumns * adjustedGridSize;
    const finalHeight = gridRows * adjustedGridSize;
    
    const baseStyles = {
      position: 'relative',
      background: showGrid ? `
        linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
        linear-gradient(0deg, #e5e7eb 1px, transparent 1px)
      ` : '#fff',
      backgroundSize: showGrid ? `${adjustedGridSize}px ${adjustedGridSize}px` : 'auto',
      backgroundPosition: showGrid ? '0 0' : '0 0',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      cursor: isDragging ? 'grabbing' : 'default',
      transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // 부드러운 크기 전환
      transformOrigin: 'top center', // 변형 기준점을 상단 중앙으로 변경
      margin: viewport === 'mobile' ? '0 auto' : '0', // 모바일만 중앙 정렬
      flexShrink: 0, // 크기 축소 방지
    };

    if (viewport === 'mobile') {
      return {
        ...baseStyles,
        width: `${finalWidth}px`,
        height: `${finalHeight}px`,
        transform: `scale(${scale})`,
      };
    }

    // 데스크톱 (기본값)
    return {
      ...baseStyles,
      width: `${finalWidth}px`,
      height: `${finalHeight}px`,
      transform: `scale(${scale})`,
    };
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#f0f1f5',
        cursor: isPanning ? 'grabbing' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        // 뷰포트별 스크롤 설정
        overflowX: viewport === 'mobile' ? 'hidden' : 'auto',
        overflowY: 'auto'
      }}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
    >
      {/* ===== OUTER WRAPPER: 캔버스 컨테이너 ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          // 스크롤을 위해 컨텐츠 크기에 맞춘 크기 설정
          width: viewport === 'mobile' ? '100%' : 'max-content',
          minHeight: '100%',
          // 뷰포트별 패딩 조정
          padding: viewport === 'mobile' ? '10px 20px' : '20px 60px',
          boxSizing: 'border-box'
        }}
      >
        {/* ===== INNER WRAPPER: 실제 캔버스 프레임 ===== */}
        <div
          ref={canvasRef}
          className={`canvas-frame viewport-${viewport}`}
          style={getCanvasStyles()}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          onClick={onClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* ===== 반응형 스타일링 ===== */}
          <style>{`
            /* 뷰포트별 기본 스타일 */
            .canvas-frame {
              font-family: 'Inter', 'Noto Sans KR', sans-serif;
            }
            
            /* 데스크톱 뷰 기본 스타일 */
            .canvas-frame.viewport-desktop {
              /* 데스크톱에서의 기본 스타일 */
            }
            
            /* 모바일 뷰 반응형 스타일 */
            .canvas-frame.viewport-mobile {
              /* 모바일에서 텍스트 크기 조정 */
            }
            
            /* 그리드 컴포넌트 반응형 */
            .canvas-frame .grid-component {
              display: grid;
              gap: 16px;
            }
            
            .canvas-frame.viewport-desktop .grid-component {
              grid-template-columns: repeat(2, 1fr);
            }
            
            .canvas-frame.viewport-mobile .grid-component {
              grid-template-columns: 1fr;
            }
            
            /* 텍스트 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .text-component {
              font-size: 14px !important;
              line-height: 1.4 !important;
            }
            
            /* 버튼 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .button-component {
              padding: 12px 16px !important;
              font-size: 14px !important;
            }
            
            /* 이미지 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .image-component {
              max-width: 100% !important;
              height: auto !important;
            }
            
            /* 뱅크 계좌 컴포넌트 반응형 */
            .canvas-frame.viewport-mobile .bank-account-component {
              padding: 12px !important;
            }
            
            .canvas-frame.viewport-mobile .bank-account-component .account-item {
              padding: 8px !important;
              font-size: 12px !important;
            }
          `}</style>
          {/* snapLines 렌더링 (정렬/간격/그리드/중앙선 타입별 색상) */}
          {snapLines.vertical.map((line, index) => (
            <div
              key={`v-${index}`}
              style={{
                position: 'absolute',
                left: line.x,
                top: 0,
                width: 2,
                height: '100%',
                background:
                  line.type === 'center' ? '#9C27B0' :
                  line.type === 'align' ? '#FF4081' :
                  line.type === 'spacing' ? '#00E676' :
                  '#FFB300',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: line.type === 'center' ? '0 0 12px rgba(156, 39, 176, 0.8)' :
                          line.type === 'align' ? '0 0 8px rgba(255, 64, 129, 0.6)' :
                          line.type === 'spacing' ? '0 0 8px rgba(0, 230, 118, 0.6)' :
                          '0 0 6px rgba(255, 179, 0, 0.5)',
                opacity: line.type === 'center' ? 1 : 0.9
              }}
            />
          ))}
          
          {snapLines.horizontal.map((line, index) => (
            <div
              key={`h-${index}`}
              style={{
                position: 'absolute',
                left: 0,
                top: line.y,
                width: '100%',
                height: 2,
                background:
                  line.type === 'center' ? '#9C27B0' :
                  line.type === 'align' ? '#FF4081' :
                  line.type === 'spacing' ? '#00E676' :
                  '#FFB300',
                zIndex: 1000,
                pointerEvents: 'none',
                boxShadow: line.type === 'center' ? '0 0 12px rgba(156, 39, 176, 0.8)' :
                          line.type === 'align' ? '0 0 8px rgba(255, 64, 129, 0.6)' :
                          line.type === 'spacing' ? '0 0 8px rgba(0, 230, 118, 0.6)' :
                          '0 0 6px rgba(255, 179, 0, 0.5)',
                opacity: line.type === 'center' ? 1 : 0.9
              }}
            />
          ))}

          {/* 캔버스 내 컴포넌트 렌더링 */}
          {components.map(comp => (
            <CanvasComponent
              key={comp.id}
              comp={comp}
              selected={selectedId === comp.id}
              onSelect={onSelect}
              onUpdate={onUpdate}
              onDelete={onDelete}
              setSnapLines={setSnapLines}
              zoom={localZoom}
              viewport={viewport}
              components={components}
            />
          ))}

          {/* 실시간 커서 표시 */}
          {Object.entries(users).map(([nick, u]) =>
            nick !== nickname ? (
              <UserCursor
                key={nick}
                x={u.x}
                y={u.y}
                color={u.color}
                nickname={nick}
              />
            ) : null
          )}

          {/* 선택 영역 표시 */}
          {selectedId && (
            <div style={{
              position: 'absolute',
              border: '2px solid #3B4EFF',
              borderRadius: 4,
              pointerEvents: 'none',
              zIndex: 5
            }} />
          )}
        </div>
      </div>

      {/* 줌 컨트롤과 페이지 확장 버튼 */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 1000
      }}>
        {/* 페이지 확장 버튼 */}
        <button
          onClick={() => {
            // 캔버스 높이를 200px 추가로 확장
            const baseHeight = viewport === 'mobile' ? 667 : 1080;
            // 이 기능은 동적 높이 계산에서 자동으로 처리됩니다
            // 임시로 더미 컴포넌트를 하단에 추가하여 높이 확장 효과를 줄 수 있습니다
            console.log('페이지 확장 기능 - 컴포넌트를 하단으로 드래그하면 자동으로 확장됩니다');
          }}
          style={{
            width: 48,
            height: 48,
            backgroundColor: '#3B4EFF',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(59, 78, 255, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 78, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 78, 255, 0.3)';
          }}
          title="페이지 확장 (컴포넌트를 하단으로 드래그하면 자동 확장)"
        >
          +
        </button>

        {/* 줌 컨트롤 */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 12,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          minWidth: 120
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            marginBottom: 4
          }}>
            줌: {localZoom}%
          </div>
          
          {/* 줌 버튼들 */}
          <div style={{
            display: 'flex',
            gap: 4
          }}>
            <button
              onClick={() => handleZoom(-25)}
              style={{
                width: 32,
                height: 32,
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#374151'
              }}
              title="축소"
            >
              -
            </button>
            <button
              onClick={() => handleZoom(25)}
              style={{
                width: 32,
                height: 32,
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                color: '#374151'
              }}
              title="확대"
            >
              +
            </button>
          </div>
          
          {/* 줌 슬라이더 */}
          <input
            type="range"
            min="25"
            max="400"
            value={localZoom}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              height: 4,
              background: '#e5e7eb',
              borderRadius: 2,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          
          {/* 리셋 버튼 */}
          <button
            onClick={() => {
              setLocalZoom(100);
              if (onZoomChange) onZoomChange(100);
            }}
            style={{
              width: '100%',
              height: 24,
              backgroundColor: '#3B4EFF',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500
            }}
            title="100%로 리셋"
          >
            리셋
          </button>
        </div>
      </div>

      {/* 스크롤바 스타일링 */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default CanvasArea;
