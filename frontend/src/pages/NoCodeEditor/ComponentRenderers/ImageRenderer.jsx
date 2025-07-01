import React, { useState } from 'react';
import { getResponsiveValue, getResponsiveScale } from '../utils/editorUtils';

function ImageRenderer({ comp, isEditor = false, onUpdate, viewport = 'desktop' }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  // 반응형 스케일링 적용
  const scale = getResponsiveScale(viewport);
  const responsiveWidth = getResponsiveValue(comp.props.width || 200, viewport, 'size');
  const responsiveHeight = getResponsiveValue(comp.props.height || 150, viewport, 'size');
  const responsiveBorderRadius = Math.max(0, Math.round((comp.props.borderRadius || 0) * scale));
  
  const containerStyle = {
    width: responsiveWidth + 'px',
    height: responsiveHeight + 'px',
    borderRadius: responsiveBorderRadius + 'px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    border: isEditor ? '1px solid #e5e7eb' : 'none'
  };

  // 이미지가 없는 경우 플레이스홀더
  if (!comp.props.src) {
    return (
      <div style={containerStyle}>
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: Math.max(12, Math.round(14 * scale)) + 'px'
        }}>
          <div style={{ fontSize: Math.max(16, Math.round(24 * scale)) + 'px', marginBottom: Math.max(4, Math.round(8 * scale)) + 'px' }}>🖼️</div>
          <div>이미지를 선택하세요</div>
          {isEditor && (
            <div style={{ fontSize: Math.max(10, Math.round(12 * scale)) + 'px', marginTop: Math.max(2, Math.round(4 * scale)) + 'px', color: '#6b7280' }}>
              속성 패널에서 업로드
            </div>
          )}
        </div>
      </div>
    );
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
          color: '#9ca3af',
          fontSize: '14px'
        }}>
          로딩 중...
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
          color: '#ef4444',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>❌</div>
          <div>이미지를 불러올 수 없습니다</div>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        src={comp.props.src}
        alt={comp.props.alt || '이미지'}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: comp.props.objectFit || 'cover',
          display: imageError ? 'none' : 'block'
        }}
      />
    </div>
  );
}

export default ImageRenderer;
