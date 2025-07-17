import React, { useState, useRef, useCallback, useEffect } from 'react';

function TextEditor({ value, onChange, label = "Text", placeholder = "Enter text" }) {
  const [isComposing, setIsComposing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
  const isInternalUpdateRef = useRef(false);

  // 외부에서 값이 변경될 때만 동기화
  useEffect(() => {
    if (!isInternalUpdateRef.current && !isComposing) {
      const newValue = value || '';
      if (newValue !== localValue) {
        setLocalValue(newValue);
      }
    }
    isInternalUpdateRef.current = false;
  }, [value, isComposing, localValue]);

  // 한글 조합 시작
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  // 한글 조합 완료
  const handleCompositionEnd = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsComposing(false);
    
    // 조합 완료 후 즉시 업데이트
    isInternalUpdateRef.current = true;
    onChange(newValue);
  }, [onChange]);

  // 입력 처리 - 디바운스 없이 즉시 업데이트
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // 한글 조합 중이 아닐 때만 즉시 업데이트
    if (!isComposing) {
      isInternalUpdateRef.current = true;
      onChange(newValue);
    }
  }, [isComposing, onChange]);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: 13,
        color: '#333',
        fontWeight: 500,
        marginBottom: 6
      }}>
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid #ddd',
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#0066FF'}
        onBlur={e => e.target.style.borderColor = '#ddd'}
      />
    </div>
  );
}

export default TextEditor;