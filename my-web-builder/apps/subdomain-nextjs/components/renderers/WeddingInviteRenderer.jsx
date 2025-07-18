import React, { useState, useEffect } from 'react';

export default function WeddingInviteRenderer({
  comp,
  mode = 'live',
  width,
  height,
}) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;

  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const handleResize = () => {};

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);

  // 원본 크기 정보
  const containerWidth = comp.width || 450;
  const containerHeight = comp.height || 400;

  const {
    title = 'Our Love Story',
    titleFontFamily = 'Playfair Display, serif',
    titleFontSize = 30,
    titleFontStyle = 'italic',
    titleFontWeight = '600',
    titleTextDecoration = 'none',
    titleColor = '#4A4A4A',
    titleAlign = comp.props.titleAlign || comp.props.textAlign || 'center',

    content = [
      '서로가 마주보며 다져온 사랑을',
      '이제 함께 한 곳을 바라보며',
      '걸어갈 수 있는 큰 사랑으로 키우고자 합니다.',
      '',
      '저희 두 사람이 사랑의 이름으로',
      '지켜나갈 수 있게 앞날을',
      '축복해 주시면 감사하겠습니다.',
    ],
    contentFontFamily = 'Montserrat, sans-serif',
    contentFontSize = 18,
    contentFontWeight = '400',
    contentFontStyle = 'normal',
    contentTextDecoration = 'none',
    contentColor = '#4A4A4A',
    contentAlign = comp.props.contentAlign || comp.props.textAlign || 'center',
    backgroundColor = '#FAF9F6',
    noBorder = true,
    borderColor = '#BDB5A6',
    borderWidth = '1px',
    borderRadius = 0,
  } = comp.props;

  // px 변환
  const toPx = (v) => (typeof v === 'number' ? `${v}px` : v || undefined);
  // content가 배열이 아니면 줄바꿈 분리
  const contentLines = Array.isArray(content)
    ? content
    : String(content || '').split('\n');

  return (
    <div
      style={{
        background: backgroundColor,
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
        boxShadow: '0 8px 32px rgba(189, 181, 166, 0.15)',
        width: '100%',
        height: mode === 'live' ? `${containerHeight * scaleFactor}px` : '100%',
        ...(mode === 'live'
          ? {
                              borderRadius: borderRadius,
              padding: `${40 * scaleFactor}px`,
              minWidth: `${200 * scaleFactor}px`,
              minHeight: `${containerHeight * scaleFactor}px`, // 높이도 스케일링 적용
            }
          : {
              borderRadius: 0,
              padding: 40,
              minWidth: 200,
              minHeight: 120,
            }),
      }}
    >
      {/* 제목 */}
      <div
        style={{
          fontFamily: titleFontFamily,
          fontSize:
            mode === 'live'
              ? `${titleFontSize * scaleFactor}px`
              : toPx(titleFontSize),
          fontStyle: titleFontStyle,
          fontWeight: titleFontWeight,
          textDecoration: titleTextDecoration,
          color: titleColor,
          marginBottom: mode === 'live' ? `${28 * scaleFactor}px` : 28,
          textAlign: titleAlign,
          width: '100%',
          letterSpacing: 1,
          lineHeight: 1.2,
          wordBreak: 'keep-all',
          background: 'none',
          whiteSpace: 'pre-wrap',
        }}
      >
        {title || <span style={{ color: '#bbb' }}>제목 없음</span>}
      </div>

      {/* 본문 */}
      <div
        style={{
          fontFamily: contentFontFamily,
          fontSize:
            mode === 'live'
              ? `${contentFontSize * scaleFactor}px`
              : toPx(contentFontSize),
          fontWeight: contentFontWeight,
          fontStyle: contentFontStyle,
          textDecoration: contentTextDecoration,
          color: contentColor,
          textAlign: contentAlign,
          lineHeight: 1.7,
          width: '100%',
          wordBreak: 'keep-all',
          background: 'none',
          whiteSpace: 'pre-wrap',
        }}
      >
        {contentLines.map((line, idx) => (
          <div
            key={idx}
            style={{
              minHeight: mode === 'live' ? `${24 * scaleFactor}px` : 24,
              whiteSpace: 'pre-wrap',
            }}
          >
            {line && line.trim().length > 0 ? (
              line
            ) : (
              <span style={{ opacity: 0.3 }}>　</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
