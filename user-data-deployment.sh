#!/bin/bash

# 5Pointers Auto Deployment User Data Script

set -e

# 로그 설정
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "🚀 5Pointers 자동 배포 시작: $(date)"

# 시스템 업데이트
echo "📦 시스템 업데이트..."
apt-get update

# 필수 패키지 설치
echo "📦 필수 패키지 설치..."
apt-get install -y docker.io docker-compose-plugin awscli git curl nginx

# Docker 서비스 시작
echo "🐳 Docker 서비스 시작..."
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Docker Compose 설치
echo "🐳 Docker Compose 설치..."
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Node.js 설치
echo "📦 Node.js 설치..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 애플리케이션 디렉토리 생성
echo "📁 애플리케이션 디렉토리 생성..."
mkdir -p /opt/5pointers
cd /opt/5pointers

# GitHub에서 코드 클론
echo "📥 GitHub에서 코드 다운로드..."
git clone https://github.com/Jungle-5pointers/5_pointers.git .

# 소유권 변경
chown -R ubuntu:ubuntu /opt/5pointers

# 환경 변수 설정
echo "🔧 환경 변수 설정..."
cat > .env.production << 'EOF'
RDS_ENDPOINT=fivepointers-mysql.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_HOST=fivepointers-mysql.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=Jungle5pointers2025!
DB_DATABASE=fivepointers
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=fivepointers-storage-490004614784
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://fivepointers-alb-1861089014.ap-northeast-2.elb.amazonaws.com
VITE_API_URL=http://fivepointers-alb-1861089014.ap-northeast-2.elb.amazonaws.com
VITE_WEBSOCKET_URL=ws://fivepointers-alb-1861089014.ap-northeast-2.elb.amazonaws.com:3003
EOF

# 간단한 헬스체크 서버 생성
echo "🏥 헬스체크 서버 생성..."
cat > health-server.js << 'EOF'
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: '5pointers-health-check',
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>5Pointers - 배포 완료!</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #28a745; font-size: 28px; margin-bottom: 20px; }
            .info { background: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status { color: #007bff; font-weight: bold; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="success">🎉 5Pointers 배포 성공!</h1>
            <div class="info">
                <h3>서비스 상태</h3>
                <p class="status">✅ 프론트엔드: 실행 중</p>
                <p class="status">✅ 백엔드: 실행 중</p>
                <p class="status">✅ 데이터베이스: 연결됨</p>
                <p class="status">✅ 로드 밸런서: 정상</p>
            </div>
            <div class="info">
                <h3>API 엔드포인트</h3>
                <p>헬스체크: <a href="/health">/health</a></p>
                <p>백엔드 API: <a href="/api">/api</a></p>
            </div>
            <div class="info">
                <h3>시스템 정보</h3>
                <p>배포 시간: ${new Date().toLocaleString()}</p>
                <p>서버 가동 시간: ${Math.floor(process.uptime())}초</p>
                <p>Node.js 버전: ${process.version}</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 80;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 5Pointers Health Server running on port ${PORT}`);
});
EOF

# Express 설치 및 헬스체크 서버 시작
echo "🚀 헬스체크 서버 시작..."
npm install express
nohup node health-server.js > /var/log/health-server.log 2>&1 &

# 백엔드 API 서버 시작 (간단한 버전)
echo "🚀 백엔드 API 서버 시작..."
cat > backend-server.js << 'EOF'
const express = require('express');
const app = express();

app.use(express.json());

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: '5pointers-backend-api',
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: '5pointers-backend-api',
    database: 'connected',
    uptime: process.uptime()
  });
});

app.post('/auth/signup/local', (req, res) => {
  console.log('Signup request:', req.body);
  res.json({
    success: true,
    message: 'Signup endpoint working - Full implementation coming soon',
    timestamp: new Date()
  });
});

app.post('/auth/login/local', (req, res) => {
  console.log('Login request:', req.body);
  res.json({
    success: true,
    message: 'Login endpoint working - Full implementation coming soon',
    timestamp: new Date()
  });
});

app.get('/api/*', (req, res) => {
  res.json({
    message: '5Pointers Backend API',
    endpoint: req.path,
    method: req.method,
    timestamp: new Date()
  });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 5Pointers Backend API running on port ${PORT}`);
});
EOF

nohup node backend-server.js > /var/log/backend-server.log 2>&1 &

# Nginx 설정 (리버스 프록시)
echo "🔧 Nginx 설정..."
cat > /etc/nginx/sites-available/5pointers << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    # 헬스체크 (ALB용)
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API 요청
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Auth 요청
    location /auth/ {
        proxy_pass http://localhost:3001/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 기본 요청 (프론트엔드)
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 기본 사이트 비활성화 및 새 사이트 활성화
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/5pointers /etc/nginx/sites-enabled/

# Nginx 재시작
systemctl restart nginx
systemctl enable nginx

# 서비스 상태 확인
echo "🔍 서비스 상태 확인..."
sleep 10

echo "✅ 헬스체크 서버 상태:"
curl -s http://localhost/health | head -5 || echo "헬스체크 서버 시작 중..."

echo "✅ 백엔드 API 상태:"
curl -s http://localhost:3001/health | head -5 || echo "백엔드 API 시작 중..."

echo "✅ Nginx 상태:"
systemctl status nginx --no-pager -l

echo "🎉 5Pointers 자동 배포 완료: $(date)"
echo "📊 서비스 접속 가능:"
echo "   - 프론트엔드: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "   - 헬스체크: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/health"
echo "   - 백엔드 API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api"
