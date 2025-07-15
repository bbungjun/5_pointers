import { useState, useEffect } from 'react';

export const useResponsive = (mode = 'live', originalWidth, originalHeight, editingMode = 'desktop') => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      setIsLiveMode(isMobile);
      
      // 모바일 화면 + 모바일 편집 페이지인 경우에만 스케일링 적용
      if (isMobile && editingMode === 'mobile') {
        const newScaleFactor = window.innerWidth / 375;
        setScaleFactor(newScaleFactor);
      } else {
        setScaleFactor(1);
      }
      
      const handleResize = () => {
        const isMobile = window.innerWidth <= 768;
        setIsLiveMode(isMobile);
        
        // 모바일 화면 + 모바일 편집 페이지인 경우에만 스케일링 적용
        if (isMobile && editingMode === 'mobile') {
          const newScaleFactor = window.innerWidth / 375;
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
  const shouldUseTransform = isLiveMode && editingMode === 'mobile';
  
  const responsiveWidth = shouldUseTransform 
    ? `${originalWidth}px` // CSS Transform으로 스케일링하므로 원본 크기 유지
    : isLiveMode && originalWidth 
    ? `min(${originalWidth}px, 90vw)` // 기존 데스크톱 편집 페이지의 모바일 반응형
    : `${originalWidth}px`; // 데스크톱 화면에서는 원본 크기

  const responsiveHeight = `${originalHeight}px`;

  return { 
    isLiveMode, 
    responsiveWidth, 
    responsiveHeight,
    scaleFactor,
    shouldUseTransform
  };
};