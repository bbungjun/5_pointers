import React, { useState } from 'react';

function ColorPaletteEditor({ label, value, onChange }) {
  const [selectedColor, setSelectedColor] = useState(value || '#D8BFD8');

  // 모던하고 파스텔한 색상 팔레트 20개
  const colorPalette = [
    // 웨딩 테마 파스텔 색상
    { name: '더스티 로즈', color: '#D8BFD8' },
    { name: '소프트 핑크', color: '#F4C2C2' },
    { name: '라벤더', color: '#E6D3F7' },
    { name: '민트 크림', color: '#C8E6C9' },
    { name: '피치 핑크', color: '#FFD3B6' },
    
    // 모던 파스텔 색상
    { name: '스카이 블루', color: '#B3D9FF' },
    { name: '세이지 그린', color: '#B2C2B2' },
    { name: '크림 옐로우', color: '#FFF2CC' },
    { name: '코랄 핑크', color: '#FFB3BA' },
    { name: '파우더 블루', color: '#B6E5D8' },
    
    // 세련된 뉴트럴 색상
    { name: '워밍 그레이', color: '#D4C5B9' },
    { name: '머쉬룸', color: '#C8B99C' },
    { name: '아이보리', color: '#F7F3E9' },
    { name: '더스티 블루', color: '#B8C5D6' },
    { name: '모브', color: '#D8C7D8' },
    
    // 엘레간트 딥 파스텔
    { name: '테라코타', color: '#E2A76F' },
    { name: '올리브 그린', color: '#9CAF88' },
    { name: '슬레이트 블루', color: '#8B9DC3' },
    { name: '로즈 골드', color: '#E8B4B8' },
    { name: '샴페인', color: '#F7E7CE' }
  ];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    onChange(color);
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: '600',
        color: '#1d2129',
        marginBottom: '8px'
      }}>
        {label}
      </label>
      
      {/* 현재 선택된 색상 미리보기 */}
      <div style={{
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: selectedColor,
          borderRadius: '6px',
          border: '2px solid #fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }} />
        <span style={{
          fontSize: '13px',
          color: '#65676b',
          fontWeight: '500'
        }}>
          {colorPalette.find(c => c.color === selectedColor)?.name || '사용자 정의'}
        </span>
      </div>

      {/* 색상 팔레트 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e1e5e9'
      }}>
        {colorPalette.map((colorItem) => (
          <div
            key={colorItem.color}
            onClick={() => handleColorSelect(colorItem.color)}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: colorItem.color,
              borderRadius: '6px',
              cursor: 'pointer',
              border: selectedColor === colorItem.color ? '3px solid #4A90E2' : '2px solid #fff',
              boxShadow: selectedColor === colorItem.color 
                ? '0 0 0 2px #4A90E2, 0 2px 8px rgba(74, 144, 226, 0.3)'
                : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              transform: selectedColor === colorItem.color ? 'scale(1.05)' : 'scale(1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (selectedColor !== colorItem.color) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedColor !== colorItem.color) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
            title={colorItem.name}
          >
            {/* 선택 표시 */}
            {selectedColor === colorItem.color && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 색상 이름 툴팁 */}
      <div style={{
        fontSize: '11px',
        color: '#8a8d91',
        marginTop: '8px',
        textAlign: 'center'
      }}>
        색상 위에 마우스를 올려 이름을 확인하세요
      </div>
    </div>
  );
}

export default ColorPaletteEditor;