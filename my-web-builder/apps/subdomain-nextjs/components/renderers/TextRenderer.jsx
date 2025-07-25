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

  // --- ❗️ 스타일 속성 개선 ---
  const {
    text = '',
    fontSize = 16,
    color,
    textAlign: propTextAlignValue = 'center',
    lineHeight = 1.2,
    letterSpacing = 0,
    fontWeight: isBold,
    textDecoration: isUnderline,
    fontStyle: isItalic,
  } = comp.props || {};

  // textAlign 우선순위: 1. 직접 전달된 prop, 2. comp.props에서, 3. 기본값
  const textAlign = propTextAlign || propTextAlignValue || 'center';

  // 폰트 관련 속성들 (CommentRenderer와 동일한 방식)
  const fontFamily = comp.props?.fontFamily || 'Playfair Display, serif';

  const textStyle = {
    color: color,
    fontFamily: fontFamily, // CommentRenderer와 동일하게 직접 적용
    fontSize: `${fontSize}px`,
    textAlign: textAlign,
    lineHeight: lineHeight,
    letterSpacing: `${letterSpacing}px`,
    fontWeight: isBold ? 'bold' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none',
    fontStyle: isItalic ? 'italic' : 'normal', // transform 대신 font-style 사용이 더 표준적입니다.
    width: '100%',
    height: '100%',
    whiteSpace: 'pre-wrap', // 줄바꿈(\n)을 인식하게 함
    overflowWrap: 'break-word',
    wordBreak: 'keep-all', // 단어 단위 줄바꿈 (한글에 유리)
  };



  if (editing && mode === 'editor') {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <textarea
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{
            ...textStyle,
            boxSizing: 'border-box',
            resize: 'none', // 리사이저는 부모 div에서 핸들링하므로 textarea 자체는 비활성화
            border: '2px solid #3B82F6',
            outline: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
          placeholder="텍스트를 입력하세요..."
        />
      </div>
    );
  }

  return (
    <div
      ref={textRef}
      className={`flex items-center justify-center w-full h-full`}
      style={{
        // 정렬을 위해 flexbox 사용
        justifyContent:
          textAlign === 'left'
            ? 'flex-start'
            : textAlign === 'right'
              ? 'flex-end'
              : 'center',
        zIndex: Math.min(Math.max(comp.props?.zIndex || 1000, 1000), 9999999),
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div style={textStyle}>{text}</div>
    </div>
  );
}

export default TextRenderer;
