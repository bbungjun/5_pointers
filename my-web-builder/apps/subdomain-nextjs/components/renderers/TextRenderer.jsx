import React, { useState, useRef, useEffect } from 'react';

function TextRenderer({ comp, mode = 'live', width, height }) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      setIsLiveMode(window.innerWidth <= 768);
      
      const handleResize = () => {
        setIsLiveMode(window.innerWidth <= 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props?.text || '');
  const inputRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (mode === 'editor') {
      setEditing(true);
      setEditValue(comp.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (comp.props?.text || '')) {
      alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (comp.props?.text || '')) {
        alert('텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  if (editing && mode === 'editor') {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ fontSize: comp.props?.fontSize }}
      />
    );
  }

  return (
    <div 
      className={`${mode === 'editor' ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center justify-center transition-all duration-200 hover:opacity-80 ${
        comp.props?.bold ? 'font-bold' : 'font-normal'
      } ${
        comp.props?.italic ? 'italic' : 'not-italic'
      } ${
        comp.props?.underline ? 'underline' : 'no-underline'
      }`}
      style={{
        color: comp.props?.color,
        ...(isLiveMode ? {
          width: '100%',
          fontSize: `clamp(${Math.max(10, (comp.props?.fontSize || 16) * 0.7)}px, ${((comp.props?.fontSize || 16) / 375) * 100}vw, ${comp.props?.fontSize || 16}px)`
        } : {
          fontSize: comp.props?.fontSize
        })
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span style={{ whiteSpace: 'pre-wrap', width: '100%' }}>
        {comp.props?.text || ''}
      </span>
    </div>
  );
}

export default TextRenderer;