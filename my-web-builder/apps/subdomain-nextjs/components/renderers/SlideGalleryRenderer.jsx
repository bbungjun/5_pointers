/**
 * SlideGalleryRenderer - 슬라이드 형태의 갤러리 컴포넌트 렌더러
 *
 * 기능:
 * - 한 장씩 큰 이미지 표시 (메인 슬라이드)
 * - 하단 썸네일 리스트로 빠른 탐색
 * - 좌우 화살표 네비게이션
 * - 키보드 화살표 지원
 * - 자동 재생 기능
 * - 캡션 표시 기능
 * - 모바일 스와이프 지원 (추후)
 *
 * Props:
 * - containerWidth, containerHeight: 메인 슬라이드 영역 크기
 * - thumbnailHeight, thumbnailGap: 썸네일 설정
 * - images: 이미지 배열 [{ id, src, alt, caption }]
 * - showArrows, showThumbnails, showCounter, showCaption: 표시 옵션
 * - autoPlay, autoPlayInterval: 자동 재생 설정
 */

import React, { useState, useEffect, useRef } from 'react';

function SlideGalleryRenderer({
  comp,
  onUpdate,
  mode = 'live',
  width,
  height,
}) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;

  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const handleResize = () => {};

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const autoPlayRef = useRef(null);

  const {
    containerWidth = 375,
    containerHeight = 300,
    thumbnailHeight = 80,
    thumbnailGap = 8,
    borderRadius = 8,
    backgroundColor = '#ffffff',
    images = [],
    showArrows = true,
    showThumbnails = true,
    showCounter = true,
    showCaption = true,
    autoPlay = false,
    autoPlayInterval = 3000,
  } = comp.props;

  // 자동 재생 기능
  useEffect(() => {
    if (autoPlay && images.length > 1) {
      setIsAutoPlaying(true);
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    } else {
      setIsAutoPlaying(false);
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, images.length, mode]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length]);

  // 네비게이션 함수들
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // 현재 인덱스가 이미지 배열 범위를 벗어나면 조정
  useEffect(() => {
    if (images.length > 0 && currentIndex >= images.length) {
      setCurrentIndex(0);
    }
  }, [images.length, currentIndex]);

  // 메인 컨테이너 스타일
  const mainContainerStyle = {
    width: comp.width + 'px',
    height: comp.height + 'px',
    backgroundColor,
    borderRadius: `${borderRadius * scaleFactor}px`, // 스케일링 적용
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: `${12 * scaleFactor}px`, // 스케일링 적용
    ...(mode === 'live'
      ? {
          width: '100%',
          height: `${(comp.height || containerHeight) * scaleFactor}px`, // 높이 스케일링
          minHeight: `${(comp.height || containerHeight) * scaleFactor}px`, // 최소 높이 스케일링
        }
      : {}),
  };

  // 메인 슬라이드 영역 스타일
  const slideAreaStyle = {
    width: '100%',
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  };

  // 썸네일 영역 스타일
  const thumbnailAreaStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${thumbnailGap * scaleFactor}px`, // 스케일링 적용
    padding: `${12 * scaleFactor}px`, // 스케일링 적용
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  };

  // 썸네일 스타일
  const getThumbnailStyle = (index) => ({
    width: thumbnailHeight + 'px',
    height: thumbnailHeight + 'px',
    borderRadius: borderRadius / 2 + 'px',
    overflow: 'hidden',
    cursor: 'pointer',
    border:
      index === currentIndex ? '3px solid #3B4EFF' : '2px solid transparent',
    opacity: index === currentIndex ? 1 : 0.7,
    transition: 'all 0.2s ease',
    flexShrink: 0,
  });

  // 화살표 버튼 스타일
  const arrowButtonStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
    zIndex: 2,
  };

  // 이미지가 없을 때
  if (images.length === 0) {
    return (
      <div style={mainContainerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: `${14 * scaleFactor}px`, // 스케일링 적용
              fontWeight: '500',
            }}
          >
            <div
              style={{
                width: `${48 * scaleFactor}px`, // 스케일링 적용
                height: `${48 * scaleFactor}px`, // 스케일링 적용
                backgroundColor: '#f3f4f6',
                borderRadius: `${12 * scaleFactor}px`, // 스케일링 적용
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `0 auto ${12 * scaleFactor}px`, // 스케일링 적용
                fontSize: `${24 * scaleFactor}px`, // 스케일링 적용
                color: '#d1d5db',
              }}
            >
              +
            </div>
            <div>사진을 추가해주세요</div>
          </div>
        </div>
        {showThumbnails && (
          <div style={thumbnailAreaStyle}>
            <div
              style={{
                fontSize: `${12 * scaleFactor}px`, // 스케일링 적용
                color: '#9ca3af',
                textAlign: 'center',
              }}
            >
              썸네일이 여기에 표시됩니다
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div style={mainContainerStyle}>
      {/* 메인 슬라이드 영역 */}
      <div style={slideAreaStyle}>
        {/* 현재 이미지 */}
        <img
          src={currentImage?.src}
          alt={currentImage?.alt || `이미지 ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: borderRadius / 2 + 'px',
          }}
        />

        {/* 좌측 화살표 */}
        {showArrows && images.length > 1 && (
          <button
            onClick={goToPrevious}
            style={{
              ...arrowButtonStyle,
              left: '12px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ‹
          </button>
        )}

        {/* 우측 화살표 */}
        {showArrows && images.length > 1 && (
          <button
            onClick={goToNext}
            style={{
              ...arrowButtonStyle,
              right: '12px',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            ›
          </button>
        )}

        {/* 카운터 */}
        {showCounter && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* 캡션 */}
        {showCaption && currentImage?.caption && (
          <div
            style={{
              position: 'absolute',
              bottom: showCounter && images.length > 1 ? '40px' : '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              maxWidth: '80%',
              textAlign: 'center',
              wordBreak: 'keep-all',
            }}
          >
            {currentImage.caption}
          </div>
        )}
      </div>

      {/* 썸네일 영역 */}
      {showThumbnails && images.length > 1 && (
        <div style={thumbnailAreaStyle}>
          {images.map((image, index) => (
            <div
              key={image.id || index}
              style={getThumbnailStyle(index)}
              onClick={() => goToIndex(index)}
              onMouseEnter={(e) => {
                if (index !== currentIndex) {
                  e.target.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== currentIndex) {
                  e.target.style.opacity = '0.7';
                }
              }}
            >
              <img
                src={image.src}
                alt={image.alt || `썸네일 ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SlideGalleryRenderer;
