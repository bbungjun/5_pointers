import React, { useState, useRef, useCallback, useMemo } from 'react';
import { debounceKorean } from '../../../utils/debounce';

function TextEditor({ value, onChange, label = "Text", placeholder = "Enter text" }) {
  const [isComposing, setIsComposing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const inputRef = useRef(null);

  // 한글 입력 최적화된 디바운스 함수
  const debouncedOnChange = useMemo(() => {
    const debounced = debounceKorean(onChange, 200);
    return debounced;
  }, [onChange]);

  // 한글 조합 시작
  const handleCompositionStart = useCallback(() => {
    console.log('🇰🇷 한글 조합 시작');
    setIsComposing(true);
    debouncedOnChange.setComposing(true);
  }, [debouncedOnChange]);

  // 한글 조합 중
  const handleCompositionUpdate = useCallback((e) => {
    const newValue = e.target.value;
    console.log('🇰🇷 한글 조합 중:', newValue);
    setTempValue(newValue);
  }, []);

  // 한글 조합 완료
  const handleCompositionEnd = useCallback((e) => {
    const finalValue = e.target.value;
    console.log('🇰🇷 한글 조합 완료:', finalValue);
    setIsComposing(false);
    setTempValue(finalValue);
    debouncedOnChange.setComposing(false);
    onChange(finalValue); // 조합 완료 시 즉시 전송
  }, [onChange, debouncedOnChange]);

  // 일반 입력 처리
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setTempValue(newValue);
    
    if (!isComposing) {
      // 영문 등 일반 입력은 디바운스 적용
      console.log('🔤 일반 입력:', newValue);
      debouncedOnChange(newValue);
    }
  }, [isComposing, debouncedOnChange]);

  // 키보드 이벤트 처리 (백스페이스, 엔터 등)
  const handleKeyDown = useCallback((e) => {
    // 백스페이스나 Delete 키는 즉시 처리
    if ((e.key === 'Backspace' || e.key === 'Delete') && !isComposing) {
      setTimeout(() => {
        const currentValue = e.target.value;
        console.log('⌫ 삭제 키 처리:', currentValue);
        onChange(currentValue);
      }, 0);
    }
  }, [isComposing, onChange]);

  // value prop이 변경되면 tempValue 동기화
  React.useEffect(() => {
    if (!isComposing) {
      setTempValue(value || '');
    }
  }, [value, isComposing]);

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
        value={tempValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
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
          transition: 'border-color 0.2s',
          // 한글 입력 최적화를 위한 IME 설정
          imeMode: 'auto'
        }}
        onFocus={(e) => e.target.style.borderColor = '#0066FF'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
    </div>
  );
}

export default TextEditor;
