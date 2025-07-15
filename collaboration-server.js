/**
 * 5Pointers 협업 서버
 * Y.js 기반 실시간 협업 기능
 */

const WebSocket = require('ws');
const http = require('http');
const Y = require('yjs');

// 서버 설정
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 1234;

console.log('🚀 5Pointers 협업 서버 시작...');

// 데이터 저장소
const rooms = new Map(); // roomId -> { doc: Y.Doc, clients: Set<WebSocket>, components: [], users: [] }
const clientRooms = new Map(); // WebSocket -> roomId
const clientUsers = new Map(); // WebSocket -> userInfo

// 룸 관리 함수
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    const clients = new Set();
    const components = [];
    const users = [];
    rooms.set(roomId, { clients, components, users });
    console.log(`📄 새 룸 생성: ${roomId}`);
  }
  return rooms.get(roomId);
}

function addClientToRoom(ws, roomId, userInfo) {
  const room = getOrCreateRoom(roomId);
  room.clients.add(ws);
  clientRooms.set(ws, roomId);
  
  if (userInfo) {
    clientUsers.set(ws, userInfo);
    // 기존 사용자 제거 후 새로 추가
    room.users = room.users.filter(u => u.id !== userInfo.id);
    room.users.push(userInfo);
  }
  
  console.log(`👤 클라이언트가 룸 ${roomId}에 참여 (총 ${room.clients.size}명)`);
  
  // 사용자 목록 브로드캐스트
  broadcastToRoom(roomId, JSON.stringify({
    type: 'user-list',
    users: room.users
  }), null);
}

function removeClientFromRoom(ws) {
  const roomId = clientRooms.get(ws);
  const userInfo = clientUsers.get(ws);
  
  if (roomId && rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.clients.delete(ws);
    clientRooms.delete(ws);
    clientUsers.delete(ws);
    
    if (userInfo) {
      room.users = room.users.filter(u => u.id !== userInfo.id);
    }
    
    console.log(`👤 클라이언트가 룸 ${roomId}에서 나감 (남은 ${room.clients.size}명)`);
    
    // 사용자 목록 업데이트 브로드캐스트
    if (room.clients.size > 0) {
      broadcastToRoom(roomId, JSON.stringify({
        type: 'user-list',
        users: room.users
      }), null);
    }
    
    // 룸이 비어있으면 정리
    if (room.clients.size === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ 빈 룸 삭제: ${roomId}`);
    }
  }
}

function broadcastToRoom(roomId, message, sender) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  let sentCount = 0;
  room.clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
        room.clients.delete(client);
      }
    }
  });
  
  if (sentCount > 0) {
    console.log(`📤 룸 ${roomId}에 메시지 브로드캐스트 (${sentCount}명)`);
  }
}

// HTTP 서버
const server = http.createServer((req, res) => {
  // CORS 헤더 추가
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  res.writeHead(200, { 
    'Content-Type': 'application/json'
  });
  
  const status = {
    status: 'running',
    server: '5Pointers Collaboration Server',
    rooms: rooms.size,
    totalClients: Array.from(rooms.values()).reduce((sum, room) => sum + room.clients.size, 0),
    timestamp: new Date().toISOString()
  };
  
  res.end(JSON.stringify(status, null, 2));
});

// WebSocket 서버 - 더 명시적인 설정
const wss = new WebSocket.Server({ 
  server,
  perMessageDeflate: false,
  clientTracking: true
});

wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🔗 새 연결: ${clientIP}`);
  
  // URL에서 룸 ID 추출
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const roomId = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'default';
  
  console.log(`📍 룸 ID: ${roomId}`);
  
  // 클라이언트를 룸에 추가 (사용자 정보는 나중에 받음)
  addClientToRoom(ws, roomId, null);
  
  // 즉시 연결 확인 메시지 전송
  try {
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      roomId: roomId,
      timestamp: Date.now()
    }));
    console.log(`✅ 연결 확인 메시지 전송: ${roomId}`);
  } catch (error) {
    console.error('❌ 연결 확인 메시지 전송 실패:', error);
  }
  
  // 메시지 처리
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📨 메시지 수신 (${roomId}):`, message.type);
      
      switch (message.type) {
        case 'user-join':
          // 사용자 정보 업데이트
          const room = rooms.get(roomId);
          if (room && message.user) {
            clientUsers.set(ws, message.user);
            // 기존 사용자 제거 후 새로 추가
            room.users = room.users.filter(u => u.id !== message.user.id);
            room.users.push(message.user);
            
            console.log(`👤 사용자 참여: ${message.user.name} (${roomId})`);
            
            // 사용자 목록 브로드캐스트
            broadcastToRoom(roomId, JSON.stringify({
              type: 'user-list',
              users: room.users
            }), null);
            
            // 현재 컴포넌트 상태 전송
            if (room.components.length > 0) {
              ws.send(JSON.stringify({
                type: 'components-update',
                components: room.components
              }));
            }
          }
          break;
          
        case 'components-update':
          // 컴포넌트 업데이트
          const updateRoom = rooms.get(roomId);
          if (updateRoom && message.components) {
            updateRoom.components = message.components;
            console.log(`📝 컴포넌트 업데이트: ${message.components.length}개 (${roomId})`);
            
            // 다른 클라이언트들에게 브로드캐스트
            broadcastToRoom(roomId, JSON.stringify({
              type: 'components-update',
              components: message.components,
              userId: message.userId
            }), ws);
          }
          break;
          
        case 'cursor-update':
          // 커서 위치 브로드캐스트
          broadcastToRoom(roomId, JSON.stringify({
            type: 'cursor-update',
            cursor: message.cursor,
            userId: message.userId
          }), ws);
          break;
          
        case 'ping':
          // 핑 응답
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        default:
          console.log(`❓ 알 수 없는 메시지 타입: ${message.type}`);
      }
    } catch (error) {
      console.error('❌ 메시지 처리 오류:', error);
    }
  });
  
  // 연결 종료 처리
  ws.on('close', (code, reason) => {
    console.log(`❌ 연결 종료: ${clientIP} (코드: ${code}, 이유: ${reason})`);
    removeClientFromRoom(ws);
  });
  
  // 오류 처리
  ws.on('error', (error) => {
    console.error(`❌ WebSocket 오류 (${clientIP}):`, error);
    removeClientFromRoom(ws);
  });
});

// 서버 시작
server.listen(PORT, HOST, () => {
  console.log(`✅ 협업 서버 실행 중: ${HOST}:${PORT}`);
  console.log(`🌐 WebSocket: ws://${HOST}:${PORT}`);
  console.log(`🌐 HTTP Status: http://${HOST}:${PORT}`);
});

// 상태 모니터링
setInterval(() => {
  const totalClients = Array.from(rooms.values()).reduce((sum, room) => sum + room.clients.size, 0);
  if (totalClients > 0 || rooms.size > 0) {
    console.log(`📊 현재 상태 - 룸: ${rooms.size}, 클라이언트: ${totalClients}`);
  }
}, 30000);

// 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 서버 종료 중...');
  wss.close(() => {
    server.close(() => {
      console.log('✅ 서버 종료 완료');
      process.exit(0);
    });
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 서버 종료 중...');
  wss.close(() => {
    server.close(() => {
      console.log('✅ 서버 종료 완료');
      process.exit(0);
    });
  });
});
