#!/bin/bash

# 실제 yjs-websocket3 EC2 인스턴스 배포 스크립트

set -e  # 오류 발생 시 스크립트 중단

# 설정
EC2_IP="43.203.235.108"
EC2_USER="ubuntu"
KEY_PATH="/mnt/c/yjs-websocket3-key.pem"
LOCAL_YJS_FILE="/home/jaemin/jungle/yjs-server.js"

echo "🚀 Y.js WebSocket 서버 배포 시작..."
echo "📋 배포 정보:"
echo "  - EC2 IP: $EC2_IP"
echo "  - 사용자: $EC2_USER"
echo "  - SSH 키: $KEY_PATH"
echo "  - 로컬 파일: $LOCAL_YJS_FILE"
echo ""

# 1. SSH 키 권한 확인
echo "🔑 SSH 키 권한 설정..."
chmod 400 "$KEY_PATH"
echo "✅ SSH 키 권한 설정 완료"

# 2. EC2 연결 테스트
echo "🔍 EC2 연결 테스트..."
if ssh -i "$KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" "echo 'EC2 연결 성공'" 2>/dev/null; then
    echo "✅ EC2 연결 성공"
else
    echo "❌ EC2 연결 실패. 다음을 확인하세요:"
    echo "  - EC2 인스턴스가 실행 중인지 확인"
    echo "  - 보안 그룹에서 SSH(22) 포트가 열려있는지 확인"
    echo "  - SSH 키 파일이 올바른지 확인"
    exit 1
fi

# 3. Y.js 서버 파일 업로드
echo "📤 Y.js 서버 파일 업로드..."
if [ -f "$LOCAL_YJS_FILE" ]; then
    scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$LOCAL_YJS_FILE" "$EC2_USER@$EC2_IP:~/"
    echo "✅ yjs-server.js 업로드 완료"
else
    echo "❌ yjs-server.js 파일을 찾을 수 없습니다: $LOCAL_YJS_FILE"
    exit 1
fi

# 4. package.json 생성 및 업로드
echo "📝 package.json 생성..."
cat > /tmp/package.json << 'EOF'
{
  "name": "yjs-websocket-server",
  "version": "1.0.0",
  "description": "Y.js WebSocket Server for Real-time Collaboration",
  "main": "yjs-server.js",
  "scripts": {
    "start": "node yjs-server.js",
    "dev": "NODE_ENV=development node yjs-server.js",
    "prod": "NODE_ENV=production node yjs-server.js"
  },
  "dependencies": {
    "yjs": "^13.6.8",
    "ws": "^8.14.2"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

scp -i "$KEY_PATH" -o StrictHostKeyChecking=no /tmp/package.json "$EC2_USER@$EC2_IP:~/"
echo "✅ package.json 업로드 완료"

# 5. EC2에서 환경 설정 및 서버 시작
echo "⚙️  EC2에서 환경 설정 및 서버 시작..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'ENDSSH'
set -e

echo "🔍 Node.js 버전 확인..."
if command -v node &> /dev/null; then
    echo "✅ Node.js 이미 설치됨: $(node --version)"
else
    echo "📦 Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js 설치 완료: $(node --version)"
fi

echo "📦 npm 패키지 설치..."
npm install

echo "🛑 기존 Y.js 서버 프로세스 중지..."
pkill -f "yjs-server.js" || echo "기존 프로세스 없음"

echo "🚀 Y.js 서버 시작 (백그라운드)..."
nohup NODE_ENV=production EXTERNAL_IP=43.203.235.108 node yjs-server.js > yjs.log 2>&1 &

sleep 3

echo "📊 서버 상태 확인..."
if pgrep -f "yjs-server.js" > /dev/null; then
    echo "✅ Y.js 서버가 성공적으로 시작되었습니다!"
    echo "📋 프로세스 정보:"
    ps aux | grep "yjs-server.js" | grep -v grep
    echo ""
    echo "📄 서버 로그 (최근 10줄):"
    tail -10 yjs.log
else
    echo "❌ Y.js 서버 시작 실패"
    echo "📄 오류 로그:"
    cat yjs.log
    exit 1
fi
ENDSSH

echo ""
echo "🎉 배포 완료!"
echo "🔗 WebSocket 연결 URL:"
echo "  - HTTP:  ws://43.203.235.108:1234"
echo "  - HTTPS: wss://43.203.235.108:1235"
echo ""
echo "🔧 보안 그룹 설정 확인:"
echo "  - 포트 1234 (HTTP/WS) 인바운드 허용 필요"
echo "  - 포트 1235 (HTTPS/WSS) 인바운드 허용 필요"
echo ""
echo "📊 서버 상태 확인: ssh -i $KEY_PATH $EC2_USER@$EC2_IP 'tail -f yjs.log'"
