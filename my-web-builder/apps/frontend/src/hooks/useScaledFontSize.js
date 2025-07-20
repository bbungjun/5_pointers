import { useMemo } from 'react';

// ❗️ 폰트 스케일링 규칙을 이 파일에서 중앙 관리합니다.
const FONT_SCALE_DAMPING_FACTOR = 0.5; // 감쇠 계수 (0.0 ~ 1.0)
const MIN_FONT_SIZE = 14; // 모바일에서 보장할 최소 폰트 크기

export const useScaledFontSize = (
  originalFontSize,
  dynamicScale = 1,
  isMobile = false
) => {
  const scaledFontSize = useMemo(() => {
    const baseSize = originalFontSize || 16;

    // isMobile 플래그에 따라 다른 스케일링 로직 적용
    if (isMobile) {
      // 모바일 뷰: 가독성을 위한 비선형 스케일링 (감쇠 효과)
      const dampenedScale =
        dynamicScale + (1 - dynamicScale) * FONT_SCALE_DAMPING_FACTOR;
      const calculatedSize = baseSize * dampenedScale;
      return Math.max(calculatedSize, MIN_FONT_SIZE);
    } else {
      // 데스크톱 뷰: 다른 요소와 동일한 선형 스케일링
      return baseSize * dynamicScale;
    }
  }, [originalFontSize, dynamicScale, isMobile]);

  return scaledFontSize;
};
