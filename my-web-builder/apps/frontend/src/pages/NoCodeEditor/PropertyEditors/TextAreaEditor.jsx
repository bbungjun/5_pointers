import React, { useState, useRef, useCallback } from 'react';

function TextAreaEditor({ label, value, onChange, placeholder, rows = 2 }) {
  const [isComposing, setIsComposing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const textareaRef = useRef(null);

  // 한글 조합 시작
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  // 한글 조합 중
  const handleCompositionUpdate = useCallback((e) => {
    setTempValue(e.target.value);
  }, []);

  // 한글 조합 완료
  const handleCompositionEnd = useCallback((e) => {
    setIsComposing(false);
    const finalValue = e.target.value;
    setTempValue(finalValue);
    onChange(finalValue);
  }, [onChange]);

  // 일반 입력 처리
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setTempValue(newValue);
    
    // 한글 조합 중이 아닐 때만 onChange 호출
    if (!isComposing) {
      onChange(newValue);
    }
  }, [onChange, isComposing]);

  // value prop이 변경되면 tempValue 동기화
  React.useEffect(() => {
    if (!isComposing && value !== tempValue) {
      setTempValue(value || '');
    }
  }, [value, isComposing, tempValue]);

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
      <textarea
        ref={textareaRef}
        value={tempValue}
        onChange={handleChange}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid #ddd',
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => e.target.style.borderColor = '#0066FF'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
    </div>
  );
}

export default TextAreaEditor;
