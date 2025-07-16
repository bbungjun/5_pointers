// 프론트엔드 코드에 추가할 디버깅 코드
// 브라우저 콘솔에 붙여넣기

// 현재 환경 정보 출력
console.log('🔍 현재 환경 정보:');
console.log('- 호스트명:', window.location.hostname);
console.log('- 프로토콜:', window.location.protocol);
console.log('- 포트:', window.location.port);
console.log('- HTTPS 여부:', window.location.protocol === 'https:');

// 환경변수 확인 (Vite)
console.log('🔧 환경변수:');
if (typeof import.meta !== 'undefined' && import.meta.env) {
  console.log('- VITE_YJS_WEBSOCKET_URL:', import.meta.env.VITE_YJS_WEBSOCKET_URL);
}

// 수동으로 WebSocket 연결 테스트
function testWebSocketConnection() {
  console.log('🧪 WebSocket 연결 테스트 시작');
  
  // WS 테스트
  const ws = new WebSocket('ws://localhost:1234');
  ws.onopen = () => {
    console.log('✅ WS 연결 성공!');
    ws.close();
  };
  ws.onerror = (error) => {
    console.log('❌ WS 연결 실패');
  };
  
  // 1초 후 WSS 테스트
  setTimeout(() => {
    const wss = new WebSocket('wss://localhost:1235');
    wss.onopen = () => {
      console.log('✅ WSS 연결 성공!');
      wss.close();
    };
    wss.onerror = (error) => {
      console.log('❌ WSS 연결 실패');
    };
  }, 1000);
}

// 테스트 실행
testWebSocketConnection();
