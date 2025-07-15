/**
 * Y.js WebSocket 서버 (SSL/HTTPS)
 * 
 * 1235 포트에서 HTTPS WebSocket (WSS) 전용 서버
 */

const WebSocketServer = require('ws').Server;
const https = require('https');
const fs = require('fs');
const Y = require('yjs');

// 외부 접근을 위해 0.0.0.0으로 변경
const host = process.env.HOST || '0.0.0.0';
const port = process.env.SSL_PORT || 1235;

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
      process.exit(1);
    }
  }
} catch (error) {
  console.log('❌ SSL 설정 오류:', error.message);
  process.exit(1);
}

if (!httpsOptions) {
  console.log('❌ SSL 인증서가 필요합니다.');
  process.exit(1);
}

// HTTPS 서버 생성
const httpsServer = https.createServer(httpsOptions, (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server (HTTPS/WSS) is running!\n');
});

// HTTPS WebSocket 서버 생성
const wss = new WebSocketServer({ 
  server: httpsServer,
  verifyClient: (info) => {
    console.log('🔍 WSS 연결 시도:', info.origin);
    return true; // 모든 연결 허용
  }
});

// 연결 핸들러 함수
function handleConnection(ws, req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  
  // WebsocketProvider는 URL 경로에 룸 이름을 포함합니다
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomname = 'default';
  
  if (pathSegments.length > 0) {
    roomname = pathSegments[pathSegments.length - 1]; // 마지막 세그먼트가 룸 이름
  }
  
  console.log(`🔄 새로운 WSS 연결: Room ${roomname} (${req.socket.remoteAddress})`);
  
  // 룸별 클라이언트 목록 초기화
  if (!roomClients.has(roomname)) {
    roomClients.set(roomname, new Set());
  }
  
  // 현재 클라이언트를 해당 룸에 추가
  roomClients.get(roomname).add(ws);
  
  // 연결된 클라이언트 수 로깅
  console.log(`📊 Room ${roomname} 현재 WSS 연결 수: ${roomClients.get(roomname).size}`);
  
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
        let broadcastCount = 0;
        currentRoomClients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
            broadcastCount++;
          }
        });
        
        // 디버깅용 로깅 (너무 자주 출력되지 않도록 제한)
        if (broadcastCount > 0 && Math.random() < 0.01) { // 1% 확률로만 로깅
          console.log(`📡 Room ${roomname}: ${broadcastCount}개 WSS 클라이언트에게 메시지 브로드캐스트`);
        }
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 WSS 연결 종료: Room ${roomname} (${req.socket.remoteAddress})`);
    
    // 클라이언트를 룸에서 제거
    const currentRoomClients = roomClients.get(roomname);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      
      console.log(`📊 Room ${roomname} 남은 WSS 연결 수: ${currentRoomClients.size}`);
      
      // 룸에 클라이언트가 없으면 룸 정리
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomname);
        docs.delete(roomname);
        console.log(`🧹 Room ${roomname} WSS 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error(`❌ WSS WebSocket 오류 (Room ${roomname}):`, error);
  });
}

// WebSocket 연결 핸들러 등록
wss.on('connection', (ws, req) => {
  handleConnection(ws, req);
});

// HTTPS 서버 시작
httpsServer.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버 (HTTPS/WSS)가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 외부 접근 가능: https://43.201.125.200:${port}`);
  console.log(`🔒 WSS 연결: wss://43.201.125.200:${port}`);
  
  // 서버 정보 출력
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  
  console.log('\n📡 네트워크 인터페이스 (HTTPS):');
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`  - ${interfaceName}: ${interface.address}:${port}`);
      }
    });
  });
});

console.log('🤝 WSS 협업 기능 테스트를 시작할 수 있습니다!');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 WSS 서버를 종료합니다...');
  
  httpsServer.close(() => {
    console.log('✅ WSS 서버가 종료되었습니다.');
    process.exit(0);
  });
});
