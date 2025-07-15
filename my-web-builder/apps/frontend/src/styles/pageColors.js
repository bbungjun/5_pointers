// 페이지 상태별 색상 정의
export const pageColors = {
  // 제작중 페이지 - 연한 보라색 계열
  draft: {
    primary: 'purple-300',
    secondary: 'purple-400',
    background: 'purple-50',
    backgroundHover: 'purple-100',
    border: 'purple-200',
    text: 'purple-700',
    textLight: 'purple-600',
    gradient: 'from-purple-300 to-purple-400',
    backgroundGradient: 'from-purple-50 to-purple-100',
    backgroundGradientHover: 'from-purple-100 to-purple-200',
  },
  
  // 배포된 페이지 - 진한 보라색 계열
  deployed: {
    primary: 'purple-500',
    secondary: 'purple-600',
    background: 'purple-100',
    backgroundHover: 'purple-200',
    border: 'purple-300',
    text: 'purple-700',
    textLight: 'purple-600',
    gradient: 'from-purple-500 to-purple-600',
    backgroundGradient: 'from-purple-100 to-purple-200',
    backgroundGradientHover: 'from-purple-200 to-purple-300',
  }
};

// CSS 클래스 생성 헬퍼
export const getPageColorClasses = (status) => {
  const colors = status === 'deployed' ? pageColors.deployed : pageColors.draft;
  
  return {
    badge: `bg-${colors.background} text-${colors.text}`,
    icon: `bg-gradient-to-r from-${colors.primary} to-${colors.secondary}`,
    card: `bg-gradient-to-r ${colors.backgroundGradient} border border-${colors.border}`,
    cardHover: `hover:${colors.backgroundGradientHover}`,
    dot: `bg-${colors.primary} border-${colors.secondary}`,
    text: `text-${colors.text}`,
    textLight: `text-${colors.textLight}`,
  };
};

export default pageColors;
