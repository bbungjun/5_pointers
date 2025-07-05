#!/bin/bash

# 시스템 업데이트
yum update -y

# Node.js 20 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs npm

# PM2 설치 (프로세스 관리자)
npm install -g pm2

# 서버 디렉토리 생성
mkdir -p /opt/jungle-servers
cd /opt/jungle-servers

# YJS 서버 설정
cat > yjs-server.js << 'EOF'
const WebSocketServer = require('ws').Server;
const http = require('http');
const Y = require('yjs');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3003;

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
  
  console.log(`새로운 연결: Room ${roomname}`);
  
  if (!roomClients.has(roomname)) {
    roomClients.set(roomname, new Set());
  }
  
  roomClients.get(roomname).add(ws);
  
  if (!docs.has(roomname)) {
    docs.set(roomname, new Y.Doc());
  }
  const doc = docs.get(roomname);
  
  ws.on('message', (message) => {
    try {
      const currentRoomClients = roomClients.get(roomname);
      if (currentRoomClients) {
        currentRoomClients.forEach((client) => {
          if (client !== ws && client.readyState === client.OPEN) {
            client.send(message);
          }
        });
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
    }
  });
  
  ws.on('close', () => {
    console.log(`연결 종료: Room ${roomname}`);
    
    const currentRoomClients = roomClients.get(roomname);
    if (currentRoomClients) {
      currentRoomClients.delete(ws);
      
      if (currentRoomClients.size === 0) {
        roomClients.delete(roomname);
        docs.delete(roomname);
        console.log(`Room ${roomname} 정리됨`);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error);
  });
});

server.listen(port, host, () => {
  console.log(`🚀 Y.js WebSocket 서버가 ${host}:${port}에서 실행 중입니다`);
  console.log('협업 기능 테스트를 시작할 수 있습니다!');
});

process.on('SIGINT', () => {
  console.log('\n서버를 종료합니다...');
  server.close(() => {
    console.log('서버가 종료되었습니다.');
    process.exit(0);
  });
});
EOF

# 서브도메인 서버 설정
cat > subdomain-server.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// MySQL 연결 설정 (환경변수 사용)
const dbConfig = {
  host: process.env.DB_HOST || 'jungle-db5.cluster-chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
  user: process.env.DB_USERNAME || 'jungle_user',
  password: process.env.DB_PASSWORD || 'Jungle5pointers2025!',
  database: process.env.DB_DATABASE || 'jungle_db'
};

// 배포된 사이트들이 저장될 디렉토리
const deployedSitesPath = path.join(__dirname, 'deployed-sites');

// 디렉토리가 없으면 생성
if (!fs.existsSync(deployedSitesPath)) {
  fs.mkdirSync(deployedSitesPath, { recursive: true });
}

// 서브도메인 처리 미들웨어
app.use(async (req, res, next) => {
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  // 직접 접근시 기본 페이지
  if (host === `localhost:${PORT}` || subdomain === 'localhost' || !subdomain.includes('.')) {
    return res.send(`
      <h1>Wildcard Subdomain Server</h1>
      <p>서브도메인으로 접근하세요</p>
      <p>현재 호스트: ${host}</p>
    `);
  }
  
  try {
    // submissions 테이블에서 도메인으로 데이터 검색
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT data FROM submissions WHERE JSON_EXTRACT(data, "$.domain") = ? ORDER BY created_at DESC LIMIT 1',
      [subdomain]
    );
    await connection.end();
    
    if (rows.length > 0) {
      const data = rows[0].data;
      const html = data.html || generateHTMLFromComponents(data.components || []);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send('<h1>500 - Server Error</h1>');
  }
});

// 컴포넌트에서 HTML 생성 함수
function generateHTMLFromComponents(components) {
  const componentHTML = components.map(comp => {
    const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px;`;
    
    switch (comp.type) {
      case 'button':
        return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
      case 'text':
        return `<div style="${style}">${comp.props.text}</div>`;
      case 'link':
        return `<a href="${comp.props.url}" style="${style} text-decoration: underline;">${comp.props.text}</a>`;
      case 'attend':
        return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
      default:
        return `<div style="${style}">${comp.props.text}</div>`;
    }
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Deployed Site</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Inter, sans-serif; position: relative; min-height: 100vh; }
      </style>
    </head>
    <body>
      ${componentHTML}
    </body>
    </html>
  `;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Wildcard subdomain server running on port ${PORT}`);
  console.log(`📁 Deployed sites directory: ${deployedSitesPath}`);
});
EOF

# package.json 생성
cat > package.json << 'EOF'
{
  "name": "jungle-servers",
  "version": "1.0.0",
  "description": "YJS and Subdomain servers for 5Pointers",
  "main": "yjs-server.js",
  "scripts": {
    "start:yjs": "node yjs-server.js",
    "start:subdomain": "node subdomain-server.js"
  },
  "dependencies": {
    "ws": "^8.0.0",
    "yjs": "^13.0.0",
    "express": "^4.18.0",
    "mysql2": "^3.0.0"
  },
  "keywords": ["yjs", "websocket", "collaboration", "subdomain"],
  "author": "5Pointers Team",
  "license": "MIT"
}
EOF

# 의존성 설치
npm install

# PM2로 서버들 실행
pm2 start yjs-server.js --name yjs-server -- --port 3003
pm2 start subdomain-server.js --name subdomain-server -- --port 3001

# PM2 설정 저장 및 부팅시 자동 시작
pm2 save
pm2 startup

echo "🚀 서버 배포 완료!"
echo "YJS 서버: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3003"
echo "서브도메인 서버: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3001"
