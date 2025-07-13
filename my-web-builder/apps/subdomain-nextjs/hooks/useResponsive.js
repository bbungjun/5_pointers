import { useState, useEffect } from 'react';

export const useResponsive = (mode = 'live', originalWidth, originalHeight) => {
  const [isLiveMode, setIsLiveMode] = useState(false);
  
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      setIsLiveMode(window.innerWidth <= 768);
      
      const handleResize = () => {
        setIsLiveMode(window.innerWidth <= 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);

  const responsiveWidth = isLiveMode && originalWidth ? `min(${originalWidth}px, 90vw)` : `${originalWidth}px`;
  const responsiveHeight = `${originalHeight}px`;

  return { isLiveMode, responsiveWidth, responsiveHeight };
};