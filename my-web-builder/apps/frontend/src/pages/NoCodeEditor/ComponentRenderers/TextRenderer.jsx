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
  onUpdate,
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

  // // 강제로 editing 상태 초기화
  // useEffect(() => {
  //   setEditing(false);
  // }, [comp.id]); // 컴포넌트 ID가 변경될 때마다 초기화

  // 폰트 관련 useEffect 제거 (더 이상 필요하지 않음)
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = (e) => {
    console.log('handleDoubleClick 호출됨, 현재 editing:', editing);
    e.stopPropagation();
    if (mode === 'editor') {
      setEditing(true);
      setEditValue(comp.props?.text || '');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    if (editValue !== (comp.props?.text || '') && onUpdate) {
      onUpdate({
        ...comp,
        props: {
          ...comp.props,
          text: editValue,
        },
      });
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
      if (editValue !== (comp.props?.text || '') && onUpdate) {
        onUpdate({
          ...comp,
          props: {
            ...comp.props,
            text: editValue,
          },
        });
      }
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(comp.props?.text || '');
    }
  };

  // ❗️ 부모가 계산해준 최종 폰트 크기를 props에서 바로 사용
  const finalFontSize = comp.props?.fontSize || 16;

  // 폰트 관련 속성들
  const fontFamily = comp?.props?.fontFamily || 'Playfair Display, serif';
  // textAlign 우선순위: 1. 직접 전달된 prop, 2. comp.props에서, 3. 기본값
  const textAlign = propTextAlign || comp?.props?.textAlign || 'center';
  const lineHeight = comp?.props?.lineHeight || 1.2;
  const letterSpacing = comp?.props?.letterSpacing || 0;
  const fontWeight = comp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp?.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  // 폰트 디버깅 로그
  console.log('🎯 Frontend TextRenderer 폰트 정보:', {
    componentId: comp?.id,
    selectedFont: comp?.props?.fontFamily,
    appliedFont: fontFamily,
    allProps: comp?.props,
    mode: mode,
  });

  if (editing && mode === 'editor') {
    console.log('편집 모드로 렌더링');
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent:
            textAlign === 'left'
              ? 'flex-start'
              : textAlign === 'right'
                ? 'flex-end'
                : 'center',
          width: '100%',
          height: '100%',
          padding: '0', // 패딩 제거하여 리사이즈 핸들러와 딱 맞게
        }}
      >
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            fontSize: comp.props?.fontSize,
            fontFamily: `${comp.props?.fontFamily || 'Playfair Display'}, serif !important`,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing + 'px',
            fontWeight: fontWeight,
            textDecoration: textDecoration,
            transform: italicTransform,
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            padding: '8px 12px',
            outline: 'none',
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            minWidth: '120px',
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
      className={`${mode === 'editor' ? 'w-auto h-auto min-w-[120px] min-h-[60px]' : 'w-full h-full'} transition-all duration-200 hover:opacity-80 cursor-pointer`}
      style={{
        color: comp.props?.color,
        fontFamily: comp.props?.fontFamily,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        zIndex: Math.min(Math.max(comp.props?.zIndex || 1000, 1000), 9999999),
        padding: mode === 'editor' ? '12px' : '8px',
        minHeight: mode === 'editor' ? '60px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: comp.props?.textAlign || 'center',
        width: width ? width : '100%',
        height: height ? height : 'auto',
        ...(comp.props?.textAlign === 'left' && {
          justifyContent: 'flex-start',
        }),
        ...(comp.props?.textAlign === 'right' && {
          justifyContent: 'flex-end',
        }),
        ...(comp.props?.textAlign === 'center' && { justifyContent: 'center' }),
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
          fontFamily: 'inherit',
          ...((!comp.props?.text || comp.props?.text.trim() === '') &&
            mode === 'editor' && {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '4px',
            }),
        }}
      >
        {comp.props?.text ||
          (mode === 'editor' ? '텍스트를 입력하려면 더블클릭하세요' : '')}
      </div>
    </div>
  );
}

export default TextRenderer;
