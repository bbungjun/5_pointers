#!/bin/bash

# Y.js WebSocket 서버 자동 시작 User Data 스크립트
# EC2 인스턴스 시작 시 자동으로 실행됩니다.

# 로그 파일 설정
LOG_FILE="/var/log/yjs-server-setup.log"
exec > >(tee -a $LOG_FILE)
exec 2>&1

echo "=== Y.js WebSocket 서버 설정 시작 $(date) ==="

# 시스템 업데이트
echo "📦 시스템 패키지 업데이트..."
yum update -y

# Node.js 설치 (Amazon Linux 2)
echo "📦 Node.js 설치..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Git 설치
echo "📦 Git 설치..."
yum install -y git

# 작업 디렉토리 생성
echo "📁 작업 디렉토리 생성..."
mkdir -p /opt/yjs-server
cd /opt/yjs-server

# Y.js 서버 파일 생성
echo "📝 Y.js 서버 파일 생성..."
cat > yjs-server.js << 'EOF'
/**
 * Y.js WebSocket 서버
 * 
 * 협업 기능을 위한 WebSocket 서버
 * 다중 기기 간 실시간 협업 지원
 */

const WebSocketServer = require('ws').Server;
const http = require('http');
const Y = require('yjs');

// 외부 접근을 위해 0.0.0.0으로 설정
const host = process.env.HOST || '0.0.0.0';
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
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomname = 'default';
  
  if (pathSegments.length > 0) {
    roomname = pathSegments[pathSegments.length - 1];
  }
  
  console.log(`🔄 새로운 연결: Room ${roomname} (${req.socket.remoteAddress})`);
  
  // 룸별 클라이언트 목록 초기화
  if (!roomClients.has(roomname)) {
    roomClients.set(roomname, new Set());
  }
  
  // 현재 클라이언트를 해당 룸에 추가
  roomClients.get(roomname).add(ws);
  
  console.log(`📊 Room ${roomname} 현재 연결 수: ${roomClients.get(roomname).size}`);
  
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
    
    // 클라이언트를 룸에서 제거
    const currentRoomClients = roomClients.get(roomname);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      
      console.log(`📊 Room ${roomname} 남은 연결 수: ${currentRoomClients.size}`);
      
      // 룸에 클라이언트가 없으면 룸 정리
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomname);
        docs.delete(roomname);
        console.log(`🧹 Room ${roomname} 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket 오류:', error);
  });
});

server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 외부 접근 가능: http://[서버IP]:${port}`);
  console.log('🤝 협업 기능 테스트를 시작할 수 있습니다!');
  
  // 서버 정보 출력
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  
  console.log('\n📡 네트워크 인터페이스:');
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`  - ${interfaceName}: ${interface.address}:${port}`);
      }
    });
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  server.close(() => {
    console.log('✅ 서버가 종료되었습니다.');
    process.exit(0);
  });
});
EOF

# package.json 생성
echo "📝 package.json 생성..."
cat > package.json << 'EOF'
{
  "name": "yjs-websocket-server",
  "version": "1.0.0",
  "description": "Y.js WebSocket server for real-time collaboration",
  "main": "yjs-server.js",
  "scripts": {
    "start": "node yjs-server.js",
    "dev": "nodemon yjs-server.js"
  },
  "dependencies": {
    "yjs": "^13.6.7",
    "ws": "^8.13.0"
  },
  "keywords": ["yjs", "websocket", "collaboration", "real-time"],
  "author": "DdukDdak Team",
  "license": "MIT"
}
EOF

# npm 패키지 설치
echo "📦 npm 패키지 설치..."
npm install

# systemd 서비스 파일 생성
echo "🔧 systemd 서비스 설정..."
cat > /etc/systemd/system/yjs-websocket.service << 'EOF'
[Unit]
Description=Y.js WebSocket Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/yjs-server
ExecStart=/usr/bin/node yjs-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=1234

# 로그 설정
StandardOutput=journal
StandardError=journal
SyslogIdentifier=yjs-websocket

[Install]
WantedBy=multi-user.target
EOF

# 서비스 권한 설정
echo "🔧 서비스 권한 설정..."
chown -R ec2-user:ec2-user /opt/yjs-server

# 서비스 활성화 및 시작
echo "🚀 서비스 활성화 및 시작..."
systemctl daemon-reload
systemctl enable yjs-websocket
systemctl start yjs-websocket

# 서비스 상태 확인
echo "📊 서비스 상태 확인..."
systemctl status yjs-websocket

# 포트 3003도 함께 실행 (기존 설정 호환성)
echo "🔧 포트 3003 서비스 설정..."
cat > /etc/systemd/system/yjs-websocket-3003.service << 'EOF'
[Unit]
Description=Y.js WebSocket Server (Port 3003)
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/opt/yjs-server
ExecStart=/usr/bin/node yjs-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=HOST=0.0.0.0
Environment=PORT=3003

# 로그 설정
StandardOutput=journal
StandardError=journal
SyslogIdentifier=yjs-websocket-3003

[Install]
WantedBy=multi-user.target
EOF

systemctl enable yjs-websocket-3003
systemctl start yjs-websocket-3003

echo "✅ Y.js WebSocket 서버 설정 완료!"
echo "🌐 서버 접근 URL:"
echo "  - http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):1234"
echo "  - http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3003"

# 최종 상태 확인
echo "📊 최종 서비스 상태:"
systemctl status yjs-websocket --no-pager
systemctl status yjs-websocket-3003 --no-pager

echo "=== Y.js WebSocket 서버 설정 완료 $(date) ==="
