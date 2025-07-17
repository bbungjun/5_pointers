const WebSocket = require('ws');

// 연결 테스트 함수
function testConnection(url) {
  console.log(`🔄 연결 시도: ${url}`);
  
  const ws = new WebSocket(url);
  
  ws.on('open', () => {
    console.log(`✅ 연결 성공: ${url}`);
    
    // 간단한 메시지 전송
    const message = JSON.stringify({
      type: 'test',
      data: { message: 'Hello from test client' }
    });
    
    ws.send(message);
    console.log(`📤 메시지 전송: ${message}`);
    
    // 5초 후 연결 종료
    setTimeout(() => {
      ws.close();
      console.log(`🔌 연결 종료: ${url}`);
    }, 5000);
  });
  
  ws.on('message', (data) => {
    console.log(`📥 메시지 수신: ${data}`);
  });
  
  ws.on('error', (error) => {
    console.error(`❌ 연결 오류: ${url}`, error.message);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔌 연결 종료: ${url} (코드: ${code}, 이유: ${reason || 'none'})`);
  });
}

// 기본 연결 테스트
testConnection('ws://localhost:1234');

// 룸 연결 테스트
setTimeout(() => {
  const roomId = 'test-room-' + Math.floor(Math.random() * 1000);
  testConnection(`ws://localhost:1234/page:${roomId}?pageId=${roomId}&userId=test-user`);
}, 2000);

// 5초마다 연결 상태 확인
let count = 0;
const interval = setInterval(() => {
  count++;
  console.log(`⏱️ ${count * 5}초 경과`);
  
  if (count >= 3) {
    clearInterval(interval);
    console.log('🏁 테스트 완료');
    setTimeout(() => process.exit(0), 1000);
  }
}, 5000);
