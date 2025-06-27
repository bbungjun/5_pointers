import React from 'react';

function CanvasArea({
  canvasRef,
  components,
  selectedId,
  users,
  nickname,
  onDrop,
  onDragOver,
  onClick,
  onMouseMove,
  onSelect,
  onUpdate,
  onDelete,
  CanvasComponent,
  UserCursor
}) {
  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1, minHeight: '100vh', position: 'relative',
        background: '#f5f6fa', overflow: 'auto'
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={onClick}
      onMouseMove={onMouseMove}
    >
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
          <UserCursor key={nick} x={u.x} y={u.y} color={u.color} nickname={nick} />
        ) : null
      )}
    </div>
  );
}

export default CanvasArea; 