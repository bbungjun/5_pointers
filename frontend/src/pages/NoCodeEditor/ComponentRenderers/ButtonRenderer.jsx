import React, { useState, useRef, useEffect } from 'react';
import { getResponsiveValue, getResponsiveScale } from '../utils/editorUtils';

function ButtonRenderer({ comp, isEditor = false, viewport = 'desktop' }) {
  console.log('버튼 컴포넌트 렌더링:', comp);
  
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);
  const inputRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  // 폰트 적용을 위한 useEffect
  useEffect(() => {
    if (buttonRef.current && comp.props.fontFamily) {
      buttonRef.current.style.setProperty('font-family', comp.props.fontFamily, 'important');
    }
  }, [comp.props.fontFamily]);

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

  // 반응형 스케일링 적용
  const scale = getResponsiveScale(viewport);
  const responsiveFontSize = getResponsiveValue(comp.props.fontSize || 18, viewport, 'fontSize');
  const responsivePadding = Math.max(4, Math.round((8 * scale)));
  const responsiveLetterSpacing = (comp.props.letterSpacing || 0) * scale;
  
  const fontStyle = comp.props.fontFamily || 'Arial, sans-serif';
  const textAlign = comp.props.textAlign || 'center';
  const lineHeight = comp.props.lineHeight || 1.2;
  const fontWeight = comp.props.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp.props.textDecoration ? 'underline' : 'none';
  
  // 기울임 처리 - 구글 독스 방식으로 강제 기울임 적용
  const isItalic = comp.props.fontStyle;
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
          fontSize: responsiveFontSize + 'px',
          fontFamily: fontStyle,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: responsiveLetterSpacing + 'px',
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform,
          width: '100%',
          height: '100%',
          border: '1px solid #3B4EFF',
          borderRadius: Math.max(2, Math.round(4 * scale)),
          padding: `${responsivePadding}px ${responsivePadding * 1.5}px`,
          boxSizing: 'border-box'
        }}
      />
    );
  }

  const textContent = comp.props.text || '클릭하세요';

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
        background: comp.props.bg || '#3B4EFF', 
        color: comp.props.color || '#fff',
        fontSize: responsiveFontSize + 'px', 
        fontFamily: fontStyle,
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        borderRadius: Math.max(2, Math.round(6 * scale)), 
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        userSelect: 'none',
        textTransform: 'none',
        lineHeight: lineHeight,
        letterSpacing: responsiveLetterSpacing + 'px',
        padding: `${responsivePadding}px ${responsivePadding * 1.5}px`,
        boxSizing: 'border-box',
        textAlign: textAlign,
        overflow: 'visible',
        position: 'relative'

      }}
      onDoubleClick={handleDoubleClick}
    >
      <span style={{
        display: 'block',
        width: '100%',
        textAlign: textAlign,
        letterSpacing: responsiveLetterSpacing + 'px',
        lineHeight: lineHeight,
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        transform: italicTransform, // 강제 기울임 적용
        overflow: 'visible',
        whiteSpace: 'nowrap',
        textIndent: textAlign === 'center' && responsiveLetterSpacing !== 0 ? 
                   (responsiveLetterSpacing / 2) + 'px' : '0',
        marginRight: textAlign === 'center' && responsiveLetterSpacing !== 0 ? 
                    (-responsiveLetterSpacing / 2) + 'px' : '0'
      }}>
        {textContent}
      </span>
    </div>
  );
}

export default ButtonRenderer;
