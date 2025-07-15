#!/bin/bash

# 원격 y-js 서버 설정 스크립트
# SSH를 통해 원격 서버에 y-js 서버를 설정합니다.

SERVER_IP="43.201.125.200"
KEY_PATH="jungle-servers-key.pem"  # SSH 키 경로 (실제 경로로 수정 필요)

echo "🚀 원격 y-js 서버 설정을 시작합니다..."
echo "📡 서버 IP: $SERVER_IP"

# SSH 연결 테스트
echo "🔍 SSH 연결 테스트..."
if ! ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no ec2-user@$SERVER_IP "echo 'SSH 연결 성공'"; then
    echo "❌ SSH 연결 실패. 다음을 확인해주세요:"
    echo "  1. SSH 키 파일 경로: $KEY_PATH"
    echo "  2. 보안 그룹에서 SSH(22) 포트 허용"
    echo "  3. 서버 상태 확인"
    exit 1
fi

echo "✅ SSH 연결 성공!"

# 원격 서버에 y-js 서버 설정
echo "📦 원격 서버에 y-js 서버 설정 중..."

ssh -i "$KEY_PATH" ec2-user@$SERVER_IP << 'ENDSSH'
#!/bin/bash

echo "=== 원격 y-js 서버 설정 시작 ==="

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "📦 Node.js 설치..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

echo "📋 Node.js 버전: $(node --version)"
echo "📋 npm 버전: $(npm --version)"

# 작업 디렉토리 생성
mkdir -p ~/yjs-server
cd ~/yjs-server

# Y.js 서버 파일 생성
echo "📝 Y.js 서버 파일 생성..."
cat > yjs-server.js << 'EOF'
const WebSocketServer = require('ws').Server;
const http = require('http');
const Y = require('yjs');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 1234;

const docs = new Map();
const roomClients = new Map();

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' });
  response.end('Y.js WebSocket Server is running!\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathSegments = url.pathname.split('/').filter(segment => segment);
  let roomname = 'default';
  
  if (pathSegments.length > 0) {
    roomname = pathSegments[pathSegments.length - 1];
  }
  
  console.log(`🔄 새로운 연결: Room ${roomname} (${req.socket.remoteAddress})`);
  
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
    console.log(`🔌 연결 종료: Room ${roomname}`);
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
    console.error('❌ WebSocket 오류:', error);
  });
});

server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버가 ${host}:${port}에서 실행 중입니다`);
  console.log(`🌐 외부 접근 가능: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):${port}`);
  console.log('🤝 협업 기능 테스트를 시작할 수 있습니다!');
});

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
    "start": "node yjs-server.js"
  },
  "dependencies": {
    "yjs": "^13.6.7",
    "ws": "^8.13.0"
  }
}
EOF

# npm 패키지 설치
echo "📦 npm 패키지 설치..."
npm install

# 기존 프로세스 종료
echo "🔄 기존 프로세스 종료..."
pkill -f "node yjs-server.js" || true

# 백그라운드에서 서버 시작
echo "🚀 Y.js 서버 시작..."
nohup node yjs-server.js > yjs-server.log 2>&1 &

# 잠시 대기 후 상태 확인
sleep 3
if pgrep -f "node yjs-server.js" > /dev/null; then
    echo "✅ Y.js 서버가 성공적으로 시작되었습니다!"
    echo "📊 프로세스 ID: $(pgrep -f 'node yjs-server.js')"
else
    echo "❌ Y.js 서버 시작 실패"
    echo "📋 로그 확인:"
    tail -10 yjs-server.log
fi

echo "=== 원격 y-js 서버 설정 완료 ==="
ENDSSH

echo "✅ 원격 서버 설정 완료!"
echo "🌐 서버 접근 URL: http://$SERVER_IP:1234"
echo "📊 서버 상태 확인: ssh -i $KEY_PATH ec2-user@$SERVER_IP 'pgrep -f \"node yjs-server.js\"'"
