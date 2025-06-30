// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React, { useState, useEffect, useRef } from 'react';

// 그리드 크기 상수 import 또는 선언
const GRID_SIZE = 50;

function CanvasArea({
  canvasRef,
  containerRef,
  components,
  selectedId,
  users,
  nickname,
  snapLines,
  onDrop, onDragOver,
  onClick, onMouseMove, onMouseUp,
  onSelect,
  onUpdate,
  onDelete,
  CanvasComponent,
  UserCursor,
  zoom = 100,
  onZoomChange
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
    if (typeof setSnapLines === 'function') {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 마우스 업 시 드래그 상태 해제
  const handleMouseUp = (e) => {
    setIsDragging(false);
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

  useEffect(() => {
    const scrollToCenter = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const canvasWidth = 1920 * (localZoom / 100);
        const canvasHeight = 1080 * (localZoom / 100);
        container.scrollLeft = (canvasWidth - container.clientWidth) / 2;
        container.scrollTop = (canvasHeight - container.clientHeight) / 2;
      }
    };
    scrollToCenter();
    window.addEventListener('resize', scrollToCenter);
    return () => window.removeEventListener('resize', scrollToCenter);
  }, [localZoom]);

  const scale = localZoom / 100;
  // 그리드 크기를 고정하여 줌 레벨에 관계없이 일관된 그리드 간격 유지
  const gridSize = GRID_SIZE; // 고정된 그리드 크기

  const handleSliderChange = (e) => {
    handleZoom(Number(e.target.value) - localZoom);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        background: '#f0f1f5',
        cursor: isPanning ? 'grabbing' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
    >
      {/* 실제 캔버스 */}
      <div
        ref={canvasRef}
        style={{
          position: 'relative',
          width: '1920px',
          height: '1080px',
          margin: 'auto',
          background: showGrid ? `
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(0deg, #e5e7eb 1px, transparent 1px)
          ` : '#fff',
          backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto',
          backgroundPosition: showGrid ? '0 0' : '0 0',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          cursor: isDragging ? 'grabbing' : 'default',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
        onDrop={handleDrop}
        onDragOver={onDragOver}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* snapLines 렌더링 (정렬/간격/그리드 타입별 색상) */}
        {isDragging && snapLines.vertical.map((line, index) => (
          <div
            key={`v-${index}`}
            style={{
              position: 'absolute',
              left: line.x,
              top: 0,
              width: 1,
              height: '100%',
              background:
                line.type === 'align' ? '#3B4EFF' :
                line.type === 'spacing' ? '#FFB300' :
                '#BDBDBD',
              zIndex: 100,
              pointerEvents: 'none',
              boxShadow: line.type === 'align' ? '0 0 4px rgba(59, 78, 255, 0.5)' : 'none'
            }}
          />
        ))}
        
        {isDragging && snapLines.horizontal.map((line, index) => (
          <div
            key={`h-${index}`}
            style={{
              position: 'absolute',
              left: 0,
              top: line.y,
              width: '100%',
              height: 1,
              background:
                line.type === 'align' ? '#3B4EFF' :
                line.type === 'spacing' ? '#FFB300' :
                '#BDBDBD',
              zIndex: 100,
              pointerEvents: 'none',
              boxShadow: line.type === 'align' ? '0 0 4px rgba(59, 78, 255, 0.5)' : 'none'
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
            zoom={localZoom}
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
