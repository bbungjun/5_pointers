import React, { useState, useRef, useEffect } from 'react';

function ButtonRenderer({ comp, component, isEditor = false, isPreview = false }) {
  // comp 또는 component 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(actualComp?.props?.text || '');
  const inputRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (buttonRef.current && actualComp?.props?.fontFamily) {
      buttonRef.current.style.setProperty('font-family', actualComp.props.fontFamily, 'important');
    }
  }, [actualComp?.props?.fontFamily]);

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
      alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (actualComp?.props?.text || '')) {
        alert('버튼 텍스트가 변경되었습니다. (실제 구현에서는 onUpdate 콜백을 호출해야 합니다)');
      }
    }
  };

  const fontStyle = actualComp?.props?.fontFamily || 'Arial, sans-serif';
  const textAlign = actualComp?.props?.textAlign || 'center';
  const lineHeight = actualComp?.props?.lineHeight || 1.2;
  const letterSpacing = actualComp?.props?.letterSpacing || 0;
  const fontWeight = actualComp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = actualComp?.props?.textDecoration ? 'underline' : 'none';
  const isItalic = actualComp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  if (editing && isEditor && !isPreview) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: (actualComp?.props?.fontSize || 18) + 'px',
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

  const textContent = actualComp?.props?.text || '클릭하세요';

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
<<<<<<< HEAD
        background: comp.props?.bg || 'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)', 
        color: comp.props?.color || '#FFFFFF',
        fontSize: (comp.props?.fontSize || 18) + 'px', 
        fontFamily: fontStyle || 'Montserrat, Playfair Display, serif',
        fontWeight: fontWeight || '600',
=======
        background: actualComp?.props?.bg || '#3B4EFF', 
        color: actualComp?.props?.color || '#fff',
        fontSize: (actualComp?.props?.fontSize || 18) + 'px', 
        fontFamily: fontStyle,
        fontWeight: fontWeight,
>>>>>>> 9244cecce3321d93963937d383c9a202aeec34cd
        textDecoration: textDecoration,
        borderRadius: 8, 
        cursor: 'pointer',
        border: '1px solid rgba(216, 191, 216, 0.3)',
        outline: 'none',
        boxShadow: '0 4px 16px rgba(216, 191, 216, 0.3)',
        transition: 'all 0.3s ease',
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
      onMouseEnter={(e) => {
        e.target.style.background = comp.props?.bg ? `${comp.props.bg}dd` : 'linear-gradient(135deg, #E6D3E6 0%, #D4B8D4 50%, #C29FC2 100%)';
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 24px rgba(216, 191, 216, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = comp.props?.bg || 'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 16px rgba(216, 191, 216, 0.3)';
      }}
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