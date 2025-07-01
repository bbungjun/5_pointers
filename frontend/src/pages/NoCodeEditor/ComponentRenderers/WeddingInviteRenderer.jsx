import React from 'react';

export default function WeddingInviteRenderer({ comp }) {
    const {
        containerWidth = comp.width || 450,
        containerHeight = comp.height || 400,
        title = "Our Love Story",
        titleFontFamily = "\"Dancing Script\", \"cursive\", \"Noto Sans KR\", \"맑은 고딕\", sans-serif",
        titleFontSize = 32,
        titleFontStyle = "italic",
        titleFontWeight = "normal",
        titleTextDecoration = "none",
        titleColor = "#aaa",
        titleAlign = "center",
        content = [
            "서로가 마주보며 다져온 사랑을",
            "이제 함께 한 곳을 바라보며",
            "걸어갈 수 있는 큰 사랑으로 키우고자 합니다.",
            "",
            "저희 두 사람이 사랑의 이름으로",
            "지켜나갈 수 있게 앞날을",
            "축복해 주시면 감사하겠습니다."
        ],
        contentFontFamily = "\"Noto Sans KR\", \"맑은 고딕\", sans-serif",
        contentFontSize = 26,
        contentFontWeight = "normal",
        contentFontStyle = "normal",
        contentTextDecoration = "none",
        contentColor = "#444",
        contentAlign = "center",
        backgroundColor = "#fff"
    } = comp.props;

    const toPx = v => (typeof v === 'number' ? `${v}px` : v || undefined);
    const contentLines = Array.isArray(content) ? content : String(content).split('\n');

    return (
        <div
            style={{
                padding: 24,
                background: backgroundColor,
                borderRadius: 8,
                width: containerWidth,
                //height: containerHeight,
                boxSizing: 'border-box',
                //overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {/* 제목 */}
            <div
                style={{
                    fontFamily: titleFontFamily,
                    fontSize: toPx(titleFontSize),
                    fontStyle: titleFontStyle,
                    fontWeight: titleFontWeight,
                    textDecoration: titleTextDecoration,
                    color: titleColor,
                    marginBottom: 36,
                    textAlign: titleAlign,
                    width: '100%'
                }}
            >
                {title}
            </div>

            {/* 본문 */}
            <div
                style={{
                    fontFamily: contentFontFamily,
                    fontSize: toPx(contentFontSize),
                    fontWeight: contentFontWeight,
                    fontStyle: contentFontStyle,
                    textDecoration: contentTextDecoration,
                    color: contentColor,
                    textAlign: contentAlign,
                    lineHeight: 1.6,
                    width: '100%'
                }}
            >
                {contentLines.map((line, idx) => (
                    <div key={idx}>
                        {line || '\u00A0'}
                    </div>
                ))}
            </div>
        </div>
    );
}