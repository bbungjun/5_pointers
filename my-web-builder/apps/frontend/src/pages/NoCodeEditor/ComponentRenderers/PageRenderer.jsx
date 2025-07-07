import React from 'react';

const PageRenderer = ({ component, comp, isEditor, onUpdate }) => {
  // comp 또는 component 속성 모두 지원 (배포 환경 호환성)
  const actualComponent = component || comp;
  
  // 안전한 props 처리 - component나 component.props가 없을 경우 기본값 사용
  if (!actualComponent) {
    console.warn('PageRenderer: component가 전달되지 않았습니다.');
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        border: '2px solid #007bff',
        borderRadius: '8px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📄</div>
          <div style={{ fontSize: '12px' }}>페이지 컴포넌트</div>
        </div>
      </div>
    );
  }

  const props = actualComponent.props || {};
  
  const { 
    pageName = "", 
    thumbnail, 
    backgroundColor = '#ffffff', // 전체 배경색 (하위 호환성)
    thumbnailBackgroundColor, // 썸네일 영역 배경색
    textBackgroundColor, // 텍스트 영역 배경색
    textColor = '#333333',
    borderStyle = 'solid',
    borderWidth = '2px',
    borderColor = '#007bff',
    borderRadius = '8px',
    fontSize = '12px', // 하위 호환성
    titleFontSize, // 페이지 이름 크기
    descriptionFontSize, // 설명 텍스트 크기
    fontWeight = '500',
    deployedUrl,
    linkedPageId,
    description = ''
  } = props;

  // 개별 배경색이 설정되지 않은 경우 전체 배경색 사용 (하위 호환성)
  const finalThumbnailBg = thumbnailBackgroundColor || backgroundColor || '#f8f9fa';
  const finalTextBg = textBackgroundColor || backgroundColor || '#ffffff';
  
  // 텍스트 크기 설정
  const finalTitleFontSize = titleFontSize || '10px';
  const finalDescriptionFontSize = descriptionFontSize || '8px';

  const handleClick = (e) => {
    if (isEditor) {
      // 에디터 모드에서는 Ctrl/Cmd + 클릭으로 페이지 이동
      if (e.ctrlKey || e.metaKey) {
        e.stopPropagation();
        navigateToPage();
      } else {
        // 일반 클릭: Properties 패널 열기
        if (onUpdate) {
          onUpdate({ 
            ...actualComponent, 
            showProperties: true 
          });
        }
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
      if (isEditor) {
        alert('⚠️ 연결된 페이지가 없습니다. 먼저 페이지를 생성해주세요.');
      }
    }
  };

  // 컨테이너 스타일 (100x150px)
  const containerStyle = {
    width: '100%',
    height: '100%',
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

  // 호버 스타일 (배포 환경에서는 적용하지 않음)
  const hoverStyle = isEditor ? {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)'
  } : {};

  return (
    <div 
      className={`page-component ${isEditor ? 'editor-mode' : 'deploy-mode'}`}
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (isEditor) {
          Object.assign(e.target.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (isEditor) {
          e.target.style.boxShadow = 'none';
          e.target.style.transform = 'none';
        }
      }}
      title={isEditor ? 'Ctrl/Cmd + 클릭으로 페이지 이동' : '클릭하여 페이지 이동'}
    >
      {/* 상단 썸네일 영역 (60% = 90px) - 항상 배경색 적용 */}
      <div style={{
        height: '60%', // 6:4 비율의 60%
        width: '100%',
        backgroundColor: finalThumbnailBg, // 항상 배경색 적용
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={`${pageName || "페이지"} 썸네일`}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              objectPosition: 'center'
            }}
            onError={(e) => {
              // 이미지 로드 실패 시 기본 아이콘 표시
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        {/* 기본 아이콘 (썸네일이 없거나 로드 실패 시) */}
        <div style={{
          display: thumbnail ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          fontSize: '32px',
          opacity: 0.4,
          color: textColor
          // backgroundColor는 부모에서 이미 설정됨
        }}>
          📄
        </div>
        
        {/* 연결 상태 표시 (썸네일 영역 우상단) - 에디터 모드에서만 */}
        {isEditor && (
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
        )}
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
        color: textColor,
        backgroundColor: finalTextBg
      }}>
        {/* 페이지 제목 */}
        <div style={{
          fontSize: finalTitleFontSize,
          fontWeight: '600',
          textAlign: 'center',
          lineHeight: '1.2',
          marginBottom: '2px',
          wordBreak: 'break-word',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          width: '100%',
          whiteSpace: 'pre-wrap'
        }}>
          {pageName || "페이지"}
        </div>
        
        {/* 설명 (있을 경우) - 줄바꿈 처리 및 2줄 제한 */}
        {description && (
          <div style={{
            fontSize: finalDescriptionFontSize,
            opacity: 0.7,
            textAlign: 'center',
            lineHeight: '1.2',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            whiteSpace: 'pre-wrap', // 줄바꿈 처리
            width: '100%',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}>
            {description}
          </div>
        )}
      </div>
      
      {/* 에디터 모드 도움말 (좌하단) - 에디터 모드에서만 */}
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
      
      {/* 배포 모드 표시 (우하단) - 배포 모드에서만 */}
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
