import React from 'react';

const PageRenderer = ({ component, comp, isEditor, onUpdate }) => {
  // 디버깅을 위한 로그 추가
  console.log('🔍 PageRenderer props:', { component, comp, isEditor });
  
  // component 또는 comp prop 둘 다 처리
  const compData = component || comp;
  console.log('🔍 PageRenderer compData:', compData);
  
  if (!compData) {
    console.error('❌ PageRenderer: compData is null or undefined');
    return <div>PageRenderer: No component data</div>;
  }
  
  console.log('🔍 PageRenderer compData.props:', compData.props);
  
  const {
    pageName = '새 페이지',
    description = '',
    thumbnail = '',
    thumbnailType = 'auto',
    backgroundColor = '#ffffff',
    textColor = '#333333',
    borderColor = '#007bff',
    borderWidth = '2px',
    borderRadius = 8,
    fontSize = 14,
    fontWeight = '500',
    linkedPageId = '',
    deployedUrl = ''
  } = compData?.props || {};

  const handleClick = (e) => {
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

  const renderThumbnail = () => {
    if (thumbnailType === 'none') return null;
    
    if (thumbnailType === 'upload' && thumbnail) {
      return React.createElement('img', {
        src: thumbnail,
        alt: `${pageName} 썸네일`,
        style: {
          width: '100%',
          height: '60%',
          objectFit: 'cover',
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`
        }
      });
    }
    
    return React.createElement('div', {
      style: {
        width: '100%',
        height: '60%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: `${borderRadius}px ${borderRadius}px 0 0`
      }
    }, React.createElement('span', { style: { fontSize: '24px' } }, '📄'));
  };

  return React.createElement('div', {
    className: `page-component ${isEditor ? 'editor-mode' : 'deploy-mode'}`,
    style: {
      width: '100%',
      height: '100%',
      backgroundColor,
      border: `${borderWidth} solid ${borderColor}`,
      borderRadius: `${borderRadius}px`,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    onClick: handleClick,
    title: isEditor 
      ? `${pageName} (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+클릭으로 페이지 이동)` 
      : `${pageName}으로 이동`
  }, [
    renderThumbnail(),
    React.createElement('div', {
      style: {
        padding: '8px',
        height: '40%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }
    }, [
      React.createElement('div', {
        key: 'title',
        style: {
          fontSize: `${fontSize}px`,
          fontWeight,
          color: textColor,
          textAlign: 'center',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, pageName),
      description && React.createElement('div', {
        key: 'desc',
        style: {
          fontSize: `${fontSize - 2}px`,
          color: textColor,
          opacity: 0.7,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, description)
    ]),
    isEditor && React.createElement('div', {
      style: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }
    }, [
      React.createElement('div', {
        key: 'hint',
        style: {
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '8px'
        }
      }, navigator.platform.includes('Mac') ? '⌘+클릭' : 'Ctrl+클릭'),
      React.createElement('div', {
        key: 'status',
        style: {
          backgroundColor: linkedPageId ? '#10b981' : '#f59e0b',
          color: 'white',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px'
        }
      }, linkedPageId ? '🔗' : '⚠️')
    ])
  ]);
};

export default PageRenderer;
