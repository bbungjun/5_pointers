import React, { useState, useRef, useEffect } from 'react';

// 사용 가능한 폰트 목록
const AVAILABLE_FONTS = [
  'Playfair Display',
  'Adelio Darmanto',
  'Bodoni',
  'Brooke Smith Script',
  'Chalisa Oktavia',
  'Dearly Loved One',
  'Deluxe Edition',
  'Dreamland',
  'EB Garamond',
  'Elsie',
  'England Hand',
  'Hijrnotes',
  'La Paloma',
  'Millerstone',
  'Montserrat',
  'Pinyon Script',
  'Prata',
  'Underland'
];

function TextRenderer({ comp, mode = 'live', width, height }) {
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      
      const handleResize = () => {
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props?.text || '');
  const inputRef = useRef();
  const textRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (textRef.current && comp?.props?.fontFamily) {
      textRef.current.style.setProperty('font-family', comp.props.fontFamily, 'important');
    }
  }, [comp?.props?.fontFamily]);

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

  // 폰트 관련 속성들
  const fontFamily = comp?.props?.fontFamily || 'Playfair Display, serif';
  const textAlign = comp?.props?.textAlign || 'left';
  const lineHeight = comp?.props?.lineHeight || 1.2;
  const letterSpacing = comp?.props?.letterSpacing || 0;
  const fontWeight = comp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp?.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  if (editing && mode === 'editor') {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ 
          fontSize: comp.props?.fontSize,
          fontFamily: fontFamily,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: letterSpacing + 'px',
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform
        }}
      />
    );
  }

  return (
    <div 
      ref={textRef}
      className={`${mode === 'editor' ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center transition-all duration-200 hover:opacity-80`}
      style={{
        color: comp.props?.color,
        fontFamily: fontFamily,
        textAlign: textAlign,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        justifyContent: textAlign === 'left' ? 'flex-start' : 
                       textAlign === 'right' ? 'flex-end' : 'center',
        zIndex: Math.max(comp.props?.zIndex || 1000, 1000),
        ...(mode === 'live' ? {
          width: '100%',
          fontSize: `clamp(${Math.max(10, (comp.props?.fontSize || 16) * 0.7)}px, ${((comp.props?.fontSize || 16) / 375) * 100}vw, ${comp.props?.fontSize || 16}px)`
        } : {
          fontSize: comp.props?.fontSize
        })
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span style={{ 
        whiteSpace: 'pre-wrap', 
        width: '100%',
        textAlign: textAlign,
        transform: italicTransform,
        display: 'inline-block'
      }}>
        {comp.props?.text || ''}
      </span>
    </div>
  );
}

export default TextRenderer;