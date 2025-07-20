import React, { useState } from 'react';

function ImageRenderer({ comp, onUpdate, mode = 'live', width, height }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.log('이미지 로드 실패:', comp.props?.src);
  };

  // 이미지가 없는 경우
  if (!comp.props?.src) {
    return (
      <div style={{
        width: mode === 'live' ? '100%' : (comp.width || 200) + 'px',
        height: mode === 'live' ? (comp.height || 150) + 'px' : (comp.height || 150) + 'px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div>🖼️</div>
          <div>이미지를 선택하세요</div>
        </div>
      </div>
    );
  }

  // 기본 컨테이너 스타일
  const containerStyle = {
    width: mode === 'live' ? '100%' : (comp.width || 200) + 'px',
    height: mode === 'live' ? (comp.height || 150) + 'px' : (comp.height || 150) + 'px',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: (comp.props?.borderRadius || 0) + 'px',
    backgroundColor: '#f9fafb'
  };

  // 객체에서 이미지 URL 추출
  let imageSource = '';
  if (typeof comp.props.src === 'string') {
    imageSource = comp.props.src;
  } else if (comp.props.src && typeof comp.props.src === 'object') {
    // 객체에서 이미지 URL 추출 - 원본과 썸네일 모두 지원
    // 원본 이미지 사용
    if (comp.props.src.original) {
      imageSource = comp.props.src.original;
    } 
    // 썸네일 이미지 사용 (원본 이미지가 없는 경우)
    else if (comp.props.src.thumbnail) {
      imageSource = comp.props.src.thumbnail;
    }
    // 기타 URL 형식 사용
    else {
      imageSource = comp.props.src.originalUrl || comp.props.src.thumbUrl || comp.props.src.url || '';
    }
    
    // 디버깅용 로그
    console.log('이미지 데이터:', comp.props.src);
    console.log('사용하는 이미지 URL:', imageSource);
  }

  return (
    <div style={containerStyle}>
      {/* 로딩 상태 */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666'
        }}>
          <div>⏳</div>
          <div>로딩 중...</div>
        </div>
      )}

      {/* 에러 상태 */}
      {imageError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#ef4444'
        }}>
          <div>❌</div>
          <div>이미지를 불러올 수 없습니다</div>
        </div>
      )}

      {/* 실제 이미지 - 갤러리 컴포넌트와 동일한 방식으로 구현 */}
      <img
        src={imageSource}
        alt={comp.props?.alt || '이미지'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: comp.props?.objectFit || 'cover',
          display: imageError ? 'none' : 'block'
        }}
      />


    </div>
  );
}

export default ImageRenderer;
