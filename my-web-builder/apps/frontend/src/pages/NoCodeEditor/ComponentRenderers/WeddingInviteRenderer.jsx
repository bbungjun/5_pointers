import React from 'react';

export default function WeddingInviteRenderer({ comp, mode = 'editor' }) {
  // ❗️ 자체적인 scaleFactor 계산 로직을 완전히 삭제합니다.

  const {
    title = 'Our Love Story',
    titleFontFamily = 'Playfair Display, serif',
    titleFontSize = 24,
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
    contentFontFamily = 'Playfair Display, serif',
    contentFontSize = 14,
    contentFontWeight = '400',
    contentFontStyle = 'normal',
    contentTextDecoration = 'none',
    contentColor = '#4A4A4A',
    contentAlign = comp.props.contentAlign || comp.props.textAlign || 'center',
    backgroundColor = '#FAF9F6',
    noBorder = comp.props?.noBorder !== undefined ? comp.props.noBorder : true,
    borderColor = comp.props?.borderColor || '#BDB5A6',
    borderWidth = comp.props?.borderWidth || '1px',
    borderRadius = comp.props?.borderRadius || 0,
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
        padding: '30px', // ❗️ scaleFactor 제거, 고정값 사용 (컨테이너 크기는 부모가 조절)
        background: backgroundColor,
        borderRadius: borderRadius,
        width: '100%',
        height: '100%',
        minWidth: 200,
        minHeight: 120,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
        //boxShadow: '0 8px 32px rgba(189, 181, 166, 0.15)',
      }}
    >
      {/* 제목 */}
      <div
        style={{
          fontFamily: titleFontFamily,
          fontSize: toPx(titleFontSize), // ❗️ scaleFactor 곱셈 제거
          fontStyle: titleFontStyle,
          fontWeight: titleFontWeight,
          textDecoration: titleTextDecoration,
          color: titleColor,
          marginBottom: '20px', // ❗️ scaleFactor 제거
          textAlign: titleAlign,
          width: '100%',
          letterSpacing: 1,
          lineHeight: 1.2,
          wordBreak: 'keep-all',
          background: 'none',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title || <span style={{ color: '#bbb' }}>제목 없음</span>}
      </div>

      {/* 본문 */}
      <div
        style={{
          fontFamily: contentFontFamily,
          fontSize: toPx(contentFontSize), // ❗️ scaleFactor 곱셈 제거
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
          overflow: 'hidden',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {contentLines.map((line, idx) => (
          <div
            key={idx}
            style={{
              minHeight: '24px', // ❗️ scaleFactor 제거
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
