#!/bin/bash

# AWS EC2 yjs-websocket3 인스턴스에 Y.js WebSocket 서버 배포 스크립트

echo "🚀 AWS EC2 yjs-websocket3 인스턴스에 Y.js 서버 배포 시작..."

# EC2 인스턴스 정보
EC2_INSTANCE_ID="i-0c9760baf14461b31"  # yjs-websocket3 인스턴스
EC2_PUBLIC_IP="43.203.235.108"          # WebSocket 서버 IP
EC2_KEY_NAME="yjs-websocket3-key"            # 실제 키 이름으로 변경 필요
EC2_USER="ubuntu"                       # 또는 ec2-user (AMI에 따라 다름)

echo "📋 EC2 인스턴스 정보:"
echo "  - Instance ID: $EC2_INSTANCE_ID"
echo "  - Public IP: $EC2_PUBLIC_IP"
echo "  - User: $EC2_USER"

echo "✅ WebSocket 서버 IP: $EC2_PUBLIC_IP"

# config.js 파일의 IP 주소 업데이트
echo "🔧 config.js 파일의 WebSocket IP 주소 업데이트..."
sed -i "s/const EC2_WEBSOCKET_IP = '[^']*'/const EC2_WEBSOCKET_IP = '$EC2_PUBLIC_IP'/" ./my-web-builder/apps/frontend/src/config.js

echo "✅ config.js 업데이트 완료"

# Y.js 서버 파일들을 EC2에 복사할 준비
echo "📦 Y.js 서버 파일 준비 중..."

# 필요한 파일들 목록
FILES_TO_COPY=(
  "yjs-server.js"
  "package.json"
  "start-yjs-local.sh"
  "start-yjs-production.sh"
  "restart-yjs-server.sh"
)

# 임시 디렉토리 생성
TEMP_DIR="/tmp/yjs-deploy-$(date +%s)"
mkdir -p $TEMP_DIR

# 파일들 복사
for file in "${FILES_TO_COPY[@]}"; do
  if [ -f "./$file" ]; then
    cp "./$file" "$TEMP_DIR/"
    echo "  ✅ $file 복사됨"
  else
    echo "  ⚠️  $file 파일을 찾을 수 없습니다."
  fi
done

# package.json이 없으면 기본 생성
if [ ! -f "$TEMP_DIR/package.json" ]; then
  echo "📝 기본 package.json 생성 중..."
  cat > "$TEMP_DIR/package.json" << EOF
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
fi

# EC2 배포 명령어 출력 (실제 실행은 사용자가 해야 함)
echo ""
echo "🚀 다음 명령어들을 실행하여 EC2에 배포하세요:"
echo ""
echo "1. EC2 인스턴스에 연결:"
echo "   ssh -i ~/.ssh/$EC2_KEY_NAME.pem $EC2_USER@$EC2_PUBLIC_IP"
echo ""
echo "2. 필요한 패키지 설치 (EC2에서 실행):"
echo "   sudo apt update && sudo apt install -y nodejs npm"
echo ""
echo "3. Y.js 서버 파일 업로드:"
echo "   scp -i ~/.ssh/$EC2_KEY_NAME.pem -r $TEMP_DIR/* $EC2_USER@$EC2_PUBLIC_IP:~/"
echo ""
echo "4. EC2에서 의존성 설치 및 서버 시작:"
echo "   ssh -i ~/.ssh/$EC2_KEY_NAME.pem $EC2_USER@$EC2_PUBLIC_IP"
echo "   npm install"
echo "   NODE_ENV=production EXTERNAL_IP=$EC2_PUBLIC_IP npm run prod"
echo ""
echo "5. 백그라운드 실행 (선택사항):"
echo "   nohup NODE_ENV=production EXTERNAL_IP=$EC2_PUBLIC_IP node yjs-server.js > yjs.log 2>&1 &"
echo ""
echo "🔧 보안 그룹 설정:"
echo "  - 포트 1234 (HTTP/WS) 인바운드 허용"
echo "  - 포트 1235 (HTTPS/WSS) 인바운드 허용"
echo ""
echo "📁 임시 파일 위치: $TEMP_DIR"
echo "🔗 배포 후 WebSocket URL:"
echo "  - HTTP: ws://$EC2_PUBLIC_IP:1234"
echo "  - HTTPS: wss://$EC2_PUBLIC_IP:1235"

# 정리
echo ""
echo "✅ 배포 준비 완료!"
echo "💡 위의 명령어들을 순서대로 실행하여 배포를 완료하세요."
