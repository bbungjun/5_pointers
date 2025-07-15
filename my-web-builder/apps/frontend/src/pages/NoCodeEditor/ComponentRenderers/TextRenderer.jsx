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

function TextRenderer({ comp, component, mode = 'editor', isPreview = false, isSelected = false, onUpdate }) {

  // comp 또는 component 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(actualComp?.props?.text || '');
  const inputRef = useRef();
  const textRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (textRef.current && actualComp?.props?.fontFamily) {
      textRef.current.style.setProperty('font-family', actualComp.props.fontFamily, 'important');
    }
  }, [actualComp?.props?.fontFamily]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (mode === 'editor' && !isPreview) {
      setEditing(true);
      setEditValue(actualComp?.props?.text || '');
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (mode === 'editor' && !isPreview && isSelected && !editing) {
      setEditing(true);
      setEditValue(actualComp?.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (actualComp?.props?.text || '') && onUpdate) {
      onUpdate({
        ...actualComp,
        props: {
          ...actualComp.props,
          text: editValue
        }
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (actualComp?.props?.text || '') && onUpdate) {
        onUpdate({
          ...actualComp,
          props: {
            ...actualComp.props,
            text: editValue
          }
        });
      }
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(actualComp?.props?.text || '');
    }
  };

  // 폰트 관련 속성들
  const fontFamily = actualComp?.props?.fontFamily || 'Playfair Display, serif';
  const textAlign = actualComp?.props?.textAlign || 'left';
  const lineHeight = actualComp?.props?.lineHeight || 1.2;
  const letterSpacing = actualComp?.props?.letterSpacing || 0;
  const fontWeight = actualComp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = actualComp?.props?.textDecoration ? 'underline' : 'none';
  const isItalic = actualComp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  if (editing && mode === 'editor'  && !isPreview) {

    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-32 border-2 border-pink-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        style={{ 
          fontSize: actualComp?.props?.fontSize,
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
      className={`${mode === 'editor' ? 'w-auto h-auto min-w-[80px] min-h-[40px]' : 'w-full h-full'} flex items-center transition-all duration-200 ${isSelected && mode === 'editor' ? 'hover:bg-pink-50 cursor-text' : 'hover:opacity-80'}`}
      style={{
        color: actualComp?.props?.color, 
        fontSize: actualComp?.props?.fontSize,
        fontFamily: fontFamily,
        textAlign: textAlign,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        justifyContent: textAlign === 'left' ? 'flex-start' : 
                       textAlign === 'right' ? 'flex-end' : 'center',
        zIndex: Math.max(actualComp?.props?.zIndex || 1000, 1000),
        border: isSelected && mode === 'editor' ? '1px dashed #3b82f6' : 'none',
        borderRadius: '4px'
      }}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
    >
      <span style={{ 
        whiteSpace: 'pre-wrap', 
        width: '100%',
        textAlign: textAlign,
        transform: italicTransform,
        display: 'inline-block'
      }}>
        {actualComp?.props?.text || ''}
      </span>
    </div>
  );
}

export default TextRenderer;