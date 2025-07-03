import React from 'react';
import ImageRenderer from '../../ComponentRenderers/ImageRenderer';

function ImageThumbnail() {
  // 썸네일용 props (이미지 없는 상태로 플레이스홀더 표시)
  const thumbnailProps = {
    props: {
      width: 160,
      height: 120,
      borderRadius: 8,
      src: null, // 이미지 없음 - 플레이스홀더 표시
      alt: '이미지',
      objectFit: 'cover'
    }
  };

  return (
    <div style={{
      width: 80,
      height: 60,
      overflow: 'hidden',
      borderRadius: 4,
      position: 'relative'
    }}>
      <div style={{
        width: 160,
        height: 120,
        transform: 'scale(0.5)', // 50% 축소 (80/160 = 0.5)
        transformOrigin: 'top left'
      }}>
        <ImageRenderer comp={thumbnailProps} isEditor={false} />
      </div>
    </div>
  );
}

export default ImageThumbnail;
