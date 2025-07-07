import React from 'react';

const PageRenderer = ({ component, isEditor, onUpdate }) => {
  const { 
    pageName = '새 페이지', 
    thumbnail, 
    backgroundColor = '#ffffff', 
    textColor = '#333333',
    borderStyle = 'solid',
    borderWidth = '2px',
    borderColor = '#007bff',
    borderRadius = '8px',
    fontSize = '16px',
    fontWeight = '500',
    deployedUrl
  } = component.props;

  const handleClick = () => {
    if (isEditor) {
      // 에디터: Properties 패널 열기
      onUpdate && onUpdate({ showProperties: true });
    } else {
      // 배포: 페이지 이동
      if (deployedUrl) {
        window.location.href = deployedUrl;
      }
    }
  };

  const containerStyle = {
    backgroundColor,
    color: textColor,
    border: `${borderWidth} ${borderStyle} ${borderColor}`,
    borderRadius,
    fontSize,
    fontWeight,
    cursor: isEditor ? 'pointer' : 'pointer',
    transition: 'all 0.3s ease',
    padding: '16px',
    textAlign: 'center',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  const hoverStyle = {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  };

  return (
    <div
      className={`page-component ${isEditor ? 'editor-mode' : 'deploy-mode'}`}
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (isEditor) {
          e.target.style.transform = hoverStyle.transform;
          e.target.style.boxShadow = hoverStyle.boxShadow;
        }
      }}
      onMouseLeave={(e) => {
        if (isEditor) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      {thumbnail && (
        <img 
          src={thumbnail} 
          alt={`${pageName} 썸네일`}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '12px'
          }}
        />
      )}
      
      <span className="page-name" style={{ fontSize: '18px', fontWeight: '600' }}>
        {pageName}
      </span>
      
      {isEditor && (
        <div className="edit-indicator" style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '16px',
          opacity: 0.7
        }}>
          ✏️
        </div>
      )}
      
      {!isEditor && deployedUrl && (
        <div className="deploy-indicator" style={{
          fontSize: '12px',
          opacity: 0.8,
          marginTop: '8px'
        }}>
          클릭하여 이동 →
        </div>
      )}
    </div>
  );
};

export default PageRenderer; 