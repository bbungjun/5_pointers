// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React, { useState, useEffect } from 'react';

function CanvasArea({
  canvasRef,
  components,
  selectedId,
  users,
  nickname,
  snapLines,
  onDrop, onDragOver,
  onClick, onMouseMove,
  onSelect,
  onUpdate,
  onDelete,
  CanvasComponent,
  UserCursor
}) {
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);

  // 줌 핸들러
  const handleZoom = (delta) => {
    setZoom(prev => Math.max(25, Math.min(400, prev + delta)));
  };

  // 마우스 휠로 줌
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
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

  // 패닝 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  // 그리드 크기 계산 (줌에 따라 조정)
  const gridSize = Math.max(20, Math.floor(50 * zoom / 100));

  return (
    <div
      style={{
        flex: 1,
        minHeight: '100vh',
        background: '#f0f1f5',
        overflow: 'auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 줌 컨트롤 */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        background: '#fff',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
        <button
          onClick={() => handleZoom(-25)}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: '#f8f9fa',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          -
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, minWidth: 40, textAlign: 'center' }}>
          {zoom}%
        </span>
        <button
          onClick={() => handleZoom(25)}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: '#f8f9fa',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
        >
          +
        </button>
      </div>

      {/* 그리드 토글 버튼 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: '#fff',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setShowGrid(!showGrid)}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: showGrid ? '#3B4EFF' : '#f8f9fa',
            color: showGrid ? '#fff' : '#333',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 'bold'
          }}
          title="Toggle Grid (G)"
        >
          ⊞
        </button>
      </div>

      {/* 캔버스 컨테이너 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onWheel={handleWheel}
      >
        {/* 실제 캔버스 */}
        <div
          ref={canvasRef}
          style={{
            position: 'relative',
            width: '1920px',
            height: '1080px',
            background: showGrid ? `
              linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
              linear-gradient(0deg, #e5e7eb 1px, transparent 1px)
            ` : '#fff',
            backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto',
            backgroundPosition: showGrid ? `${pan.x}px ${pan.y}px` : '0 0',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            cursor: isDragging ? 'grabbing' : 'default',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'top left',
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={onClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 스냅라인 렌더링 */}
          {snapLines.vertical.map((line, index) => (
            <div
              key={`v-${index}`}
              style={{
                position: 'absolute',
                left: line.x,
                top: 0,
                width: 1,
                height: '100%',
                background: '#3B4EFF',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(59, 78, 255, 0.5)'
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
                height: 1,
                background: '#3B4EFF',
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 0 4px rgba(59, 78, 255, 0.5)'
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
