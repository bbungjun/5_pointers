import React from 'react';

export default function MapInfoRenderer({ comp, mode = 'live' }) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;
  
  const {
    containerWidth = comp.width || 300,
    containerHeight = comp.height || 275,
    sections = [],
    fontSize = 16,
    fontFamily = comp.props?.fontFamily || '"Playfair Display", serif',
    fontWeight = comp.props?.fontWeight ? 'bold' : 'normal',
    fontStyle = comp.props?.fontStyle ? 'italic' : 'normal',
    textDecoration = comp.props?.textDecoration ? 'underline' : 'none',
    textAlign = comp.props?.textAlign || 'left',
    lineHeight = comp.props?.lineHeight || 1.6,
    letterSpacing = comp.props?.letterSpacing || 0,
    color = comp.props?.color || '#2c2c2c',
    bgColor = comp.props?.bgColor || '#ffffff',
    noBorder = comp.props?.noBorder !== undefined ? comp.props.noBorder : true,
    borderColor = comp.props?.borderColor || '#e5e7eb',
    borderWidth = comp.props?.borderWidth || '1px',
    borderRadius = comp.props?.borderRadius || 8
  } = comp.props;

  const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
  const italicTransform = fontStyle === 'italic' ? 'skewX(-15deg)' : 'none';

  return (
    <div
      style={{
        padding: mode === 'live' ? `${28 * scaleFactor}px ${24 * scaleFactor}px` : '28px 24px',
        background: bgColor,
        borderRadius: mode === 'live' ? `${borderRadius * scaleFactor}px` : borderRadius,
        width: mode === 'live' ? '100%' : `${comp?.width || 300}px`,
        height: mode === 'live' ? `${(comp?.height || 275) * scaleFactor}px` : `${comp?.height || 200}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`
      }}
    >
      {sections.map((sec, idx) => (
        <div
          key={idx}
          style={{
            padding: mode === 'live' ? `${18 * scaleFactor}px 0` : '18px 0',
            borderBottom: idx < sections.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
            position: 'relative'
          }}
        >
          {/* 제목 */}
          <div style={{
            fontSize: mode === 'live' ? `${(fontSize + 2) * scaleFactor}px` : toPx(fontSize + 2),
            fontWeight: fontWeight === 'bold' ? '700' : '600',
            fontStyle: fontStyle,
            textDecoration,
            color: color,
            fontFamily: fontFamily,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: mode === 'live' ? `${letterSpacing * scaleFactor}px` : letterSpacing + 'px',
            transform: italicTransform,
            marginBottom: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
            whiteSpace: 'pre-wrap',
            background: 'linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {sec.header || '제목 없음'}
          </div>

          {/* 내용 */}
          <div style={{
            fontSize: mode === 'live' ? `${fontSize * scaleFactor}px` : toPx(fontSize),
            fontWeight: fontWeight === 'bold' ? '500' : '400',
            fontStyle: fontStyle,
            textDecoration,
            color: color,
            fontFamily: fontFamily,
            textAlign: textAlign,
            lineHeight: lineHeight,
            letterSpacing: mode === 'live' ? `${letterSpacing * scaleFactor}px` : letterSpacing + 'px',
            transform: italicTransform,
            whiteSpace: 'pre-wrap',
            opacity: 0.85,
            paddingLeft: mode === 'live' ? `${4 * scaleFactor}px` : '4px'
          }}>
            {sec.content || '내용 없음'}
          </div>
        </div>
      ))}
    </div>
  );
}