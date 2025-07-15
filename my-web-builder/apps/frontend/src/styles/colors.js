// 핑크-보라 계열 색상 팔레트
export const colors = {
  // 메인 브랜드 색상
  primary: {
    50: '#fdf2f8',   // 매우 연한 핑크
    100: '#fce7f3',  // 연한 핑크
    200: '#fbcfe8',  // 밝은 핑크
    300: '#f9a8d4',  // 핑크
    400: '#f472b6',  // 진한 핑크
    500: '#ec4899',  // 메인 핑크
    600: '#db2777',  // 어두운 핑크
    700: '#be185d',  // 매우 어두운 핑크
    800: '#9d174d',  // 딥 핑크
    900: '#831843',  // 가장 어두운 핑크
  },
  
  // 보조 보라 색상
  secondary: {
    50: '#faf5ff',   // 매우 연한 보라
    100: '#f3e8ff',  // 연한 보라
    200: '#e9d5ff',  // 밝은 보라
    300: '#d8b4fe',  // 보라
    400: '#c084fc',  // 진한 보라
    500: '#a855f7',  // 메인 보라
    600: '#9333ea',  // 어두운 보라
    700: '#7c3aed',  // 매우 어두운 보라
    800: '#6b21a8',  // 딥 보라
    900: '#581c87',  // 가장 어두운 보라
  },
  
  // 그라데이션
  gradient: {
    primary: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    light: 'linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%)',
    dark: 'linear-gradient(135deg, #be185d 0%, #7c3aed 100%)',
  },
  
  // 중성 색상
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 상태 색상 (핑크-보라 톤에 맞춤)
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// CSS 변수로 내보내기
export const cssVariables = `
  :root {
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};
    
    --color-secondary-50: ${colors.secondary[50]};
    --color-secondary-100: ${colors.secondary[100]};
    --color-secondary-200: ${colors.secondary[200]};
    --color-secondary-300: ${colors.secondary[300]};
    --color-secondary-400: ${colors.secondary[400]};
    --color-secondary-500: ${colors.secondary[500]};
    --color-secondary-600: ${colors.secondary[600]};
    --color-secondary-700: ${colors.secondary[700]};
    --color-secondary-800: ${colors.secondary[800]};
    --color-secondary-900: ${colors.secondary[900]};
    
    --gradient-primary: ${colors.gradient.primary};
    --gradient-light: ${colors.gradient.light};
    --gradient-dark: ${colors.gradient.dark};
  }
`;

export default colors;
