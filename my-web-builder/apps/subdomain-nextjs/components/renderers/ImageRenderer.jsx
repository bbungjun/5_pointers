import React, { useState, useEffect, useRef } from 'react';

function ImageRenderer({ comp, onUpdate, mode = 'live', width, height }) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;

  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 애니메이션 효과 ref
  const animationRef = useRef(null);
  const [particles, setParticles] = useState([]);
  const animationFrameRef = useRef(null);

  // 동적 애니메이션 효과 초기화
  useEffect(() => {
    const effect = comp?.props?.weddingEffect || 'none';
    const intensity = comp?.props?.effectIntensity || 50;

    if (effect === 'none') {
      setParticles([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // 파티클 생성
    const createParticles = () => {
      const particleCount = Math.floor((intensity / 100) * 50) + 10;
      const newParticles = [];

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          rotation: Math.random() * 360,
          rotationSpeed: Math.random() * 4 - 2,
          type: effect,
        });
      }

      setParticles(newParticles);
    };

    createParticles();

    // 애니메이션 루프
    const animate = () => {
      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          let newX = particle.x;
          let newY = particle.y;

          switch (effect) {
            case 'falling-snow':
            case 'falling-petals':
              newY += particle.speed * 0.5;
              newX += Math.sin(Date.now() * 0.001 + particle.id) * 0.3;
              if (newY > 100) {
                newY = -10;
                newX = Math.random() * 100;
              }
              break;
            case 'floating-hearts':
            case 'romantic-bubbles':
              newY -= particle.speed * 0.3;
              newX += Math.sin(Date.now() * 0.002 + particle.id) * 0.2;
              if (newY < -10) {
                newY = 110;
                newX = Math.random() * 100;
              }
              break;
            case 'sparkle-stars':
            case 'golden-particles':
              newX += Math.sin(Date.now() * 0.003 + particle.id) * 0.5;
              newY += Math.cos(Date.now() * 0.002 + particle.id * 2) * 0.3;
              break;
            case 'butterfly-dance':
              newX += Math.sin(Date.now() * 0.004 + particle.id) * 0.8;
              newY += Math.cos(Date.now() * 0.003 + particle.id * 1.5) * 0.6;
              break;
            case 'light-rays':
              newY += particle.speed * 0.2;
              if (newY > 100) newY = -10;
              break;
          }

          // 경계 처리
          if (newX < -10) newX = 110;
          if (newX > 110) newX = -10;

          return {
            ...particle,
            x: newX,
            y: newY,
            rotation: particle.rotation + particle.rotationSpeed,
          };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [comp?.props?.weddingEffect, comp?.props?.effectIntensity]);

  // 파티클 렌더링 함수
  const renderParticle = (particle) => {
    const particleStyles = {
      position: 'absolute',
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      fontSize: `${particle.size}px`,
      opacity: particle.opacity,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none',
      zIndex: 10,
    };

    const particleContent = {
      'falling-snow': '❄️',
      'falling-petals': '🌸',
      'floating-hearts': '❤️',
      'sparkle-stars': '✨',
      'golden-particles': '🌟',
      'butterfly-dance': '🦋',
      'romantic-bubbles': '💫',
      'light-rays': '✨',
    };

    return (
      <div key={particle.id} style={particleStyles}>
        {particleContent[particle.type] || '✨'}
      </div>
    );
  };

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
    borderRadius: `${(comp.props?.borderRadius || 0) * scaleFactor}px`, // 스케일링 적용
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    border: mode === 'editor' ? '1px solid #e5e7eb' : 'none',
    ...(mode === 'live'
      ? {
          width: '100%', // maxWidth 제거로 확대 허용
          height: `${finalHeight * scaleFactor}px`, // 높이도 스케일링 적용
        }
      : {
          width: finalWidth + 'px',
          height: finalHeight + 'px',
        }),
  };

  // 이미지가 없는 경우 플레이스홀더
  if (!comp.props?.src) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: `${Math.min(finalWidth, finalHeight) > 100 ? 14 * scaleFactor : 12 * scaleFactor}px`, // 스케일링 적용
          }}
        >
          <div
            style={{
              fontSize: `${Math.min(finalWidth, finalHeight) > 100 ? 24 * scaleFactor : 18 * scaleFactor}px`, // 스케일링 적용
              marginBottom: `${8 * scaleFactor}px`, // 스케일링 적용
            }}
          >
            🖼️
          </div>
          <div>이미지를 선택하세요</div>
          {mode === 'editor' && (
            <div
              style={{
                fontSize:
                  Math.min(finalWidth, finalHeight) > 100 ? '12px' : '10px',
                marginTop: '4px',
                color: '#6b7280',
              }}
            >
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
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>⏳</div>
          <div>로딩 중...</div>
        </div>
      )}

      {/* 에러 상태 */}
      {imageError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#ef4444',
            fontSize: Math.min(finalWidth, finalHeight) > 100 ? '14px' : '12px',
          }}
        >
          <div
            style={{
              fontSize:
                Math.min(finalWidth, finalHeight) > 100 ? '24px' : '18px',
              marginBottom: '8px',
            }}
          >
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
          display: imageError ? 'none' : 'block',
          transition: 'all 0.3s ease',
        }}
      />

      {/* 동적 애니메이션 효과 */}
      {comp?.props?.weddingEffect && comp?.props?.weddingEffect !== 'none' && (
        <div
          ref={animationRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {particles.map(renderParticle)}
        </div>
      )}
    </div>
  );
}

export default ImageRenderer;
