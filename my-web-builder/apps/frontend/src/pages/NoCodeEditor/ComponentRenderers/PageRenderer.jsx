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
    fontSize = '12px',
    fontWeight = '500',
    deployedUrl,
    linkedPageId,
    description = ''
  } = component.props;

  const handleClick = (e) => {
    if (isEditor) {
      // 에디터 모드에서는 Ctrl/Cmd + 클릭으로 페이지 이동
      if (e.ctrlKey || e.metaKey) {
        e.stopPropagation();
        navigateToPage();
      } else {
        // 일반 클릭: Properties 패널 열기
        onUpdate({ 
          ...component, 
          showProperties: true 
        });
      }
    } else {
      // 배포 모드: 바로 페이지 이동
      navigateToPage();
    }
  };

  const navigateToPage = () => {
    if (deployedUrl) {
      window.open(deployedUrl, '_blank');
    } else if (linkedPageId) {
      // 실제 페이지 URL로 이동
      const pageUrl = `${window.location.origin}/editor/${linkedPageId}`;
      window.open(pageUrl, '_blank');
    } else {
      alert('⚠️ 연결된 페이지가 없습니다. 먼저 페이지를 생성해주세요.');
    }
  };

  // 컨테이너 스타일 (100x150px)
  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor,
    border: `${borderWidth} ${borderStyle} ${borderColor}`,
    borderRadius,
    cursor: isEditor ? 'pointer' : 'pointer',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition: 'all 0.2s ease'
  };

  // 호버 스타일
  const hoverStyle = {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)'
  };

  return (
    <div 
      className={`page-component ${isEditor ? 'editor-mode' : 'deploy-mode'}`}
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        Object.assign(e.target.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = 'none';
        e.target.style.transform = 'none';
      }}
      title={isEditor ? 'Ctrl/Cmd + 클릭으로 페이지 이동' : '클릭하여 페이지 이동'}
    >
      {/* 상단 썸네일 영역 (60% = 90px) */}
      <div style={{
        height: '60%', // 6:4 비율의 60%
        width: '100%',
        backgroundColor: thumbnail ? 'transparent' : '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={`${pageName} 썸네일`}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
          />
        ) : (
          <div style={{
            fontSize: '32px',
            opacity: 0.4,
            color: textColor
          }}>
            📄
          </div>
        )}
        
        {/* 연결 상태 표시 (썸네일 영역 우상단) */}
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '10px',
          padding: '2px 4px',
          borderRadius: '3px',
          backgroundColor: linkedPageId ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)',
          color: 'white',
          lineHeight: '1',
          fontWeight: '600'
        }}>
          {linkedPageId ? '🔗' : '❌'}
        </div>
      </div>
      
      {/* 하단 텍스트 영역 (40% = 60px) */}
      <div style={{
        height: '40%', // 6:4 비율의 40%
        width: '100%',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        color: textColor
      }}>
        {/* 페이지 제목 */}
        <div style={{
          fontSize: '10px',
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: '1.2',
          marginBottom: '2px',
          wordBreak: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%'
        }}>
          {pageName}
        </div>
        
        {/* 설명 (있을 경우) */}
        {description && (
          <div style={{
            fontSize: '8px',
            opacity: 0.7,
            textAlign: 'center',
            lineHeight: '1.1',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            width: '100%'
          }}>
            {description}
          </div>
        )}
      </div>
      
      {/* 에디터 모드 도움말 (좌하단) */}
      {isEditor && (
        <div style={{
          position: 'absolute',
          bottom: '2px',
          left: '2px',
          fontSize: '6px',
          opacity: 0.5,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '1px 3px',
          borderRadius: '2px',
          lineHeight: '1'
        }}>
          Ctrl+클릭
        </div>
      )}
      
      {/* 배포 모드 표시 (우하단) */}
      {!isEditor && (
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          fontSize: '8px',
          opacity: 0.6,
          lineHeight: '1'
        }}>
          🚀
        </div>
      )}
    </div>
  );
};

export default PageRenderer;
