// Next.js 서브도메인 서버용 설정

// 환경변수 접근 함수
const getEnvVar = (key, defaultValue = '') => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// API 기본 URL 설정
export const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://ddukddak.org/api'
    : 'http://localhost:3000/api');

console.log('🔧 SubdomainNextJS Config:', {
  API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

export default {
  API_BASE_URL
};
