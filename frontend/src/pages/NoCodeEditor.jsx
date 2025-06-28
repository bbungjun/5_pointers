import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import { ComponentDefinitions } from './components/definitions';

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
function CanvasComponent({ comp, selected, onSelect, onUpdate, onDelete }) {
  const ref = useRef();

  // 더블클릭 시 텍스트 편집
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);

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
            width: 120,
            border: '1px solid #3B4EFF',
            borderRadius: 4,
            padding: 4
          }}
        />
      );
    }

    switch (comp.type) {
      case 'link':
        return (
          <a 
            href={comp.props.href} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: comp.props.color, 
              textDecoration: 'none',
              pointerEvents: 'none' // 에디터 모드에서는 클릭 방지
            }}
          >
            {comp.props.text}
          </a>
        );
      case 'wedding-review':
        return (
          <div style={{ width: 300, padding: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              💒 {comp.props.venueName}
            </div>
            {loading ? (
              <div style={{ fontSize: 12, color: '#666' }}>후기 불러오는 중...</div>
            ) : reviews.length > 0 ? (
              <div style={{ fontSize: 12, color: '#666' }}>
                {reviews.length}개의 후기
              </div>
            ) : (
              <div style={{ fontSize: 12, color: '#666' }}>
                네이버 API 키가 필요합니다. (임시: 5개의 후기)
              </div>
            )}
          </div>
        );
      case 'attend':
        return (
          <div style={{
            width: 280,
            padding: 16,
            backgroundColor: comp.props.backgroundColor,
            borderRadius: 8,
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, color: '#333' }}>
              👥 {comp.props.title}
            </h3>
            <p style={{ 
              margin: '0 0 16px 0', 
              fontSize: 14, 
              color: '#666',
              lineHeight: 1.4
            }}>
              {comp.props.description}
            </p>
            <button
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: comp.props.buttonColor,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.8'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
              onClick={(e) => {
                e.stopPropagation();
                // 참석 기능은 나중에 구현
                alert('참석 기능은 배포 모드에서 사용 가능합니다.');
              }}
            >
              {comp.props.buttonText}
            </button>
            <div style={{ 
              marginTop: 12, 
              fontSize: 12, 
              color: '#888',
              textAlign: 'center'
            }}>
              최대 {comp.props.maxAttendees}명 참석 가능
            </div>
          </div>
        );
      default:
        return <span>{comp.props.text}</span>;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: comp.x, top: comp.y,
        minWidth: 80, minHeight: 40,
        border: selected ? '2px solid #3B4EFF' : '1px solid #bbb',
        borderRadius: 8,
        background: comp.type === 'button' ? comp.props.bg : 'transparent',
        color: comp.props.color,
        fontSize: comp.props.fontSize,
        padding: 12,
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: selected ? 10 : 1,
        boxShadow: selected ? '0 2px 12px #3b4eff22' : '0 1px 4px #bbb2',
        transition: 'box-shadow 0.2s'
      }}
      tabIndex={0}
      onClick={e => { e.stopPropagation(); onSelect(comp.id); }}
      onDoubleClick={e => {
        e.stopPropagation();
        if (comp.type === 'text' || comp.type === 'button' || comp.type === 'link') setEditing(true);
      }}
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('componentId', comp.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {renderContent()}
      {/* 삭제 버튼 (선택 시만) */}
      {selected && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(comp.id); }}
          style={{
            position: 'absolute', top: -12, right: -12,
            background: '#FF3B3B', color: '#fff', border: 'none', borderRadius: '50%',
            width: 24, height: 24, cursor: 'pointer', fontWeight: 'bold'
          }}
          title="Delete"
        >×</button>
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

  // 사용자 정보
  const [nickname] = useState(randomNickname());
  const [color] = useState(randomColor());

  // 캔버스 ref
  const canvasRef = useRef();

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
      const compDef = ComponentDefinitions[type];
      if (compDef) {
        const yComponents = ydoc.getArray('components');
        yComponents.push([{
          id: Math.random().toString(36).slice(2, 10),
          type,
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
          props: { ...compDef.defaultProps }
        }]);
      }
    }
  };

  // 캔버스 내 컴포넌트 드래그 이동
  const handleComponentDrop = e => {
    e.preventDefault();
    const compId = e.dataTransfer.getData('componentId');
    if (compId) {
      const yComponents = ydoc.getArray('components');
      const idx = yComponents.toArray().findIndex(c => c.id === compId);
      if (idx !== -1) {
        const comp = { ...yComponents.get(idx) };
        comp.x = e.nativeEvent.offsetX;
        comp.y = e.nativeEvent.offsetY;
        yComponents.delete(idx, 1);
        yComponents.insert(idx, [comp]);
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

  // 속성 변경
  const handleUpdate = comp => {
    const yComponents = ydoc.getArray('components');
    const idx = yComponents.toArray().findIndex(c => c.id === comp.id);
    if (idx !== -1) {
      yComponents.delete(idx, 1);
      yComponents.insert(idx, [comp]);
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
      <ComponentLibrary onDragStart={(e, type) => {
        e.dataTransfer.setData('componentType', type);
        e.dataTransfer.effectAllowed = 'copy';
      }} />

      {/* 중앙: 캔버스 */}
      <CanvasArea
        canvasRef={canvasRef}
        components={components}
        selectedId={selectedId}
        users={users}
        nickname={nickname}
        onDrop={e => { handleDrop(e); handleComponentDrop(e); }}
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
      <Inspector
        selectedComp={selectedComp}
        onUpdate={handleUpdate}
        color={color}
        nickname={nickname}
        roomId={roomId}
      />

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