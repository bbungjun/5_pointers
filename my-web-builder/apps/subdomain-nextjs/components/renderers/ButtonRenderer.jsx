import React, { useState, useRef, useEffect } from 'react';

function ButtonRenderer({ comp, isEditor = false }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props?.text || '');
  const inputRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (buttonRef.current && comp.props?.fontFamily) {
      buttonRef.current.style.setProperty('font-family', comp.props.fontFamily, 'important');
    }
  }, [comp.props?.fontFamily]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (isEditor) {
      setEditing(true);
      setEditValue(comp.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (comp.props?.text || '')) {
      alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (comp.props?.text || '')) {
        alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  const fontStyle = comp.props?.fontFamily || 'Arial, sans-serif';
  const textAlign = comp.props?.textAlign || 'center';
  const lineHeight = comp.props?.lineHeight || 1.2;
  const letterSpacing = comp.props?.letterSpacing || 0;
  const fontWeight = comp.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  if (editing && isEditor) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: (comp.props?.fontSize || 18) + 'px',
          fontFamily: fontStyle,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: letterSpacing + 'px',
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform,
          width: '100%',
          height: '100%',
          border: '1px solid #3B4EFF',
          borderRadius: 4,
          padding: '8px 12px',
          boxSizing: 'border-box'
        }}
      />
    );
  }

  const textContent = comp.props?.text || '클릭하세요';

  return (
    <div 
      ref={buttonRef}
      style={{
        width: '100%', 
        height: '100%',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: textAlign === 'left' ? 'flex-start' : 
                       textAlign === 'right' ? 'flex-end' : 'center',
        background: comp.props?.bg || '#3B4EFF', 
        color: comp.props?.color || '#fff',
        fontSize: (comp.props?.fontSize || 18) + 'px', 
        fontFamily: fontStyle,
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        borderRadius: 6, 
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        userSelect: 'none',
        textTransform: 'none',
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        padding: '8px 12px',
        boxSizing: 'border-box',
        textAlign: textAlign,
        overflow: 'visible',
        position: 'relative'
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          display: 'inline-block', // 핵심!
          textAlign: textAlign,
          letterSpacing: letterSpacing + 'px',
          lineHeight: lineHeight,
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform,
          overflow: 'visible',
          whiteSpace: 'pre-wrap', // 핵심!
          textIndent: textAlign === 'center' && letterSpacing !== 0 ? 
                     (letterSpacing / 2) + 'px' : '0',
          marginRight: textAlign === 'center' && letterSpacing !== 0 ? 
                      (-letterSpacing / 2) + 'px' : '0'
        }}
      >
        {textContent}
      </div>
    </div>
  );
}

export default ButtonRenderer;