// API 서버 설정 - 환경변수 기반
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || '';

// 리다이렉트 URL - 환경변수 기반
export const getRedirectUrl = (provider) => {
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
  return `${frontendUrl}/${provider}`;
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  frontend: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'
}); 