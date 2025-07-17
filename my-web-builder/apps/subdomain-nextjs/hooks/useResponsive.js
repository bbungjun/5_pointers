import { useState, useEffect } from 'react';

export const useResponsive = (
  mode = 'live',
  originalWidth,
  originalHeight,
  editingMode = 'desktop'
) => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      setIsLiveMode(isMobile);

      // 모바일 화면에서는 editingMode에 관계없이 동일한 스케일링 적용
      if (isMobile) {
        const newScaleFactor = window.innerWidth / 375; // 모바일 기준 너비 사용
        setScaleFactor(newScaleFactor);
      } else {
        setScaleFactor(1);
      }

      const handleResize = () => {
        const isMobile = window.innerWidth <= 768;
        setIsLiveMode(isMobile);

        // 모바일 화면에서는 editingMode에 관계없이 동일한 스케일링 적용
        if (isMobile) {
          const newScaleFactor = window.innerWidth / 375; // 모바일 기준 너비 사용
          setScaleFactor(newScaleFactor);
        } else {
          setScaleFactor(1);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode, editingMode]);

  // 반응형 크기 계산
  const shouldUseTransform = isLiveMode; // 모바일 화면에서는 항상 Transform 사용

  const responsiveWidth = shouldUseTransform
    ? `${originalWidth}px` // CSS Transform으로 스케일링하므로 원본 크기 유지
    : `${originalWidth}px`; // 데스크톱 화면에서는 원본 크기

  const responsiveHeight = `${originalHeight}px`;

  return {
    isLiveMode,
    responsiveWidth,
    responsiveHeight,
    scaleFactor,
    shouldUseTransform,
  };
};
