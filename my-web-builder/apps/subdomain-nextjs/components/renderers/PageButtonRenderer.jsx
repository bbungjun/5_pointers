import React from 'react';

const PageButtonRenderer = ({ component, comp, isEditor, onUpdate }) => {
  // 디버깅을 위한 로그 추가
  console.log('🔍 PageButtonRenderer props:', { component, comp, isEditor });
  
  // component 또는 comp prop 둘 다 처리
  const compData = component || comp;
  console.log('🔍 PageButtonRenderer compData:', compData);
  
  if (!compData) {
    console.error('❌ PageButtonRenderer: compData is null or undefined');
    return <div>PageButtonRenderer: No component data</div>;
  }
  
  console.log('🔍 PageButtonRenderer compData.props:', compData.props);
  
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
  } = compData?.props || {};

  const handleClick = (e) => {
    if (!linkedPageId) return;
    if (isEditor) {
      if (e.ctrlKey || e.metaKey) {
        e.stopPropagation();
        navigateToLinkedPage();
      }
    } else {
      navigateToLinkedPage();
    }
  };

  const navigateToLinkedPage = () => {
    if (isEditor && linkedPageId) {
      window.location.href = `/editor/${linkedPageId}`;
    } else if (!isEditor && deployedUrl) {
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
        borderRadius: `${borderRadius}px`,
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
        transition: 'background 0.2s',
        whiteSpace: 'pre-wrap' // ✅
      }}
      onClick={handleClick}
      title={
        isEditor
          ? linkedPageId
            ? `${buttonText} (${navigator?.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'}+클릭으로 이동)`
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
      
      {!linkedPageId && isEditor && (
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: '#dc3545',
            color: 'white',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}
        >
          페이지 연결 필요
        </div>
      )}
    </div>
  );
};

export default PageButtonRenderer;
