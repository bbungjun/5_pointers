/**
 * Y.js WebSocket 서버 (도메인 SSL 지원)
 * 
 * 1234 포트에서 HTTP/WS와 1235 포트에서 HTTPS/WSS를 지원
 * 도메인 SSL 인증서 우선 사용
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const https = require('https');
const fs = require('fs');
const Y = require('yjs');

// 환경 설정
const NODE_ENV = process.env.NODE_ENV || 'production';
const isProduction = NODE_ENV === 'production';

// 환경별 호스트 및 포트 설정
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 1234;
const httpsPort = process.env.HTTPS_PORT || 1235;

// 도메인 설정
const DOMAIN = process.env.DOMAIN || 'ws.ddukddak.org';

// 환경별 외부 IP/도메인 설정
const getExternalAddress = () => {
  if (process.env.EXTERNAL_IP) {
    return process.env.EXTERNAL_IP;
  }
  
  if (isProduction) {
    return DOMAIN; // 프로덕션에서는 도메인 사용
  } else {
    return 'localhost';
  }
};

const externalAddress = getExternalAddress();

console.log(`🌍 환경: ${NODE_ENV}`);
console.log(`🏠 호스트: ${host}`);
console.log(`🌐 외부 주소: ${externalAddress}`);
console.log(`🔗 도메인: ${DOMAIN}`);

// Y.js 문서 저장소
const docs = new Map();
// 룸별 클라이언트 연결 관리
const roomClients = new Map();

// SSL 인증서 설정 (도메인 인증서 우선)
let httpsOptions = null;

const sslCertPaths = [
  // 1. 도메인 SSL 인증서 (Let's Encrypt)
  {
    key: './ws-ddukddak-org.key',
    cert: './ws-ddukddak-org.crt',
    name: '도메인 SSL 인증서 (Let\'s Encrypt)'
  },
  // 2. 자체 서명 인증서 (백업)
  {
    key: './server.key',
    cert: './server.crt',
    name: '자체 서명 인증서'
  }
];

// SSL 인증서 로드 시도
for (const certPath of sslCertPaths) {
  try {
    if (fs.existsSync(certPath.key) && fs.existsSync(certPath.cert)) {
      httpsOptions = {
        key: fs.readFileSync(certPath.key),
        cert: fs.readFileSync(certPath.cert)
      };
      console.log(`✅ ${certPath.name}을 찾았습니다.`);
      break;
    }
  } catch (error) {
    console.log(`⚠️  ${certPath.name} 로드 실패:`, error.message);
  }
}

// SSL 인증서가 없는 경우 자체 서명 인증서 생성
if (!httpsOptions && isProduction) {
  console.log('⚠️  SSL 인증서 파일이 없습니다. 자체 서명 인증서를 생성합니다...');
  const { execSync } = require('child_process');
  try {
    execSync(`openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=KR/ST=Seoul/L=Seoul/O=YJS/CN=${DOMAIN}"`);
    httpsOptions = {
      key: fs.readFileSync('./server.key'),
      cert: fs.readFileSync('./server.crt')
    };
    console.log('✅ 자체 서명 인증서가 생성되었습니다.');
  } catch (error) {
    console.log('❌ 자체 서명 인증서 생성 실패:', error.message);
  }
}

// HTTP 서버 생성
const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server (HTTP) is running!\n');
});

// HTTPS 서버 생성 (SSL 인증서가 있는 경우)
let httpsServer = null;
if (httpsOptions) {
  httpsServer = https.createServer(httpsOptions, (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Y.js WebSocket Server (HTTPS) is running!\n');
  });
}

// WebSocket 서버 생성
const wss = new WebSocketServer({ 
  server: server,
  verifyClient: (info) => {
    console.log('🔍 WebSocket 연결 시도:', info.origin);
    return true;
  }
});

// HTTPS WebSocket 서버 생성
let httpsWss = null;
if (httpsServer) {
  httpsWss = new WebSocketServer({ 
    server: httpsServer,
    verifyClient: (info) => {
      console.log('🔍 WSS 연결 시도:', info.origin);
      return true;
    }
  });
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
  const doc = docs.get(roomname);
  
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

// WebSocket 연결 핸들러 등록
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
  console.log(`🌐 외부 접근 가능: http://${externalAddress}:${port}`);
  console.log(`🔗 WS 연결: ws://${externalAddress}:${port}`);
});

// HTTPS 서버 시작
if (httpsServer) {
  httpsServer.listen(httpsPort, host, () => {
    console.log(`🔒 Y.js WebSocket 서버 (HTTPS)가 ${host}:${httpsPort}에서 실행 중입니다`);
    console.log(`🌐 외부 접근 가능: https://${externalAddress}:${httpsPort}`);
    console.log(`🔗 WSS 연결: wss://${externalAddress}:${httpsPort}`);
    console.log(`💡 도메인 SSL 인증서로 보안 연결 제공`);
    
    if (isProduction) {
      console.log(`\n🌍 프로덕션 환경 접근:`);
      console.log(`   - HTTPS: https://${DOMAIN}:${httpsPort}`);
      console.log(`   - WSS: wss://${DOMAIN}:${httpsPort}`);
    }
  });
}

console.log('🤝 협업 기능이 준비되었습니다!');

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
