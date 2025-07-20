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

function TextRenderer({ comp, mode = 'live', width, height, onUpdate }) {
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

  useEffect(() => {
    if (textRef.current && comp?.props?.textAlign) {
      textRef.current.style.setProperty(
        'text-align',
        comp.props.textAlign,
        'important'
      );
    }
  }, [comp?.props?.textAlign, width, height]);

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

  // 2. props에서 값 추출 및 새 fontSize 계산
  const originalFontSize = comp.props?.fontSize || 16;
  const dynamicScale = comp.props?.dynamicScale || 1;
  const scaledFontSize = originalFontSize * dynamicScale;

  // 폰트 관련 속성들
  const fontFamily = comp?.props?.fontFamily || 'Playfair Display, serif';
  const textAlign = comp?.props?.textAlign || 'center';
  const lineHeight = comp?.props?.lineHeight || 1.2;
  const letterSpacing = comp?.props?.letterSpacing || 0;
  const fontWeight = comp?.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp?.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp?.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

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
            fontFamily: fontFamily,
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
            width: '100%', // 리사이즈 핸들러 너비에 맞춤
            height: '100%', // 리사이즈 핸들러 높이에 맞춤
            minWidth: '120px',
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
      className={`${mode === 'editor' ? 'w-auto h-auto min-w-[120px] min-h-[60px]' : 'w-full h-full'} transition-all duration-200 hover:opacity-80 cursor-pointer`}
      style={{
        color: comp.props?.color,
        fontFamily: fontFamily,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing + 'px',
        fontWeight: fontWeight,
        textDecoration: textDecoration,
        zIndex: Math.min(Math.max(comp.props?.zIndex || 1000, 1000), 9999999),
        padding: mode === 'editor' ? '12px' : '8px',
        minHeight: mode === 'editor' ? '60px' : 'auto',
        display: 'flex',
        alignItems: 'center', // 세로 가운데 정렬
        justifyContent: 'center', // 가로 가운데 정렬 (기본값)
        textAlign: textAlign,
        width: width ? width : '100%',
        height: height ? height : 'auto',
        // 가로 정렬에 따른 justifyContent 조정
        ...(textAlign === 'left' && { justifyContent: 'flex-start' }),
        ...(textAlign === 'right' && { justifyContent: 'flex-end' }),
        ...(textAlign === 'center' && { justifyContent: 'center' }),
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
      <div
        style={{
          whiteSpace: 'pre-wrap',
          width: '100%',
          height: '100%',
          flexShrink: 0,
          // 강제로 텍스트 정렬 적용
          textAlign: textAlign + ' !important',
          transform: italicTransform,
          // 텍스트가 없을 때도 클릭 가능한 영역 확보
          minHeight: '1em',
          // 3. 계산된 값 적용 및 overflow 방지
          overflowWrap: 'break-word',
          wordBreak: 'keep-all', // 단어 단위 줄바꿈
          // 플레이스홀더 텍스트가 있을 때 시각적 피드백
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
