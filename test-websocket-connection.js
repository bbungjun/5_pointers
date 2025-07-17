const WebSocket = require('ws');

console.log('🔍 Testing WebSocket connections...');

// Test HTTP WebSocket connection
console.log('\n1. Testing ws://localhost:1234');
const ws1 = new WebSocket('ws://localhost:1234');

ws1.on('open', () => {
  console.log('✅ HTTP WebSocket connection successful');
  ws1.close();
});

ws1.on('error', (error) => {
  console.log('❌ HTTP WebSocket connection failed:', error.message);
});

// Test HTTPS WebSocket connection
console.log('\n2. Testing wss://localhost:1235');
const ws2 = new WebSocket('wss://localhost:1235', {
  rejectUnauthorized: false // Accept self-signed certificates
});

ws2.on('open', () => {
  console.log('✅ HTTPS WebSocket connection successful');
  ws2.close();
});

ws2.on('error', (error) => {
  console.log('❌ HTTPS WebSocket connection failed:', error.message);
});

// Test with room path
setTimeout(() => {
  console.log('\n3. Testing with room path: ws://localhost:1234/page:test');
  const ws3 = new WebSocket('ws://localhost:1234/page:test?pageId=test&userId=testuser');
  
  ws3.on('open', () => {
    console.log('✅ Room WebSocket connection successful');
    ws3.close();
  });
  
  ws3.on('error', (error) => {
    console.log('❌ Room WebSocket connection failed:', error.message);
  });
}, 1000);

setTimeout(() => {
  process.exit(0);
}, 3000);
