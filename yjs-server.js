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

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server is running!\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomname = url.searchParams.get('room') || 'default';
  
  console.log(`새로운 연결: Room ${roomname}`);
  
  // Y.js 문서 가져오기 또는 생성
  if (!docs.has(roomname)) {
    docs.set(roomname, new Y.Doc());
  }
  const doc = docs.get(roomname);
  
  // 클라이언트에게 초기 상태 전송
  const encoder = Y.encoding.createEncoder();
  Y.encoding.writeVarUint(encoder, 0); // sync step 1
  Y.syncProtocol.writeSyncStep1(encoder, doc);
  ws.send(Y.encoding.toUint8Array(encoder));
  
  // 메시지 핸들러
  ws.on('message', (message) => {
    try {
      const uint8Array = new Uint8Array(message);
      const decoder = Y.decoding.createDecoder(uint8Array);
      const messageType = Y.decoding.readVarUint(decoder);
      
      switch (messageType) {
        case 0: // sync
          const syncMessageType = Y.decoding.readVarUint(decoder);
          const encoder = Y.encoding.createEncoder();
          
          if (syncMessageType === 0) {
            // sync step 1
            Y.encoding.writeVarUint(encoder, 0);
            Y.syncProtocol.writeSyncStep2(encoder, doc, decoder);
          } else if (syncMessageType === 1) {
            // sync step 2
            Y.syncProtocol.readSyncStep2(decoder, doc, ws);
          } else if (syncMessageType === 2) {
            // update
            Y.syncProtocol.readUpdate(decoder, doc, ws);
          }
          
          if (Y.encoding.length(encoder) > 1) {
            // 다른 클라이언트들에게 브로드캐스트
            const message = Y.encoding.toUint8Array(encoder);
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === client.OPEN) {
                client.send(message);
              }
            });
          }
          break;
          
        case 1: // awareness
          // awareness 정보를 다른 클라이언트들에게 브로드캐스트
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(uint8Array);
            }
          });
          break;
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`연결 종료: Room ${roomname}`);
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