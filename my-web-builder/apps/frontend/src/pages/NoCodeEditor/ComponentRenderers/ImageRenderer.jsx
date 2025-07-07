import React, { useState } from 'react';

function ImageRenderer({ comp, isEditor = false, onUpdate }) {
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

  // 캔버스에서 조정된 크기를 우선 사용, 없으면 props의 기본값 사용
  const finalWidth = comp.width || comp.props?.width || 200;
  const finalHeight = comp.height || comp.props?.height || 150;

  const containerStyle = {
    width: finalWidth + 'px',
    height: finalHeight + 'px',
    borderRadius: (comp.props?.borderRadius || 0) + 'px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    border: isEditor ? '1px solid #e5e7eb' : 'none'
  };

  // 이미지가 없는 경우 플레이스홀더
  if (!comp.props?.src) {
    return (
      <div style={containerStyle}>
        <div style={{
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: Math.min(finalWidth, finalHeight) > 100 ? '14px' : '12px'
        }}>
          <div style={{ 
            fontSize: Math.min(finalWidth, finalHeight) > 100 ? '24px' : '18px', 
            marginBottom: '8px' 
          }}>
            🖼️
          </div>
          <div>이미지를 선택하세요</div>
          {isEditor && (
            <div style={{ 
              fontSize: Math.min(finalWidth, finalHeight) > 100 ? '12px' : '10px', 
              marginTop: '4px', 
              color: '#6b7280' 
            }}>
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
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⏳</div>
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
          color: '#ef4444',
          fontSize: Math.min(finalWidth, finalHeight) > 100 ? '14px' : '12px'
        }}>
          <div style={{ 
            fontSize: Math.min(finalWidth, finalHeight) > 100 ? '24px' : '18px', 
            marginBottom: '8px' 
          }}>
            ❌
          </div>
          <div>이미지를 불러올 수 없습니다</div>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        src={comp.props?.src}
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
