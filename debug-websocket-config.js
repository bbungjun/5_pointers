// Simulate browser environment for testing
global.window = {
  location: {
    hostname: 'localhost',
    protocol: 'http:', // This is key - your frontend is HTTP, not HTTPS
    port: '5173'
  }
};

// Mock the getEnvVar function
const getEnvVar = (key, defaultValue = '') => {
  // No environment variables set
  return defaultValue;
};

// Copy the WebSocket URL logic from your config
const getWebSocketUrl = () => {
  // 환경변수가 있으면 우선 사용
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
    // 로컬 환경: HTTPS면 1235, HTTP면 1234
    const localUrl = isHttps ? 'wss://localhost:1235' : 'ws://localhost:1234';
    console.log('🏠 로컬 WebSocket URL 사용:', localUrl);
    return localUrl;
  } else {
    // 배포 환경: AWS EC2 WebSocket 서버 사용
    // HTTPS면 1235, HTTP면 1234
    const EC2_WEBSOCKET_IP = '43.203.235.108'; // WebSocket 서버 IP
    const prodUrl = isHttps ? `wss://${EC2_WEBSOCKET_IP}:1235` : `ws://${EC2_WEBSOCKET_IP}:1234`;
    console.log('🌍 배포 WebSocket URL 사용:', prodUrl, `(EC2 WebSocket 서버)`);
    return prodUrl;
  }
};

console.log('🧪 Testing WebSocket URL generation...');
const websocketUrl = getWebSocketUrl();
console.log('📍 Final WebSocket URL:', websocketUrl);

// Test what happens with HTTPS
console.log('\n🧪 Testing with HTTPS protocol...');
global.window.location.protocol = 'https:';
const httpsWebsocketUrl = getWebSocketUrl();
console.log('📍 HTTPS WebSocket URL:', httpsWebsocketUrl);
