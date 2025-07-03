/**
 * Y.js WebSocket 서버
 * 
 * 협업 기능 테스트를 위한 간단한 WebSocket 서버
 * 최신 y-websocket 패키지 버전에 맞춰 작성
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const Y = require('yjs');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 1234;

// Y.js 문서 저장소
const docs = new Map();
// 룸별 클라이언트 연결 관리
const roomClients = new Map();

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server is running!\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // WebsocketProvider는 URL 경로에 룸 이름을 포함합니다
  // 예: /page:b53b2ee5-0445-47d0-bab8-1ef795fe65c5
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomname = 'default';
  
  if (pathSegments.length > 0) {
    roomname = pathSegments[pathSegments.length - 1]; // 마지막 세그먼트가 룸 이름
  }
  
  console.log(`새로운 연결: Room ${roomname}`);
  
  // 룸별 클라이언트 목록 초기화
  if (!roomClients.has(roomname)) {
    roomClients.set(roomname, new Set());
  }
  
  // 현재 클라이언트를 해당 룸에 추가
  roomClients.get(roomname).add(ws);
  
  // Y.js 문서 가져오기 또는 생성
  if (!docs.has(roomname)) {
    docs.set(roomname, new Y.Doc());
  }
  const doc = docs.get(roomname);
  
  // 메시지 핸들러
  ws.on('message', (message) => {
    try {
      // 같은 룸의 다른 클라이언트들에게만 메시지 브로드캐스트
      const currentRoomClients = roomClients.get(roomname);
      if (currentRoomClients) {
        currentRoomClients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`연결 종료: Room ${roomname}`);
    
    // 클라이언트를 룸에서 제거
    const currentRoomClients = roomClients.get(roomname);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      
      // 룸에 클라이언트가 없으면 룸 정리
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomname);
        docs.delete(roomname);
        console.log(`Room ${roomname} 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error);
  });
});

server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버가 ${host}:${port}에서 실행 중입니다`);
  console.log('협업 기능 테스트를 시작할 수 있습니다!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
}); 