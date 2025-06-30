/**
 * Y.js WebSocket 서버
 * 
 * 협업 기능 테스트를 위한 간단한 WebSocket 서버
 * 실제 프로덕션에서는 더 견고한 서버 구성이 필요합니다.
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const setupWSConnection = require('y-websocket/bin/utils').setupWSConnection;

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 1234;

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server is running!\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = req.url;
  console.log(`새로운 연결: ${url}`);
  
  setupWSConnection(ws, req, {
    // 추가 설정이 필요하면 여기에 추가
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