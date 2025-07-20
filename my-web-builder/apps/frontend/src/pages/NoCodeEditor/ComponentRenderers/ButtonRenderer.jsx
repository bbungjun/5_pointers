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
  'Underland',
];

// 유틸리티 함수 내장
const MOBILE_BASE_WIDTH = 375;
const pxToVw = (px, minPx, maxPx) => {
  if (typeof px !== 'number') return px;
  const vw = (px / MOBILE_BASE_WIDTH) * 100;
  if (minPx !== undefined && maxPx !== undefined) {
    return `clamp(${minPx}px, ${vw.toFixed(4)}vw, ${maxPx}px)`;
  }
  return `${vw.toFixed(4)}vw`;
};

function ButtonRenderer({
  comp,
  component,
  mode = 'live',
  isEditor = false,
  isPreview = false,
  editingViewport = 'desktop',
}) {
  // comp 또는 component 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  // 모바일 편집 기준일 때 미리보기에서도 모바일 화면 그대로 보여야 함
  const isLiveMode = mode === 'live' && editingViewport !== 'mobile';

  // ❗️ 버튼 내부 텍스트에도 동일한 Hook 적용
  const finalFontSize = actualComp?.props?.fontSize || 16;

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
      buttonRef.current.style.setProperty(
        'font-family',
        actualComp.props.fontFamily,
        'important'
      );
    }
  }, [actualComp?.props?.fontFamily]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (mode === 'preview') {
      setEditing(true);
      setEditValue(actualComp?.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (actualComp?.props?.text || '')) {
      alert('버튼 텍스트가 변경되었습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editValue !== (actualComp?.props?.text || '')) {
        alert('버튼 텍스트가 변경되었습니다.');
      }
    }
  };

  const fontStyle = actualComp?.props?.fontFamily || 'Playfair Display, serif';
  const textAlign = actualComp?.props?.textAlign || 'center';
  const lineHeight = actualComp?.props?.lineHeight || 1.2;
  const letterSpacing = actualComp?.props?.letterSpacing || 0;
  const fontWeight = actualComp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = actualComp?.props?.textDecoration
    ? 'underline'
    : 'none';
  const isItalic = actualComp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  if (editing && isEditor && !isPreview) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: `${finalFontSize}px`,
          fontFamily: fontStyle,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: isLiveMode
            ? pxToVw(letterSpacing)
            : letterSpacing + 'px',
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform,
          width: '100%',
          height: '100%',
          border: '1px solid #000000',
          borderRadius: isLiveMode ? pxToVw(4) : '4px',
          padding: isLiveMode ? `${pxToVw(8)} ${pxToVw(12)}` : '8px 12px',
          boxSizing: 'border-box',
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
        justifyContent:
          textAlign === 'left'
            ? 'flex-start'
            : textAlign === 'right'
              ? 'flex-end'
              : 'center',
        background:
          comp.props?.bg ||
          'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)',
        color: comp.props?.color || '#FFFFFF',
        fontSize: `${finalFontSize}px`,
        fontFamily: fontStyle || 'Playfair Display, serif',
        fontWeight: fontWeight || '600',
        textDecoration: textDecoration,
        borderRadius: 0,
        cursor: 'pointer',
        border: '1px solid rgba(216, 191, 216, 0.3)',
        outline: 'none',
        boxShadow: '0 4px 16px rgba(216, 191, 216, 0.3)',
        transition: 'all 0.3s ease',
        userSelect: 'none',
        textTransform: 'none',
        lineHeight: lineHeight,
        letterSpacing: isLiveMode
          ? pxToVw(letterSpacing)
          : letterSpacing + 'px',
        //padding: isLiveMode ? `${pxToVw(8)} ${pxToVw(12)}` : '8px 12px',
        padding: 0,
        boxSizing: 'border-box',
        textAlign: textAlign,
        overflow: 'visible',
        position: 'relative',
      }}
      onDoubleClick={handleDoubleClick}
      // onMouseEnter={(e) => {
      //   e.target.style.background = comp.props?.bg ? `${comp.props.bg}dd` : 'linear-gradient(135deg, #E6D3E6 0%, #D4B8D4 50%, #C29FC2 100%)';
      //   e.target.style.transform = 'translateY(-2px)';
      //   e.target.style.boxShadow = '0 8px 24px rgba(216, 191, 216, 0.4)';
      // }}
      // onMouseLeave={(e) => {
      //   e.target.style.background = comp.props?.bg || 'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)';
      //   e.target.style.transform = 'translateY(0)';
      //   e.target.style.boxShadow = '0 4px 16px rgba(216, 191, 216, 0.3)';
      // }}
    >
      <div
        style={{
          display: 'inline-block', // 핵심!
          textAlign: textAlign,
          letterSpacing: isLiveMode
            ? pxToVw(letterSpacing)
            : letterSpacing + 'px',
          lineHeight: lineHeight,
          fontWeight: fontWeight,
          textDecoration: textDecoration,
          transform: italicTransform,
          overflow: 'visible',
          whiteSpace: 'pre-wrap',
          textIndent:
            textAlign === 'center' && letterSpacing !== 0
              ? isLiveMode
                ? pxToVw(letterSpacing / 2)
                : letterSpacing / 2 + 'px'
              : '0',
          marginRight:
            textAlign === 'center' && letterSpacing !== 0
              ? isLiveMode
                ? pxToVw(-letterSpacing / 2)
                : -letterSpacing / 2 + 'px'
              : '0',
        }}
      >
        {textContent}
      </div>
    </div>
  );
}

export default ButtonRenderer;
