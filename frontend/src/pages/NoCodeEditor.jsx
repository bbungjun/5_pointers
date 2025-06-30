import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import { ComponentDefinitions } from './components/definitions';
import ButtonRenderer from './NoCodeEditor/ComponentRenderers/ButtonRenderer';
import TextRenderer from './NoCodeEditor/ComponentRenderers/TextRenderer';
import LinkRenderer from './NoCodeEditor/ComponentRenderers/LinkRenderer';
import AttendRenderer from './NoCodeEditor/ComponentRenderers/AttendRenderer';
import MapView from './NoCodeEditor/ComponentEditors/MapView';
import DdayRenderer from './NoCodeEditor/ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './NoCodeEditor/ComponentRenderers/WeddingContactRenderer.jsx';
import ImageRenderer from './NoCodeEditor/ComponentRenderers/ImageRenderer';
import { MapInfoRenderer } from './NoCodeEditor/ComponentRenderers';
import CalendarRenderer from './NoCodeEditor/ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './NoCodeEditor/ComponentRenderers/BankAccountRenderer';

// 랜덤 닉네임/색상 생성
function randomNickname() {
  const animals = ['Tiger', 'Bear', 'Fox', 'Wolf', 'Cat', 'Dog', 'Lion', 'Panda', 'Rabbit', 'Eagle'];
  return animals[Math.floor(Math.random() * animals.length)] + Math.floor(Math.random() * 100);
}
function randomColor() {
  const colors = ['#3B4EFF', '#FF3B3B', '#00B894', '#FDCB6E', '#6C5CE7', '#00B8D9', '#FF7675', '#636E72'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 캔버스 내 드래그 가능한 컴포넌트
function CanvasComponent({ comp, selected, onSelect, onUpdate, onDelete, setSnapLines }) {
  const ref = useRef();

  // 더블클릭 시 텍스트 편집
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, compX: 0, compY: 0 });

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  const renderContent = () => {
    if (editing) {
      return (
        <input
          ref={ref}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => { setEditing(false); onUpdate({ ...comp, props: { ...comp.props, text: editValue } }); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setEditing(false);
              onUpdate({ ...comp, props: { ...comp.props, text: editValue } });
            }
          }}
          style={{
            fontSize: comp.props.fontSize,
            width: '100%',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit'
          }}
        />
      );
    }

    switch (comp.type) {
      case 'button':
        return <ButtonRenderer comp={comp} isEditor={true} />;
      case 'text':
        return <TextRenderer comp={comp} isEditor={true} />;
      case 'link':
        return <LinkRenderer comp={comp} isEditor={true} />;
      case 'attend':
        return <AttendRenderer comp={comp} isEditor={true} />;
      case 'map':
        return <MapView {...comp.props} />;
      case 'dday':
        return <DdayRenderer comp={comp} isEditor={true} />;
      case 'weddingContact':
        return <WeddingContactRenderer comp={comp} isEditor={true} />;
      case 'image':
        return <ImageRenderer comp={comp} isEditor={true} onUpdate={onUpdate} />;
      case 'mapInfo':
        return <MapInfoRenderer comp={comp} isEditor={true} />;
      case 'calendar':
        return <CalendarRenderer comp={comp} isEditor={true} />;
      case 'bankAccount':
        return <BankAccountRenderer comp={comp} isEditor={true} />;
      default:
        return <span>{comp.props.text}</span>;
    }
  };

  // 리사이즈 핸들러
  const handleResizeStart = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: comp.width || 120,
      height: comp.height || 40,
      corner: corner
    });
  };

  const handleResize = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // 그리드에 스냅된 크기 계산
    const gridSize = 50;
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    // 모서리별 리사이즈 로직
    switch (resizeStart.corner) {
      case 'se':
        newWidth = Math.max(100, Math.round((resizeStart.width + deltaX) / gridSize) * gridSize);
        newHeight = Math.max(50, Math.round((resizeStart.height + deltaY) / gridSize) * gridSize);
        break;
      case 'sw':
        newWidth = Math.max(100, Math.round((resizeStart.width - deltaX) / gridSize) * gridSize);
        newHeight = Math.max(50, Math.round((resizeStart.height + deltaY) / gridSize) * gridSize);
        break;
      case 'ne':
        newWidth = Math.max(100, Math.round((resizeStart.width + deltaX) / gridSize) * gridSize);
        newHeight = Math.max(50, Math.round((resizeStart.height - deltaY) / gridSize) * gridSize);
        break;
      case 'nw':
        newWidth = Math.max(100, Math.round((resizeStart.width - deltaX) / gridSize) * gridSize);
        newHeight = Math.max(50, Math.round((resizeStart.height - deltaY) / gridSize) * gridSize);
        break;
    }

    onUpdate({
      ...comp,
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // 드래그 핸들러
  const handleDragStart = (e) => {
    if (isResizing) return;

    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      compX: comp.x,
      compY: comp.y
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // 그리드에 스냅된 위치 계산
    const gridSize = 50;
    const newX = Math.round((dragStart.compX + deltaX) / gridSize) * gridSize;
    const newY = Math.round((dragStart.compY + deltaY) / gridSize) * gridSize;

    onUpdate({
      ...comp,
      x: newX,
      y: newY
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // 드래그가 끝나면 스냅라인 숨기기
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 리사이즈 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = handleResize;
      const handleMouseUp = handleResizeEnd;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart]);

  // 드래그 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = handleDrag;
      const handleMouseUp = handleDragEnd;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      style={{
        position: 'absolute',
        left: comp.x,
        top: comp.y,
        width: comp.width || 'auto',
        height: comp.height || 'auto',
        minWidth: 100,
        minHeight: 50,
        border: selected ? '2px solid #3B4EFF' : '1px solid transparent',
        borderRadius: 8,
        background: comp.type === 'button' ? comp.props.bg : 'transparent',
        color: comp.props.color,
        fontSize: comp.props.fontSize,
        padding: comp.type === 'button' ? 12 : 0,
        cursor: selected ? 'move' : 'pointer',
        userSelect: 'none',
        zIndex: selected ? 10 : 1,
        boxShadow: selected ? '0 4px 20px rgba(59, 78, 255, 0.15)' : '0 1px 4px rgba(0,0,0,0.1)',
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.2s, border-color 0.2s',
        outline: 'none'
      }}
      tabIndex={0}
      onClick={e => {
        if (!isDragging && !isResizing) {
          e.stopPropagation();
          onSelect(comp.id);
        }
      }}
      onDoubleClick={e => {
        e.stopPropagation();
        if (comp.type === 'text' || comp.type === 'button' || comp.type === 'link') setEditing(true);
      }}
      onMouseDown={handleDragStart}
    >
      {renderContent()}

      {/* Figma 스타일 선택 핸들 */}
      {selected && (
        <>
          {/* 모서리 리사이즈 핸들 */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* 중앙 삭제 버튼 */}
          <button
            onClick={e => { e.stopPropagation(); onDelete(comp.id); }}
            style={{
              position: 'absolute',
              top: -20,
              right: -20,
              background: '#FF3B3B',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 59, 59, 0.3)',
              transition: 'all 0.2s',
              zIndex: 12
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.background = '#ff5252';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = '#FF3B3B';
            }}
            title="Delete"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

// 사용자 커서 표시
function UserCursor({ x, y, color, nickname }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: color, border: '2px solid #fff', boxShadow: '0 1px 4px #0002'
      }} />
      <div style={{
        marginTop: 2, fontSize: 12, color: color, fontWeight: 'bold',
        background: '#fff', borderRadius: 4, padding: '2px 6px', boxShadow: '0 1px 4px #0001'
      }}>{nickname}</div>
    </div>
  );
}

function NoCodeEditor() {
  const { roomId } = useParams();

  // Yjs 문서 및 provider
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState(null);

  // Yjs 상태
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [inspector, setInspector] = useState({});
  const [users, setUsers] = useState({});
  const [myCursor, setMyCursor] = useState({ x: 0, y: 0 });

  // 스냅라인 상태
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });

  // 사용자 정보
  const [nickname] = useState(randomNickname());
  const [color] = useState(randomColor());

  // 캔버스 ref
  const canvasRef = useRef();

  // 스냅라인 계산 함수
  const calculateSnapLines = (draggedComp, allComponents) => {
    if (!draggedComp) return { vertical: [], horizontal: [] };

    const snapThreshold = 10; // 스냅 감지 거리
    const verticalLines = [];
    const horizontalLines = [];

    // 드래그된 컴포넌트의 경계
    const draggedLeft = draggedComp.x;
    const draggedRight = draggedComp.x + (draggedComp.width || 120);
    const draggedTop = draggedComp.y;
    const draggedBottom = draggedComp.y + (draggedComp.height || 40);
    const draggedCenterX = draggedComp.x + (draggedComp.width || 120) / 2;
    const draggedCenterY = draggedComp.y + (draggedComp.height || 40) / 2;

    allComponents.forEach(comp => {
      if (comp.id === draggedComp.id) return;

      const compLeft = comp.x;
      const compRight = comp.x + (comp.width || 120);
      const compTop = comp.y;
      const compBottom = comp.y + (comp.height || 40);
      const compCenterX = comp.x + (comp.width || 120) / 2;
      const compCenterY = comp.y + (comp.height || 40) / 2;

      // 수직 스냅라인 (왼쪽, 중앙, 오른쪽)
      if (Math.abs(draggedLeft - compLeft) < snapThreshold) {
        verticalLines.push({ x: compLeft, type: 'left' });
      }
      if (Math.abs(draggedCenterX - compCenterX) < snapThreshold) {
        verticalLines.push({ x: compCenterX, type: 'center' });
      }
      if (Math.abs(draggedRight - compRight) < snapThreshold) {
        verticalLines.push({ x: compRight, type: 'right' });
      }

      // 수평 스냅라인 (위, 중앙, 아래)
      if (Math.abs(draggedTop - compTop) < snapThreshold) {
        horizontalLines.push({ y: compTop, type: 'top' });
      }
      if (Math.abs(draggedCenterY - compCenterY) < snapThreshold) {
        horizontalLines.push({ y: compCenterY, type: 'center' });
      }
      if (Math.abs(draggedBottom - compBottom) < snapThreshold) {
        horizontalLines.push({ y: compBottom, type: 'bottom' });
      }
    });

    return { vertical: verticalLines, horizontal: horizontalLines };
  };

  // Yjs 초기화 및 실시간 동기화
  useEffect(() => {
    // y-websocket 서버 주소 (테스트용: public yjs 서버)
    const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', roomId, ydoc);

    // 컴포넌트 리스트 동기화
    const yComponents = ydoc.getArray('components');
    const updateComponents = () => setComponents(yComponents.toArray());
    yComponents.observeDeep(updateComponents);
    updateComponents();

    // 선택/속성 동기화
    const yInspector = ydoc.getMap('inspector');
    const updateInspector = () => setInspector({ ...yInspector.toJSON() });
    yInspector.observeDeep(updateInspector);
    updateInspector();

    // 커서/유저 동기화 (비활성화)
    // wsProvider.awareness.setLocalStateField('user', { nickname, color });
    // wsProvider.awareness.setLocalStateField('cursor', myCursor);
    // const onAwarenessChange = () => {
    //   const states = Array.from(wsProvider.awareness.getStates().values());
    //   const userMap = {};
    //   states.forEach(state => {
    //     if (state.user && state.cursor) {
    //       userMap[state.user.nickname] = { ...state.user, ...state.cursor };
    //     }
    //   });
    //   setUsers(userMap);
    // };
    // wsProvider.awareness.on('change', onAwarenessChange);
    // setProvider(wsProvider);

    return () => {
      yComponents.unobserveDeep(updateComponents);
      yInspector.unobserveDeep(updateInspector);
      // wsProvider.awareness.off('change', onAwarenessChange);
      // wsProvider.destroy();
      ydoc.destroy();
    };
    // eslint-disable-next-line
  }, [roomId]);

  // 커서 위치 실시간 전송
  useEffect(() => {
    if (provider) {
      provider.awareness.setLocalStateField('cursor', myCursor);
    }
  }, [myCursor, provider]);

  // 캔버스에서 드래그 앤 드롭으로 컴포넌트 추가
  const handleDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      const compDef = ComponentDefinitions.find(def => def.type === type);
      if (compDef) {
        // 그리드에 스냅된 위치 계산
        const gridSize = 50;
        const snappedX = Math.round(e.nativeEvent.offsetX / gridSize) * gridSize;
        const snappedY = Math.round(e.nativeEvent.offsetY / gridSize) * gridSize;

        const yComponents = ydoc.getArray('components');
        yComponents.push([{
          id: Math.random().toString(36).slice(2, 10),
          type,
          x: snappedX,
          y: snappedY,
          props: { ...compDef.defaultProps }
        }]);
      }
    }
  };

  // 캔버스에서 마우스 이동 시 커서 위치 전송
  const handleMouseMove = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMyCursor({
      x: e.clientX - rect.left + canvasRef.current.scrollLeft,
      y: e.clientY - rect.top + canvasRef.current.scrollTop
    });
  };

  // 컴포넌트 선택
  const handleSelect = id => {
    setSelectedId(id);
    ydoc.getMap('inspector').set('selectedId', id);
  };

  // 속성 변경 (스냅라인 포함)
  const handleUpdate = comp => {
    const yComponents = ydoc.getArray('components');
    const idx = yComponents.toArray().findIndex(c => c.id === comp.id);
    if (idx !== -1) {
      yComponents.delete(idx, 1);
      yComponents.insert(idx, [comp]);

      // 스냅라인 계산
      const lines = calculateSnapLines(comp, components);
      setSnapLines(lines);
    }
  };

  // 컴포넌트 삭제
  const handleDelete = id => {
    const yComponents = ydoc.getArray('components');
    const idx = yComponents.toArray().findIndex(c => c.id === id);
    if (idx !== -1) yComponents.delete(idx, 1);
    if (selectedId === id) setSelectedId(null);
  };

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [selectedId, components]);

  // 속성 인스펙터
  const selectedComp = components.find(c => c.id === selectedId);

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex',
      background: '#fff', color: '#222', fontFamily: 'Inter, sans-serif'
    }}>
      {/* 좌측: 컴포넌트 라이브러리 */}
      <ComponentLibrary
        onDragStart={(e, type) => {
          e.dataTransfer.setData('componentType', type);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        components={components}
        roomId={roomId}
      />

      {/* 중앙: 캔버스 */}
      <CanvasArea
        canvasRef={canvasRef}
        components={components}
        selectedId={selectedId}
        users={users}
        nickname={nickname}
        snapLines={snapLines}
        onDrop={e => { handleDrop(e); }}
        onDragOver={e => e.preventDefault()}
        onClick={() => handleSelect(null)}
        onMouseMove={handleMouseMove}
        onSelect={handleSelect}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        CanvasComponent={CanvasComponent}
        UserCursor={UserCursor}
      />

      {/* 우측: 속성 인스펙터 */}
      {selectedComp && (
        <Inspector
          selectedComp={selectedComp}
          onUpdate={handleUpdate}
          color={color}
          nickname={nickname}
          roomId={roomId}
        />
      )}

      {/* 스타일 태그로 high-contrast, readable 스타일 보장 */}
      <style>{`
        body { margin: 0; }
        input, button { outline: none; }
        ::selection { background: #3B4EFF22; }
      `}</style>
    </div>
  );
}

export default NoCodeEditor;