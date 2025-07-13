import React, { useState } from 'react';

const LinkCopyRenderer = ({ component, isEditor = false, mode = 'editor', onUpdate }) => {
  // component.props 구조 분해
  const {
    icon = '/icons/linkcopy.png',
    tooltip = '링크 복사',
    size = 32,
    bg = 'transparent',
    hoverBg = '#f5f5f5'
  } = component?.props || {};

  const [copied, setCopied] = useState(false);

  // 클릭 동작 분기
  const handleClick = (e) => {
    e.stopPropagation();
    // 👉 에디터에서는 안내만
    if (mode === 'editor') {
      e.preventDefault();
    } else {
      // 👉 실제 배포 페이지에서의 동작
      if (typeof window !== 'undefined' && window.location) {
        navigator.clipboard.writeText(window.location.href)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
          });
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        background: bg,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.2s',
        position: 'relative',
        userSelect: 'none'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; }}
    >
      <img
        src={icon}
        alt="링크 복사"
        width={size * 0.8}
        height={size * 0.8}
        style={{ pointerEvents: 'none' }}
      />
      {copied && (
        <span style={{
          position: 'absolute',
          top: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#222',
          color: '#fff',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 6,
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          복사됨!
        </span>
      )}
    </div>
  );
};

export default LinkCopyRenderer;