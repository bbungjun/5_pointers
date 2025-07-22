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

function TextRenderer({
  comp,
  mode = 'live',
  width,
  height,
  textAlign: propTextAlign,
  ...otherProps
}) {
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

  // ❗️ 부모가 계산해준 최종 폰트 크기를 props에서 바로 사용
  const finalFontSize = comp.props?.fontSize || 16;

  // 폰트 관련 속성들
  const fontFamily = comp?.props?.fontFamily || 'Playfair Display, serif';
  // textAlign 우선순위: 1. 직접 전달된 prop, 2. comp.props에서, 3. 기본값
  const textAlign = propTextAlign || comp?.props?.textAlign || 'center';
  const lineHeight = comp?.props?.lineHeight || 1.2;

  // 폰트 디버깅 로그
  console.log('🌐 Subdomain TextRenderer 폰트 정보:', {
    componentId: comp?.id,
    componentType: comp?.type,
    selectedFont: comp?.props?.fontFamily,
    appliedFont: fontFamily,
    allProps: comp?.props,
    mode: mode,
  });

  // 폰트 로딩 상태 확인
  if (comp?.props?.fontFamily && typeof document !== 'undefined') {
    document.fonts.ready.then(() => {
      const fontFamily = comp.props.fontFamily.replace(/['"]/g, '');
      const isLoaded = document.fonts.check(`12px ${fontFamily}`);
      console.log('🔍 폰트 로딩 상태:', {
        fontFamily: fontFamily,
        isLoaded: isLoaded,
        availableFonts: Array.from(document.fonts).map((f) => f.family),
      });
    });
  }
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
            fontFamily: `${comp.props?.fontFamily || 'Playfair Display'}, serif !important`,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing + 'px',
            fontWeight: fontWeight,
            textDecoration: textDecoration,
            transform: italicTransform,
            width: '100%',
            height: '100%',
            minHeight: '60px',
            resize: 'both',
            boxSizing: 'border-box',
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
        fontFamily: `${comp.props?.fontFamily} !important`,
        textAlign: textAlign,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        alignItems: 'center',
        justifyContent: 'center',
        ...(comp.props?.textAlign === 'left' && {
          justifyContent: 'flex-start',
        }),
        ...(comp.props?.textAlign === 'right' && {
          justifyContent: 'flex-end',
        }),
        ...(comp.props?.textAlign === 'center' && { justifyContent: 'center' }),
        zIndex: Math.min(Math.max(comp.props?.zIndex || 1000, 1000), 9999999),
        fontSize: `${finalFontSize}px`,
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div
        style={{
          whiteSpace: 'pre-wrap',
          width: '100%',
          height: '100%',
          flexShrink: 0,
          textAlign: textAlign,
          transform: italicTransform,
          minHeight: '1em',
          overflowWrap: 'break-word',
          wordBreak: 'keep-all',
          fontFamily: `${comp.props?.fontFamily} !important`,
        }}
      >
        {comp.props?.text || ''}
      </div>
    </div>
  );
}

export default TextRenderer;
