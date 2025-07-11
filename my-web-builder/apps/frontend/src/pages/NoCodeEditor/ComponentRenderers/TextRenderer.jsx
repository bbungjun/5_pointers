import React, { useState, useRef, useEffect } from 'react';

function TextRenderer({ comp, component, isEditor = false, isPreview = false }) {
  // comp 또는 component 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(actualComp?.props?.text || '');
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditor && !isPreview) {
      setEditing(true);
      setEditValue(actualComp?.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (actualComp?.props?.text || '')) {
      alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (actualComp?.props?.text || '')) {
        alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  if (editing && isEditor && !isPreview) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ fontSize: actualComp?.props?.fontSize }}
      />
    );
  }

  return (
    <div 
      className={`${isEditor ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center justify-center transition-all duration-200 hover:opacity-80 ${
        actualComp?.props?.bold ? 'font-bold' : 'font-normal'
      } ${
        actualComp?.props?.italic ? 'italic' : 'not-italic'
      } ${
        actualComp?.props?.underline ? 'underline' : 'no-underline'
      }`}
      style={{
        color: actualComp?.props?.color, 
        fontSize: actualComp?.props?.fontSize
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span style={{ whiteSpace: 'pre-wrap', width: '100%' }}>
        {actualComp?.props?.text || ''}
      </span>
    </div>
  );
}

export default TextRenderer;