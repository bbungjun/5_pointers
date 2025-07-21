import React from 'react';

/**
 * RectangleLayerRenderer - 사각형 레이어 컴포넌트 렌더러 (배포 환경용)
 * 
 * 배포된 웹사이트에서 사각형 레이어 컴포넌트를 렌더링
 */
function RectangleLayerRenderer({ comp }) {
  // comp가 undefined인 경우 처리
  if (!comp) {
    console.error('RectangleLayerRenderer: comp is undefined');
    return null;
  }
  
  // 배포 환경에서는 항상 라이브 모드로 동작
  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: comp.props?.backgroundColor || '#f0f0f0',
    borderRadius: (comp.props?.borderRadius || 0) + 'px',
    position: 'relative',
    zIndex: 0,
    boxSizing: 'border-box',
    pointerEvents: 'none', // 항상 이벤트 무시
  };

  // 테두리 스타일 - 옵션에 따라 적용
  if (comp.props?.border) {
    style.border = `1px solid ${comp.props?.borderColor || '#d1d5db'}`;
  }

  return <div style={style} data-component-type="rectangleLayer" />;
}

export default RectangleLayerRenderer;