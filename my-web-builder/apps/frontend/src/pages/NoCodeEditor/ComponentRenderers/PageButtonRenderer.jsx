import React from 'react';

const PageButtonRenderer = ({ component, comp, mode = 'editor', isPreview = false, onUpdate }) => {
  // component 또는 comp 중 하나를 사용 (하위 호환성)
  const actualComp = comp || component;
  const {
    buttonText = '페이지 이동',
    icon = '📄',
    backgroundColor = '#007bff',
    textColor = '#ffffff',
    borderColor = '#007bff',
    borderWidth = '2px',
    borderRadius = 8,
    fontSize = 16,
    fontWeight = '600',
    fontFamily = 'Pretendard, Noto Sans KR, sans-serif',
    fontStyle = 'normal',
    textDecoration = 'none',
    noBackground = false,
    noBorder = false,
    linkedPageId = '',
    deployedUrl = ''
  } = actualComp?.props || {};

  const handleClick = (e) => {
    if (isPreview) return; // 미리보기에서는 클릭 비활성화
    if (!linkedPageId) return;
    
    if (mode === 'editor') {
      if (e.ctrlKey || e.metaKey) {
        e.stopPropagation();
        navigateToLinkedPage();
      }
    } else {
      navigateToLinkedPage();
    }
  };

  const navigateToLinkedPage = () => {
    if (mode === 'editor' && linkedPageId) {
      window.location.href = `/editor/${linkedPageId}`;
    } else if (mode !== 'editor' && deployedUrl) {
      window.location.href = deployedUrl;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: noBackground ? 'transparent' : backgroundColor,
        color: textColor,
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
        borderRadius: 0,
        cursor: linkedPageId ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: Number(fontWeight),
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        textDecoration: textDecoration,
        position: 'relative',
        opacity: linkedPageId ? 1 : 0.5,
        userSelect: 'none',
        transition: 'background 0.2s'
      }}
      onClick={handleClick}
      title={
        mode === 'editor'
          ? linkedPageId
            ? `${buttonText} (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+클릭으로 이동)`
            : '페이지가 연결되지 않음'
          : buttonText
      }
      tabIndex={0}
    >
      <span style={{
        fontSize: `${fontSize + 4}px`,
        marginRight: '8px',
        fontFamily: fontFamily,
        fontStyle: fontStyle,
        fontWeight: Number(fontWeight),
        textDecoration: textDecoration,
        color: textColor
      }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: Number(fontWeight),
          fontFamily: fontFamily,
          fontStyle: fontStyle,
          textDecoration: textDecoration,
          color: textColor,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '70%'
        }}
      >
        {buttonText}
      </span>
      {mode === 'editor' && (
        <span style={{
          position: 'absolute',
          top: 6,
          right: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '10px',
          padding: '2px 6px'
        }}>
          {navigator.platform.includes('Mac') ? '⌘+클릭' : 'Ctrl+클릭'}
        </span>
      )}
      {mode === 'editor' && (
        <span style={{
          position: 'absolute',
          bottom: 6,
          right: 10,
          backgroundColor: linkedPageId ? '#10b981' : '#f59e0b',
          color: 'white',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }}>
          {linkedPageId ? '🔗' : '⚠️'}
        </span>
      )}
    </div>
  );
};

export default PageButtonRenderer;