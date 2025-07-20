import React, { useState } from 'react';

function ImageRenderer({ comp, onUpdate, mode = 'live', width, height }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 URL 추출 함수
  const getImageUrl = (src) => {
    // 문자열인 경우 처리
    if (typeof src === 'string') {
      // S3 URL인 경우 그대로 사용
      if (src.includes('s3.ap-northeast-2.amazonaws.com') || 
          src.includes('amazonaws.com') || 
          src.includes('http://') || 
          src.includes('https://')) {
        return src;
      }
      
      // 상대 경로인 경우 절대 경로로 변환
      if (src.startsWith('/') && typeof window !== 'undefined') {
        // 프로덕션 환경에서는 절대 URL 사용
        const isProduction = typeof window !== 'undefined' && 
          (window.location.hostname !== 'localhost' && 
           !window.location.hostname.includes('127.0.0.1'));
        
        // 프로덕션에서는 메인 도메인 사용, 개발환경에서는 현재 도메인 사용
        const baseUrl = isProduction 
          ? 'https://ddukddak.org' 
          : window.location.origin;
        
        return `${baseUrl}${src}`;
      }
      return src;
    }
    
    // 객체인 경우 처리
    if (!src || typeof src !== 'object') return '';
    
    // 객체에서 URL 추출 시도
    let url = '';
    
    // 백엔드에서 사용하는 형식에 맞게 추출
    if (src.originalUrl) url = src.originalUrl;  // S3 업로드 형식
    else if (src.original) url = src.original;    // 객체 내 original 속성
    else if (src.url) url = src.url;             // 객체 내 url 속성
    else if (src.src) url = src.src;             // 객체 내 src 속성
    else if (src.thumbUrl) url = src.thumbUrl;   // 썸네일 URL
    else if (src.thumbnail) url = src.thumbnail; // 썸네일 속성
    else {
      // 객체를 문자열로 변환 시도
      try {
        url = String(src);
      } catch (e) {
        return '';
      }
    }
    
    // 추출된 URL이 상대 경로인 경우 절대 경로로 변환
    if (url.startsWith('/') && typeof window !== 'undefined') {
      const isProduction = typeof window !== 'undefined' && 
        (window.location.hostname !== 'localhost' && 
         !window.location.hostname.includes('127.0.0.1'));
      
      const baseUrl = isProduction 
        ? 'https://ddukddak.org' 
        : window.location.origin;
      
      return `${baseUrl}${url}`;
    }
    
    return url;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
    console.log('이미지 로드 실패:', getImageUrl(comp.props?.src));
  };

  // 현재 환경 확인
  const isProduction = typeof window !== 'undefined' && 
    (window.location.hostname !== 'localhost' && 
     !window.location.hostname.includes('127.0.0.1'));
  
  console.log('현재 환경:', isProduction ? '프로덕션' : '개발');
  console.log('원본 이미지 데이터:', comp.props?.src);
  
  // 이미지 URL 추출
  const imageUrl = getImageUrl(comp.props?.src);
  console.log('최종 이미지 URL:', imageUrl);

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

      {/* 실제 이미지 */}
      <img
        src={imageUrl}
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
