import React, { useState, useRef, useEffect } from 'react';

function LinkRenderer({ comp, mode = 'live', width, height }) {
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      
      const handleResize = () => {
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
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
    if (mode === 'editor') {
      setEditing(true);
      setEditValue(comp.props.text);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode !== 'editor' && comp.props.href) {
      const url = comp.props.href;
      // URL 형식 확인 및 보정
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else if (url.startsWith('www.')) {
        window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
      } else if (url.includes('.')) {
        window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
      } else {
        // 상대 경로나 다른 형태의 링크
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== comp.props.text) {
      alert('링크 텍스트가 변경되었습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== comp.props.text) {
        alert('링크 텍스트가 변경되었습니다.');
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
        style={{ fontSize: comp.props.fontSize, whiteSpace: 'pre-wrap' }} // ✅ 줄바꿈 지원
      />
    );
  }

  return (
    <div 
        className={`${mode === 'editor' ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center justify-center underline cursor-pointer transition-all duration-200 hover:opacity-70 hover:scale-105 active:scale-95`}
      style={{
        color: comp.props.color || '#D8BFD8', 
        fontSize: mode === 'live' ? `clamp(${Math.max(10, (comp.props.fontSize || 16) * 0.7)}px, ${((comp.props.fontSize || 16) / 375) * 100}vw, ${comp.props.fontSize || 16}px)` : comp.props.fontSize || '16px',
        whiteSpace: 'pre-wrap',
        textDecoration: 'underline',
        fontFamily: comp.props.fontFamily || 'Montserrat, sans-serif'
      }}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      title={comp.props.href ? `링크: ${comp.props.href}` : '링크 URL이 설정되지 않았습니다'}
    >
      {comp.props.text || '링크 텍스트'}
    </div>
  );
}

export default LinkRenderer;