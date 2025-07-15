/**
 * Y.js WebSocket 서버 (Dual Protocol)
 * 
 * 1234 포트에서 HTTP와 HTTPS WebSocket을 모두 지원
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const https = require('https');
const fs = require('fs');
const Y = require('yjs');

// 외부 접근을 위해 0.0.0.0으로 변경
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 1234;

// Y.js 문서 저장소
const docs = new Map();
// 룸별 클라이언트 연결 관리
const roomClients = new Map();

// SSL 인증서 설정
let httpsOptions = null;
try {
  if (fs.existsSync('./server.key') && fs.existsSync('./server.crt')) {
    httpsOptions = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt')
    };
    console.log('✅ SSL 인증서 파일을 찾았습니다.');
  } else {
    console.log('⚠️  SSL 인증서 생성 중...');
    const { execSync } = require('child_process');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=KR/ST=Seoul/L=Seoul/O=YJS/CN=43.201.125.200"`);
      httpsOptions = {
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.crt')
      };
      console.log('✅ 자체 서명 인증서가 생성되었습니다.');
    } catch (error) {
      console.log('❌ SSL 인증서 생성 실패:', error.message);
    }
  }
} catch (error) {
  console.log('❌ SSL 설정 오류:', error.message);
}

// HTTP 서버
const httpServer = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server (HTTP) is running!\n');
});

// HTTPS 서버 (같은 포트에서 실행하기 위해 다른 방식 사용)
let httpsServer = null;
if (httpsOptions) {
  httpsServer = https.createServer(httpsOptions, (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Y.js WebSocket Server (HTTPS) is running!\n');
  });
}

// WebSocket 서버들
const httpWss = new WebSocketServer({ server: httpServer });
let httpsWss = null;
if (httpsServer) {
  httpsWss = new WebSocketServer({ server: httpsServer });
}

// 공통 연결 핸들러 함수
function handleConnection(ws, req, isSecure = false) {
  const protocol = isSecure ? 'https' : 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomname = 'default';
  
  if (pathSegments.length > 0) {
    roomname = pathSegments[pathSegments.length - 1];
  }
  
  console.log(`🔄 새로운 연결 (${isSecure ? 'WSS' : 'WS'}): Room ${roomname} (${req.socket.remoteAddress})`);
  
  if (!roomClients.has(roomname)) {
    roomClients.set(roomname, new Set());
  }
  
  roomClients.get(roomname).add(ws);
  console.log(`📊 Room ${roomname} 현재 연결 수: ${roomClients.get(roomname).size}`);
  
  if (!docs.has(roomname)) {
    docs.set(roomname, new Y.Doc());
  }
  
  ws.on('message', (message) => {
    try {
      const currentRoomClients = roomClients.get(roomname);
      if (currentRoomClients) {
        let broadcastCount = 0;
        currentRoomClients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
            broadcastCount++;
          }
        });
        
        if (broadcastCount > 0 && Math.random() < 0.01) {
          console.log(`📡 Room ${roomname}: ${broadcastCount}개 클라이언트에게 메시지 브로드캐스트`);
        }
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 연결 종료: Room ${roomname} (${req.socket.remoteAddress})`);
    
    const currentRoomClients = roomClients.get(roomname);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      console.log(`📊 Room ${roomname} 남은 연결 수: ${currentRoomClients.size}`);
      
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomname);
        docs.delete(roomname);
        console.log(`🧹 Room ${roomname} 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error(`❌ WebSocket 오류 (Room ${roomname}):`, error);
  });
}

// 연결 핸들러 등록
httpWss.on('connection', (ws, req) => {
  handleConnection(ws, req, false);
});

if (httpsWss) {
  httpsWss.on('connection', (ws, req) => {
    handleConnection(ws, req, true);
  });
}

// 서버 시작
httpServer.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버 (HTTP)가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 WS 연결: ws://43.201.125.200:${port}`);
});

// HTTPS 서버를 1234 포트에서 함께 실행 (프록시 방식)
if (httpsServer && httpsOptions) {
  // 1234 포트에서 HTTPS도 처리하기 위해 TLS SNI 사용
  const tls = require('tls');
  
  // TLS 서버 생성 (1234 포트에서 HTTPS 처리)
  const tlsServer = tls.createServer(httpsOptions, (socket) => {
    // HTTPS 요청을 httpsServer로 전달
    httpsServer.emit('connection', socket);
  });
  
  // 1234 포트에서 HTTP와 HTTPS를 모두 처리
  const net = require('net');
  const server = net.createServer((socket) => {
    socket.once('data', (buffer) => {
      // TLS handshake 확인
      const firstByte = buffer[0];
      
      socket.pause();
      
      if (firstByte === 22) { // TLS handshake
        console.log('🔒 HTTPS 연결 감지');
        tlsServer.emit('connection', socket);
      } else { // HTTP
        console.log('🌐 HTTP 연결 감지');
        httpServer.emit('connection', socket);
      }
      
      socket.unshift(buffer);
      socket.resume();
    });
  });
  
  // 기존 HTTP 서버 종료하고 새 서버 시작
  httpServer.close(() => {
    server.listen(port, host, () => {
      console.log(`🔄 Y.js 듀얼 프로토콜 서버가 ${host}:${port}에서 실행 중입니다`);
      console.log(`🌐 WS 연결: ws://43.201.125.200:${port}`);
      console.log(`🔒 WSS 연결: wss://43.201.125.200:${port}`);
    });
  });
}

console.log('🤝 협업 기능 테스트를 시작할 수 있습니다!');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  process.exit(0);
});
