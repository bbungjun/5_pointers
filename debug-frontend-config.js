// This simulates what happens in the browser
// Copy this code to your browser console to debug

console.log('🔍 Current browser environment:');
console.log('- hostname:', window.location.hostname);
console.log('- protocol:', window.location.protocol);
console.log('- port:', window.location.port);
console.log('- href:', window.location.href);

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isHttps = window.location.protocol === 'https:';

console.log('🔍 Environment detection:');
console.log('- isLocalhost:', isLocalhost);
console.log('- isHttps:', isHttps);

if (isLocalhost) {
  const localUrl = isHttps ? 'wss://localhost:1235' : 'ws://localhost:1234';
  console.log('🏠 Local WebSocket URL should be:', localUrl);
} else {
  const EC2_WEBSOCKET_IP = '43.203.235.108';
  const prodUrl = isHttps ? `wss://${EC2_WEBSOCKET_IP}:1235` : `ws://${EC2_WEBSOCKET_IP}:1234`;
  console.log('🌍 Production WebSocket URL should be:', prodUrl);
}

// Test WebSocket connection
console.log('🧪 Testing WebSocket connections...');

// Test the correct URL based on protocol
const correctUrl = isHttps ? 'wss://localhost:1235' : 'ws://localhost:1234';
console.log('Trying to connect to:', correctUrl);

const testWs = new WebSocket(correctUrl);
testWs.onopen = () => {
  console.log('✅ WebSocket connection successful!');
  testWs.close();
};
testWs.onerror = (error) => {
  console.log('❌ WebSocket connection failed:', error);
};
testWs.onclose = (event) => {
  console.log('🔌 WebSocket closed:', event.code, event.reason);
};
