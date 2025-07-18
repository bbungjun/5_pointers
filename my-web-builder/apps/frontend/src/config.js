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

// 프로덕션 환경 감지 함수 (API_BASE_URL 설정 전에 정의)
const isProductionEnvironment = () => {
  // 2. URL 기반 감지 (브라우저에서 가장 확실한 방법)
  const currentUrl = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentPort = typeof window !== 'undefined' ? window.location.port : '';
  const isLocalhost = currentUrl === 'localhost' || currentUrl === '127.0.0.1';
  
  console.log('🔍 환경 감지 상세:', {
    currentUrl,
    currentPort,
    isLocalhost
  });
  
  // localhost인 경우 무조건 개발 환경으로 처리
  if (isLocalhost) {
    console.log('✅ 로컬 환경으로 감지됨 - 개발 모드 활성화');
    return false;
  }
  
  // 1. 명시적 환경변수 확인
  const viteMode = getEnvVar('VITE_MODE');
  const nodeEnv = getEnvVar('NODE_ENV');
  const isS3Domain = currentUrl.includes('s3-website') || currentUrl.includes('amazonaws.com');
  const isDdukddakDomain = currentUrl.includes('ddukddak.org');
  const isCloudFrontDomain = currentUrl.includes('cloudfront.net');
  const isProductionIP = currentUrl === '3.35.227.214'; // 프론트엔드 배포 IP
  
  const isProd = viteMode === 'production' || nodeEnv === 'production' || isS3Domain || isDdukddakDomain || isCloudFrontDomain || isProductionIP;
  console.log('🌍 환경 감지 결과:', isProd ? '프로덕션' : '개발');
  return isProd;
};

// 로컬 네트워크 IP 주소 감지 함수
const getLocalNetworkIP = () => {
  try {
    // 브라우저에서 현재 페이지의 호스트명을 사용
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // localhost인 경우 WSL IP 주소 사용 (WSL 환경에서 협업을 위해)
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '172.30.74.11'; // WSL IP 주소
      }
      
      // 실제 IP 주소인 경우 그대로 사용
      return hostname;
    }
  } catch (error) {
    console.warn('로컬 네트워크 IP 감지 실패:', error);
  }
  return '172.30.74.11'; // WSL IP 주소로 기본값 변경
};

// API 서버 설정 - 환경변수 기반
export const API_BASE_URL = getEnvVar('VITE_API_URL') || getEnvVar('VITE_API_BASE_URL') || getEnvVar('NEXT_PUBLIC_API_URL') || 
  (isProductionEnvironment() ? 'https://ddukddak.org/' : 'http://localhost:3000/');

// Y.js WebSocket 서버 설정 - 환경별 분기 (명확한 로컬 우선)
const getWebSocketUrl = () => {
  // 환경변수가 있으면 우선 사용 (도메인 기반 우선)
  const envUrl = getEnvVar('VITE_YJS_WEBSOCKET_URL') || getEnvVar('VITE_WEBSOCKET_URL') || getEnvVar('NEXT_PUBLIC_YJS_WEBSOCKET_URL');
  if (envUrl) {
    console.log('🔧 환경변수에서 WebSocket URL 사용:', envUrl);
    return envUrl;
  }
  
  // 현재 호스트 기반으로 결정
  const currentUrl = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
  const isLocalhost = currentUrl === 'localhost' || currentUrl === '127.0.0.1';
  const isHttps = currentProtocol === 'https:';
  
  console.log('🔍 환경 감지:', {
    currentUrl,
    currentProtocol,
    isLocalhost,
    isHttps
  });
  
  if (isLocalhost) {
    // 로컬 환경: WSS 연결 사용 (SSL 보안)
    // WSL 환경에서는 WSL IP 사용
    const localIP = getLocalNetworkIP();
    const localUrl = `wss://${localIP}:1235`;
    console.log('🔒 로컬 WSS URL 설정 (SSL 보안):', localUrl);
    console.log('💡 WSL 환경에서 WSL IP 사용:', localIP);
    return localUrl;
  } else {
    // 배포 환경: 도메인 기반 WebSocket 서버 사용
    // HTTPS면 WSS, HTTP면 WS
    const WEBSOCKET_DOMAIN = 'ws.ddukddak.org'; // Y.js WebSocket 서버 도메인
    const prodUrl = isHttps ? `wss://${WEBSOCKET_DOMAIN}:1235` : `ws://${WEBSOCKET_DOMAIN}:1234`;
    console.log('🌍 배포 WebSocket URL 사용:', prodUrl, `(도메인 기반)`);
    return prodUrl;
  }
};

export const YJS_WEBSOCKET_URL = getWebSocketUrl();


// 소셜 로그인 설정
export const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || '';
export const KAKAO_CLIENT_ID = getEnvVar('VITE_KAKAO_CLIENT_ID') || getEnvVar('NEXT_PUBLIC_KAKAO_CLIENT_ID') || '';

// 리다이렉트 URL - 환경변수 기반
export const getRedirectUrl = (provider) => {
  const frontendUrl = getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 
    (isProductionEnvironment() ? 'https://ddukddak.org' : 'http://localhost:5173');
  return `${frontendUrl}/social-callback?provider=${provider}`;
};

// 배포 URL 생성 함수 (API 엔드포인트 기반으로 변경)
export const getDeployedUrl = (subdomain) => {
  const isProduction = isProductionEnvironment();
  
  console.log('🚀 getDeployedUrl 호출:', {
    subdomain,
    isProduction,
    currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });
  
  if (isProduction) {
    // 프로덕션: CloudFront 우회하여 백엔드 API 직접 접근
    const url = `https://ddukddak.org/api/generator/deployed-sites/${subdomain}`;
    console.log('✅ 프로덕션 URL 생성 (API 엔드포인트 기반):', url);
    return url;
  } else {
    // 로컬: 와일드카드 서브도메인 서버 사용
    const url = `http://${subdomain}.localhost:3001`;
    console.log('🏠 로컬 URL 생성 (와일드카드 서브도메인):', url);
    return url;
  }
};

console.log('🔧 API 설정:', {
  baseUrl: API_BASE_URL,
  websocketUrl: YJS_WEBSOCKET_URL,
  frontend: getEnvVar('VITE_FRONTEND_URL') || getEnvVar('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:5173',
  isProduction: isProductionEnvironment(),
  currentHostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
});

// WebSocket URL 디버깅을 위한 추가 로깅
console.log('🔍 WebSocket URL 디버깅:', {
  YJS_WEBSOCKET_URL,
  getWebSocketUrl: getWebSocketUrl(),
  currentUrl: typeof window !== 'undefined' ? window.location.hostname : 'server',
  isLocalhost: typeof window !== 'undefined' ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') : false,
  // 환경변수 직접 확인
  VITE_YJS_WEBSOCKET_URL: getEnvVar('VITE_YJS_WEBSOCKET_URL'),
  VITE_WEBSOCKET_URL: getEnvVar('VITE_WEBSOCKET_URL'),
  NEXT_PUBLIC_YJS_WEBSOCKET_URL: getEnvVar('NEXT_PUBLIC_YJS_WEBSOCKET_URL'),
  // 모든 환경변수 확인 (개발용)
  allEnvVars: typeof window !== 'undefined' ? Object.keys(window).filter(key => key.startsWith('VITE_')).reduce((acc, key) => {
    acc[key] = window[key];
    return acc;
  }, {}) : 'server-side'
}); // Cache bust: Fri Jul 18 19:00:00 KST 2025 - Force deployment
