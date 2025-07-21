import React from 'react';

/**
 * RectangleLayerRenderer - 사각형 레이어 컴포넌트 렌더러
 * 
 * 기능:
 * - 단순 사각형 배경 렌더링
 * - 배경색, 테두리, 모서리 둥글기 등 시각적 속성 설정 가능
 * - 항상 다른 컴포넌트보다 뒤에 렌더링됨 (z-index 고정)
 * - 라이브 모드에서 모든 상호작용 비활성화
 * 
 * 사용 목적:
 * - 특정 섹션이나 그룹의 시각적 강조
 * - 레이아웃 구획 구분
 * - 페이지 디자인 구성의 배경 요소
 */
function RectangleLayerRenderer({ comp, mode = 'live', width, height }) {
  // comp가 undefined인 경우 처리
  if (!comp) {
    console.error('RectangleLayerRenderer: comp is undefined');
    return null;
  }

  // 기본 스타일 - 항상 적용
  const baseStyle = {
    width: mode === 'editor' ? (comp.width || 200) + 'px' : '100%',
    height: mode === 'editor' ? (comp.height || 150) + 'px' : '100%',
    backgroundColor: comp.props?.backgroundColor || '#f0f0f0',
    borderRadius: (comp.props?.borderRadius || 0) + 'px',
    position: 'relative',
    zIndex: -1, // 항상 최하단에 위치 (음수 값으로 설정)
    boxSizing: 'border-box',
  };

  // 테두리 스타일 - noBorder가 false일 때만 적용
  if (!comp.props?.noBorder) {
    const borderWidth = comp.props?.borderWidth || '1px';
    const borderColor = comp.props?.borderColor || '#d1d5db';
    baseStyle.border = `${borderWidth} solid ${borderColor}`;
  }

  // 모드별 스타일 적용
  // 사각형 레이어는 항상 pointerEvents를 none으로 설정하여 다른 컴포넌트가 위에서 자유롭게 이동할 수 있도록 함
  const modeStyle = { pointerEvents: 'none' };

  return (
    <div 
      style={{ ...baseStyle, ...modeStyle }}
      data-component-type="rectangleLayer"
    />
  );
}

export default RectangleLayerRenderer;