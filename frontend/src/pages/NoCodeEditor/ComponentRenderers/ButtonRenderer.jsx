import React, { useState, useRef, useEffect } from 'react';

function ButtonRenderer({ comp, isEditor = false }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditor) {
      setEditing(true);
      setEditValue(comp.props.text);
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== comp.props.text) {
      alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== comp.props.text) {
        alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  if (editing && isEditor) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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

  return (
    <div 
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: comp.props.bg, color: comp.props.color,
        fontSize: comp.props.fontSize, fontWeight: 'bold',
        borderRadius: 6, cursor: 'pointer'
      }}
      onDoubleClick={handleDoubleClick}
    >
      {comp.props.text}
    </div>
  );
}

export default ButtonRenderer; 