
// 환경변수 접근 방식 통합 (Vite + Next.js 호환)
const getEnvVar = (key, defaultValue = '') => {
  try {
    // Vite 환경 (import.meta.env)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    // Next.js 환경 (process.env)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
  } catch (error) {
    console.warn('환경변수 접근 오류:', error);
  }
  return defaultValue;
};

// API 서버 설정 - 환경변수 기반
export const API_BASE_URL = getEnvVar('VITE_API_URL') || getEnvVar('NEXT_PUBLIC_API_URL') || 
  (getEnvVar('NODE_ENV') === 'production' ? 'https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com' : 'http://localhost:3000');

// Y.js WebSocket 서버 설정 - 환경변수 기반
export const YJS_WEBSOCKET_URL = getEnvVar('VITE_YJS_WEBSOCKET_URL') || getEnvVar('NEXT_PUBLIC_YJS_WEBSOCKET_URL') || 
  (getEnvVar('NODE_ENV') === 'production' ? 'wss://demos.yjs.dev' : 'ws://localhost:1234');

// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || '';
export const KAKAO_CLIENT_ID = getEnvVar('VITE_KAKAO_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_KAKAO_CLIENT_ID') || '';

// 리다이렉트 URL - 환경변수 기반
export const getRedirectUrl = (provider) => {
  const frontendUrl = getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173';
  return `${frontendUrl}/${provider}`;
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  websocketUrl: YJS_WEBSOCKET_URL,
  frontend: getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173'
}); 