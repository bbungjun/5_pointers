import React, { useState, useRef, useEffect } from 'react';

// 유틸리티 함수
const MOBILE_BASE_WIDTH = 375;
const pxToVw = (px, minPx, maxPx) => {
  if (typeof px !== 'number') return px;
  const vw = (px / MOBILE_BASE_WIDTH) * 100;
  if (minPx !== undefined && maxPx !== undefined) {
    return `clamp(${minPx}px, ${vw.toFixed(4)}vw, ${maxPx}px)`;
  }
  return `${vw.toFixed(4)}vw`;
};

function ButtonRenderer({ comp, isEditor = false, mode = 'live', width, height }) {
  // SSR 안전한 모바일 감지
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
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: textAlign === 'left' ? 'flex-start' : 
                       textAlign === 'right' ? 'flex-end' : 'center',
        background: comp.props?.bg || '#3B4EFF', 
        color: comp.props?.color || '#fff',
        fontFamily: fontStyle,
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        userSelect: 'none',
        textTransform: 'none',
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        boxSizing: 'border-box',
        textAlign: textAlign,
        overflow: 'visible',
        position: 'relative',
        ...(isLiveMode ? {
          width: '100%',
          maxWidth: `${width}px`,
          aspectRatio: `${width} / ${height}`,
          fontSize: `clamp(${Math.max(10, (comp.props?.fontSize || 18) * 0.7)}px, ${((comp.props?.fontSize || 18) / 375) * 100}vw, ${comp.props?.fontSize || 18}px)`,
          padding: 'clamp(4px, 1.5vw, 8px) clamp(6px, 2.5vw, 12px)',
          borderRadius: 'clamp(3px, 1vw, 6px)'
        } : {
          width: width + 'px',
          height: height + 'px',
          fontSize: (comp.props?.fontSize || 18) + 'px',
          padding: '8px 12px',
          borderRadius: 6
        })
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