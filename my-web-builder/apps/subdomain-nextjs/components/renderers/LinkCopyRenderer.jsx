import React, { useState } from 'react';

const LinkCopyRenderer = ({ comp, mode = 'live' }) => {
  // comp.props 구조 분해
  const {
    icon = '/icons/linkcopy.png',
    tooltip = '링크 복사',
    size = 32,
    bg = 'transparent',
    hoverBg = '#f5f5f5',
  } = comp?.props || {};

  const [copied, setCopied] = useState(false);

  // 클릭 동작 분기 - 에디터 모드에서 클릭 차단
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // 실제 배포 페이지에서의 동작
    if (typeof window !== 'undefined' && window.location) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      });
    }
  };

  const responsiveSize =
    mode === 'live'
      ? `clamp(${size * 0.7}px, ${(size / 375) * 100}vw, ${size}px)`
      : `${size}px`;

  return (
    <div
      onClick={handleClick}
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: responsiveSize,
        height: responsiveSize,
        background: bg,
        borderRadius: mode === 'live' ? 'clamp(6px, 1.5vw, 8px)' : '8px',
        cursor: mode === 'editor' ? 'default' : 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (mode !== 'editor') {
          e.currentTarget.style.background = hoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (mode !== 'editor') {
          e.currentTarget.style.background = bg;
        }
      }}
    >
      <img
        src={icon}
        alt="링크 복사"
        width={
          mode === 'live'
            ? `clamp(${size * 0.56}px, ${((size * 0.8) / 375) * 100}vw, ${size * 0.8}px)`
            : size * 0.8
        }
        height={
          mode === 'live'
            ? `clamp(${size * 0.56}px, ${((size * 0.8) / 375) * 100}vw, ${size * 0.8}px)`
            : size * 0.8
        }
        style={{ pointerEvents: 'none' }}
      />
      {copied && (
        <span
          style={{
            position: 'absolute',
            top: mode === 'live' ? 'clamp(-32px, -8vw, -28px)' : '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#222',
            color: '#fff',
            fontSize: mode === 'live' ? 'clamp(10px, 2.5vw, 12px)' : 12,
            padding:
              mode === 'live'
                ? 'clamp(3px, 1vw, 4px) clamp(8px, 2vw, 10px)'
                : '4px 10px',
            borderRadius: mode === 'live' ? 'clamp(4px, 1vw, 6px)' : 6,
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          복사됨!
        </span>
      )}
    </div>
  );
};

export default LinkCopyRenderer;
