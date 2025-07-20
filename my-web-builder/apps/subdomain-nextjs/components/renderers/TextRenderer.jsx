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

function TextRenderer({ comp, mode = 'live', width, height }) {
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const handleResize = () => {};

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
      textRef.current.style.setProperty(
        'font-family',
        comp.props.fontFamily,
        'important'
      );
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
      alert('텍스트가 변경되었습니다.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift + Enter: 줄바꿈 추가
      e.preventDefault();
      const cursorPosition = e.target.selectionStart;
      const newValue =
        editValue.slice(0, cursorPosition) +
        '\n' +
        editValue.slice(cursorPosition);
      setEditValue(newValue);
      // 커서 위치 조정
      setTimeout(() => {
        e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }, 0);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Enter만: 편집 완료
      e.preventDefault();
      setEditing(false);
      if (editValue !== (comp.props?.text || '')) {
        alert('텍스트가 변경되었습니다.');
      }
    }
  };

  // 2. props에서 값 추출 및 새 fontSize 계산
  const originalFontSize = comp.props?.fontSize || 16;
  const dynamicScale = comp.props?.dynamicScale || 1;
  const scaledFontSize = originalFontSize * dynamicScale;

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
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '0',
        }}
      >
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-2 border-blue-500 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          style={{
            fontSize: comp.props?.fontSize,
            fontFamily: fontFamily,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing + 'px',
            fontWeight: fontWeight,
            textDecoration: textDecoration,
            transform: italicTransform,
            width: '100%', // 리사이즈 핸들러 너비에 맞춤
            height: '100%', // 리사이즈 핸들러 높이에 맞춤
            minHeight: '60px',
            resize: 'both',
            fontFamily: 'inherit',
            boxSizing: 'border-box', // 패딩과 보더를 포함한 크기 계산
          }}
          placeholder="텍스트를 입력하세요. Shift+Enter로 줄바꿈이 가능합니다."
        />
      </div>
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
        alignItems: 'center', // 세로 가운데 정렬
        justifyContent: 'center', // 가로 가운데 정렬 (기본값)
        // 가로 정렬에 따른 justifyContent 조정
        ...(textAlign === 'left' && { justifyContent: 'flex-start' }),
        ...(textAlign === 'right' && { justifyContent: 'flex-end' }),
        ...(textAlign === 'center' && { justifyContent: 'center' }),
        zIndex: Math.min(Math.max(comp.props?.zIndex || 1000, 1000), 9999999),
        ...(mode === 'live'
          ? {
              width: '100%',
              fontSize: `clamp(${Math.max(10, scaledFontSize * 0.7)}px, ${(scaledFontSize / 375) * 100}vw, ${scaledFontSize}px)`,
            }
          : {
              fontSize: `${scaledFontSize}px`,
            }),
      }}
      onDoubleClick={handleDoubleClick}
    >
      <span
        style={{
          whiteSpace: 'pre-wrap',
          width: '100%',
          height: '100%',
          textAlign: textAlign,
          transform: italicTransform,
          display: 'inline-block',
          // 3. 계산된 값 적용 및 overflow 방지
          overflowWrap: 'break-word',
          wordBreak: 'keep-all', // 단어 단위 줄바꿈
        }}
      >
        {comp.props?.text || ''}
      </span>
    </div>
  );
}

export default TextRenderer;
