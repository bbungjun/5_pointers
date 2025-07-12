import React from 'react';

// 유틸리티 함수
const MOBILE_BASE_WIDTH = 375;
const pxToVw = (px) => `${(px / MOBILE_BASE_WIDTH) * 100}vw`;

export default function WeddingInviteRenderer({ comp, mode = 'preview' }) {
    const isLiveMode = mode === 'live';
    
    // 원본 크기 정보
    const containerWidth = comp.width || 450;
    const containerHeight = comp.height || 400;
    
    const {
        title = "Our Love Story",
        titleFontFamily = "Dancing Script, cursive, Noto Sans KR, 맑은 고딕, sans-serif",
        titleFontSize = 32,
        titleFontStyle = "italic",
        titleFontWeight = "normal",
        titleTextDecoration = "none",
        titleColor = "#222",
        titleAlign = comp.props.titleAlign || comp.props.textAlign || "center",

        content = [
            "서로가 마주보며 다져온 사랑을",
            "이제 함께 한 곳을 바라보며",
            "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
            "",
            "저희 두 사람이 사랑의 이름으로",
            "지켜나갈 수 있게 앞날을",
            "축복해 주시면 감사하겠습니다."
        ],
        contentFontFamily = "Noto Sans KR, 맑은 고딕, sans-serif",
        contentFontSize = 22,
        contentFontWeight = "normal",
        contentFontStyle = "normal",
        contentTextDecoration = "none",
        contentColor = "#444",
        contentAlign = comp.props.contentAlign || comp.props.textAlign || "center",
        backgroundColor = "#fff"
    } = comp.props;

    // px 변환
    const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
    // content가 배열이 아니면 줄바꿈 분리
    const contentLines = Array.isArray(content) ? content : String(content || '').split('\n');

    return (
        <div
            style={{
                background: backgroundColor,
                borderRadius: isLiveMode ? pxToVw(16) : 16,
                boxSizing: 'border-box',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #e3e3e3',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                width: '100%',
                height: '100%',
                aspectRatio: isLiveMode ? `${containerWidth} / ${containerHeight}` : undefined,
                padding: isLiveMode ? pxToVw(32) : 32,
                minWidth: isLiveMode ? undefined : 200,
                minHeight: isLiveMode ? undefined : 120
            }}
        >
            {/* 제목 */}
            <div
                style={{
                    fontFamily: titleFontFamily,
                    fontSize: isLiveMode ? pxToVw(titleFontSize) : toPx(titleFontSize),
                    fontStyle: titleFontStyle,
                    fontWeight: titleFontWeight,
                    textDecoration: titleTextDecoration,
                    color: titleColor,
                    marginBottom: isLiveMode ? pxToVw(28) : 28,
                    textAlign: titleAlign,
                    width: '100%',
                    letterSpacing: 1,
                    lineHeight: 1.2,
                    wordBreak: 'keep-all',
                    background: 'none',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {title || <span style={{ color: "#bbb" }}>제목 없음</span>}
            </div>

            {/* 본문 */}
            <div
                style={{
                    fontFamily: contentFontFamily,
                    fontSize: isLiveMode ? pxToVw(contentFontSize) : toPx(contentFontSize),
                    fontWeight: contentFontWeight,
                    fontStyle: contentFontStyle,
                    textDecoration: contentTextDecoration,
                    color: contentColor,
                    textAlign: contentAlign,
                    lineHeight: 1.7,
                    width: '100%',
                    wordBreak: 'keep-all',
                    background: 'none',
                    whiteSpace: 'pre-wrap'
                }}
            >
                {contentLines.map((line, idx) => (
                    <div key={idx} style={{ 
                        minHeight: isLiveMode ? pxToVw(24) : 24, 
                        whiteSpace: 'pre-wrap' 
                    }}>
                        {line && line.trim().length > 0 ? line : <span style={{ opacity: 0.3 }}>　</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}