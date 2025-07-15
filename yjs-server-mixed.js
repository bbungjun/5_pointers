/**
 * Y.js WebSocket 서버 (Mixed HTTP/HTTPS)
 * 
 * 1234 포트에서 HTTP와 HTTPS를 모두 지원
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

// SSL 인증서 설정 (자체 서명 인증서 생성)
let httpsOptions = null;
try {
  // 자체 서명 인증서가 있는지 확인
  if (fs.existsSync('./server.key') && fs.existsSync('./server.crt')) {
    httpsOptions = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt')
    };
    console.log('✅ SSL 인증서 파일을 찾았습니다.');
  } else {
    console.log('⚠️  SSL 인증서 파일이 없습니다. 자체 서명 인증서를 생성합니다...');
    // 자체 서명 인증서 생성 (개발용)
    const { execSync } = require('child_process');
    try {
      execSync(`openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=KR/ST=Seoul/L=Seoul/O=YJS/CN=43.201.125.200"`);
      httpsOptions = {
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.crt')
      };
      console.log('✅ 자체 서명 인증서가 생성되었습니다.');
    } catch (error) {
      console.log('❌ 자체 서명 인증서 생성 실패:', error.message);
    }
  }
} catch (error) {
  console.log('❌ SSL 설정 오류:', error.message);
}

// HTTP와 HTTPS 서버를 같은 포트에서 실행
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server (HTTP) is running!\n');
});

// HTTPS 서버 (SSL 인증서가 있는 경우)
let httpsServer = null;
if (httpsOptions) {
  httpsServer = https.createServer(httpsOptions, (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Y.js WebSocket Server (HTTPS) is running!\n');
  });
}

// WebSocket 서버들
const wss = new WebSocketServer({ server });
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

wss.on('connection', (ws, req) => {
  handleConnection(ws, req, false);
});

if (httpsWss) {
  httpsWss.on('connection', (ws, req) => {
    handleConnection(ws, req, true);
  });
}

// HTTP 서버 시작
server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버 (HTTP)가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 WS 연결: ws://43.201.125.200:${port}`);
});

// HTTPS 서버를 다른 포트에서 시작
if (httpsServer) {
  const httpsPort = 8443; // 임시로 8443 포트 사용
  httpsServer.listen(httpsPort, host, () => {
    console.log(`🔒 Y.js WebSocket 서버 (HTTPS)가 ${host}:${httpsPort}에서 실행 중입니다`);
    console.log(`🌐 WSS 연결: wss://43.201.125.200:${httpsPort}`);
  });
}

console.log('🤝 협업 기능 테스트를 시작할 수 있습니다!');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  
  const shutdownPromises = [
    new Promise(resolve => server.close(resolve))
  ];
  
  if (httpsServer) {
    shutdownPromises.push(new Promise(resolve => httpsServer.close(resolve)));
  }
  
  Promise.all(shutdownPromises).then(() => {
    console.log('✅ 모든 서버가 종료되었습니다.');
    process.exit(0);
  });
});
