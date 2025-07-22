import React, { useState, useRef, useEffect } from 'react';

function FontFamilyEditor({ label, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();
  const buttonRef = useRef();
  const [uniqueId] = useState(
    () => 'font-btn-' + Math.random().toString(36).substr(2, 9)
  );

  // 한국어 폰트 (모든 폰트 기울임 지원)
  const koreanFonts = [
    {
      value:
        '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      label: 'Pretendard',
      italicSupport: true,
    },
    {
      value: '"Noto Sans KR", "맑은 고딕", "Malgun Gothic", sans-serif',
      label: 'Noto Sans KR',
      italicSupport: true,
    },
    {
      value: '"맑은 고딕", "Malgun Gothic", sans-serif',
      label: '맑은 고딕',
      italicSupport: true,
    },
    {
      value: '"나눔고딕", "NanumGothic", sans-serif',
      label: '나눔고딕',
      italicSupport: true,
    },
    {
      value: '"나눔명조", "NanumMyeongjo", serif',
      label: '나눔명조',
      italicSupport: true,
    },
    {
      value: '"돋움", "Dotum", sans-serif',
      label: '돋움',
      italicSupport: true,
    },
    {
      value: '"굴림", "Gulim", sans-serif',
      label: '굴림',
      italicSupport: true,
    },
    {
      value: '"바탕", "Batang", serif',
      label: '바탕',
      italicSupport: true,
    },
    {
      value: '"궁서", "Gungsuh", serif',
      label: '궁서',
      italicSupport: true,
    },
  ];

  // 웨딩 테마 폰트 (우아하고 로맨틱한 폰트들)
  const weddingFonts = [
    {
      value: '"Playfair Display", serif',
      label: 'Playfair Display',
      italicSupport: true,
    },
    {
      value: '"Adelio Darmanto", cursive',
      label: 'Adelio Darmanto',
      italicSupport: true,
    },
    {
      value: '"Bodoni", serif',
      label: 'Bodoni',
      italicSupport: true,
    },
    {
      value: '"Brooke Smith Script", cursive',
      label: 'Brooke Smith Script',
      italicSupport: true,
    },
    {
      value: '"Chalisa Oktavia", cursive',
      label: 'Chalisa Oktavia',
      italicSupport: true,
    },
    {
      value: '"Dearly Loved One", cursive',
      label: 'Dearly Loved One',
      italicSupport: true,
    },
    {
      value: '"Deluxe Edition", serif',
      label: 'Deluxe Edition',
      italicSupport: true,
    },
    {
      value: '"Dreamland", cursive',
      label: 'Dreamland',
      italicSupport: true,
    },
    {
      value: '"EB Garamond", serif',
      label: 'EB Garamond',
      italicSupport: true,
    },
    {
      value: '"Elsie", serif',
      label: 'Elsie',
      italicSupport: true,
    },
    {
      value: '"England Hand", cursive',
      label: 'England Hand',
      italicSupport: true,
    },
    {
      value: '"Hijrnotes", cursive',
      label: 'Hijrnotes',
      italicSupport: true,
    },
    {
      value: '"La Paloma", cursive',
      label: 'La Paloma',
      italicSupport: true,
    },
    {
      value: '"Millerstone", serif',
      label: 'Millerstone',
      italicSupport: true,
    },
    {
      value: '"Montserrat", sans-serif',
      label: 'Montserrat',
      italicSupport: true,
    },
    {
      value: '"Pinyon Script", cursive',
      label: 'Pinyon Script',
      italicSupport: true,
    },
    {
      value: '"Prata", serif',
      label: 'Prata',
      italicSupport: true,
    },
    {
      value: '"Underland", cursive',
      label: 'Underland',
      italicSupport: true,
    },
  ];

  // 영어 폰트 (모든 폰트 기울임 지원)
  const englishFonts = [
    {
      value: 'Arial, sans-serif',
      label: 'Arial',
      italicSupport: true,
    },
    {
      value: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      label: 'Helvetica',
      italicSupport: true,
    },
    {
      value: 'Georgia, serif',
      label: 'Georgia',
      italicSupport: true,
    },
    {
      value: '"Times New Roman", Times, serif',
      label: 'Times New Roman',
      italicSupport: true,
    },
    {
      value: '"Courier New", Courier, monospace',
      label: 'Courier New',
      italicSupport: true,
    },
    {
      value: 'Verdana, Geneva, sans-serif',
      label: 'Verdana',
      italicSupport: true,
    },
    {
      value: '"Trebuchet MS", Helvetica, sans-serif',
      label: 'Trebuchet MS',
      italicSupport: true,
    },
    {
      value: 'Impact, Charcoal, sans-serif',
      label: 'Impact',
      italicSupport: true, // Impact도 강제 기울임으로 지원
    },
    {
      value: '"Comic Sans MS", cursive, sans-serif',
      label: 'Comic Sans MS',
      italicSupport: true,
    },
    {
      value: '"Lucida Console", Monaco, monospace',
      label: 'Lucida Console',
      italicSupport: true,
    },
  ];

  // 현재 선택된 폰트의 라벨 찾기
  const getCurrentFontLabel = () => {
    const allFonts = [...koreanFonts, ...weddingFonts, ...englishFonts];
    const currentFont = allFonts.find((font) => font.value === value);
    return currentFont ? currentFont.label : 'Playfair Display';
  };

  // CSS 스타일 주입으로 폰트 강제 적용
  useEffect(() => {
    const currentFontValue = value || '"Playfair Display", serif';

    // 기존 스타일 제거
    const existingStyle = document.getElementById(uniqueId);
    if (existingStyle) {
      existingStyle.remove();
    }

    // 새 스타일 추가
    const style = document.createElement('style');
    style.id = uniqueId;
    style.textContent = `
      .${uniqueId} {
        font-family: ${currentFontValue} !important;
      }
      .${uniqueId} span {
        font-family: ${currentFontValue} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(uniqueId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [value, uniqueId]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFontSelect = (fontValue) => {
    console.log('🎨 FontFamilyEditor - 폰트 선택됨:', {
      selectedFont: fontValue,
      currentValue: value,
      willChange: value !== fontValue,
    });
    onChange(fontValue);
    setIsOpen(false);
  };

  const currentFontLabel = getCurrentFontLabel();

  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          marginBottom: '6px',
          fontSize: '12px',
          fontWeight: '500',
          color: '#374151',
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={uniqueId}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'left',
            outline: 'none',
            fontStyle: 'normal',
            fontVariant: 'normal',
            fontWeight: 'normal',
            textTransform: 'none',
            lineHeight: '1.4',
          }}
          onMouseEnter={(e) => (e.target.style.borderColor = '#9ca3af')}
          onMouseLeave={(e) => (e.target.style.borderColor = '#d1d5db')}
        >
          <span
            className={uniqueId}
            style={{
              fontSize: '14px',
              color: '#374151',
            }}
          >
            {currentFontLabel}
          </span>
          <span
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              fontSize: '12px',
              color: '#6b7280',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            ▼
          </span>
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {/* 한국어 폰트 섹션 */}
            <div
              style={{
                padding: '6px 12px 4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              한국어 폰트
            </div>
            {koreanFonts.map((font) => (
              <div
                key={font.value}
                onClick={() => handleFontSelect(font.value)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontFamily: font.value,
                  fontSize: '14px',
                  backgroundColor:
                    font.value === value ? '#f3f4f6' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#374151',
                }}
                onMouseEnter={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontFamily: font.value }}>
                  {font.label}{' '}
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    가나다
                  </span>
                </span>
                {font.value === value && (
                  <span
                    style={{
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            ))}

            {/* 웨딩 테마 폰트 섹션 */}
            <div
              style={{
                padding: '6px 12px 4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#D8BFD8',
                backgroundColor: '#fdf8fd',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              웨딩 테마 폰트
            </div>
            {weddingFonts.map((font) => (
              <div
                key={font.value}
                onClick={() => handleFontSelect(font.value)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontFamily: font.value,
                  fontSize: '14px',
                  backgroundColor:
                    font.value === value ? '#fdf8fd' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#374151',
                }}
                onMouseEnter={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = '#fef9fe';
                  }
                }}
                onMouseLeave={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontFamily: font.value }}>
                  {font.label}{' '}
                  <span style={{ fontSize: '12px', color: '#D8BFD8' }}>
                    Wedding
                  </span>
                </span>
                {font.value === value && (
                  <span
                    style={{
                      color: '#D8BFD8',
                      fontSize: '12px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            ))}

            {/* 영어 폰트 섹션 */}
            <div
              style={{
                padding: '6px 12px 4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                backgroundColor: '#f9fafb',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              영어 폰트
            </div>
            {englishFonts.map((font) => (
              <div
                key={font.value}
                onClick={() => handleFontSelect(font.value)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontFamily: font.value,
                  fontSize: '14px',
                  backgroundColor:
                    font.value === value ? '#f3f4f6' : 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: '#374151',
                }}
                onMouseEnter={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (font.value !== value) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontFamily: font.value }}>
                  {font.label}{' '}
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Abc
                  </span>
                </span>
                {font.value === value && (
                  <span
                    style={{
                      color: '#3b82f6',
                      fontSize: '12px',
                      fontFamily: 'Arial, sans-serif',
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FontFamilyEditor;
