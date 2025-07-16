/**
 * Y.js WebSocket 서버 (CORS 지원 추가)
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const https = require('https');
const fs = require('fs');
const Y = require('yjs');

// 환경 설정
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// 환경별 호스트 및 포트 설정
const host = process.env.HOST || '0.0.0.0'; // 모든 인터페이스에 바인딩
const port = process.env.PORT || 1234;
const httpsPort = process.env.HTTPS_PORT || 1235;

// 환경별 외부 IP 설정
const getExternalIP = () => {
  if (process.env.EXTERNAL_IP) {
    return process.env.EXTERNAL_IP;
  }
  
  if (isProduction) {
    return '43.203.235.108';
  } else {
    return 'localhost';
  }
};

const externalIP = getExternalIP();

console.log(`🌍 환경: ${NODE_ENV}`);
console.log(`🏠 호스트: ${host}`);
console.log(`🌐 외부 IP: ${externalIP}`);

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
  }
} catch (error) {
  console.log('⚠️ SSL 설정 오류:', error.message);
}

// CORS 헤더 추가 함수
const addCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

// HTTP 서버 생성 (CORS 헤더 추가)
const server = http.createServer((req, res) => {
  // CORS 헤더 추가
  addCorsHeaders(res);
  
  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Y.js WebSocket Server (HTTP) is running!\n');
});

// HTTPS 서버 생성 (SSL 인증서가 있는 경우)
let httpsServer = null;
if (httpsOptions) {
  httpsServer = https.createServer(httpsOptions, (req, res) => {
    // CORS 헤더 추가
    addCorsHeaders(res);
    
    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Y.js WebSocket Server (HTTPS) is running!\n');
  });
}

// WebSocket 서버 설정
const wss = new WebSocketServer({ 
  server: server,
  verifyClient: (info) => {
    console.log('🔍 WebSocket 연결 시도:', info.origin);
    return true; // 모든 연결 허용
  }
});

// HTTPS WebSocket 서버 설정
let httpsWss = null;
if (httpsServer) {
  httpsWss = new WebSocketServer({ 
    server: httpsServer,
    verifyClient: (info) => {
      console.log('🔍 WSS 연결 시도:', info.origin);
      return true; // 모든 연결 허용
    }
  });
}

// 연결 처리 함수
const handleConnection = (ws, req, isSecure = false) => {
  const protocol = isSecure ? 'https' : 'http';
  const url = new URL(req.url, `${protocol}://${req.headers.host}`);
  
  // URL에서 룸 이름 추출
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomName = 'default';
  
  if (pathSegments.length > 0) {
    roomName = pathSegments[pathSegments.length - 1];
  }
  
  console.log(`🔄 새로운 연결 (${isSecure ? 'WSS' : 'WS'}): Room ${roomName} (${req.socket.remoteAddress})`);
  
  // 룸별 클라이언트 목록 초기화
  if (!roomClients.has(roomName)) {
    roomClients.set(roomName, new Set());
  }
  
  // 현재 클라이언트를 해당 룸에 추가
  roomClients.get(roomName).add(ws);
  
  // 연결된 클라이언트 수 로깅
  console.log(`📊 Room ${roomName} 현재 연결 수: ${roomClients.get(roomName).size}`);
  
  // Y.js 문서 가져오기 또는 생성
  if (!docs.has(roomName)) {
    docs.set(roomName, new Y.Doc());
  }
  
  // 메시지 핸들러
  ws.on('message', (message) => {
    try {
      // 같은 룸의 다른 클라이언트들에게만 메시지 브로드캐스트
      const currentRoomClients = roomClients.get(roomName);
      if (currentRoomClients) {
        currentRoomClients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`🔌 연결 종료: Room ${roomName} (${req.socket.remoteAddress})`);
    
    // 클라이언트를 룸에서 제거
    const currentRoomClients = roomClients.get(roomName);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      
      console.log(`📊 Room ${roomName} 남은 연결 수: ${currentRoomClients.size}`);
      
      // 룸에 클라이언트가 없으면 룸 정리
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomName);
        docs.delete(roomName);
        console.log(`🧹 Room ${roomName} 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error(`❌ WebSocket 오류 (Room ${roomName}):`, error);
  });
  
  // 연결 성공 응답
  ws.send(JSON.stringify({
    type: 'connection-established',
    roomName: roomName
  }));
};

// HTTP WebSocket 서버 연결 핸들러
wss.on('connection', (ws, req) => {
  handleConnection(ws, req, false);
});

// HTTPS WebSocket 서버 연결 핸들러
if (httpsWss) {
  httpsWss.on('connection', (ws, req) => {
    handleConnection(ws, req, true);
  });
}

// HTTP 서버 시작
server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버 (HTTP)가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 외부 접근 가능: http://${externalIP}:${port}`);
  console.log(`🔗 WS 연결: ws://${externalIP}:${port}`);
  
  console.log(`\n🏠 로컬 개발 환경 접근:`);
  console.log(`   - HTTP: http://localhost:${port}`);
  console.log(`   - WS: ws://localhost:${port}`);
});

// HTTPS 서버 시작
if (httpsServer) {
  httpsServer.listen(httpsPort, host, () => {
    console.log(`🔒 Y.js WebSocket 서버 (HTTPS)가 ${host}:${httpsPort}에서 실행 중입니다`);
    console.log(`🌐 외부 접근 가능: https://${externalIP}:${httpsPort}`);
    console.log(`🔗 WSS 연결: wss://${externalIP}:${httpsPort}`);
    
    console.log(`\n🏠 로컬 개발 환경 HTTPS 접근:`);
    console.log(`   - HTTPS: https://localhost:${httpsPort}`);
    console.log(`   - WSS: wss://localhost:${httpsPort}`);
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
