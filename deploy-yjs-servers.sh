#!/bin/bash

# EC2에 Y.js 서버 배포 스크립트

EC2_IP="43.201.125.200"
KEY_PATH="~/.ssh/jungle-servers-key.pem"

echo "🚀 EC2에 Y.js 서버를 배포합니다..."

# 파일들을 EC2로 복사
echo "📁 파일 복사 중..."
scp -i $KEY_PATH yjs-server-ssl.js ubuntu@$EC2_IP:~/
scp -i $KEY_PATH start-dual-yjs-servers.sh ubuntu@$EC2_IP:~/
scp -i $KEY_PATH stop-yjs-servers.sh ubuntu@$EC2_IP:~/

# EC2에서 서버 실행
echo "🔄 EC2에서 서버 재시작..."
ssh -i $KEY_PATH ubuntu@$EC2_IP << 'EOF'
# 기존 서버 종료
echo "🛑 기존 서버 종료..."
pkill -f "node.*yjs-server"
sleep 3

# 새 서버 시작
echo "🚀 새 서버 시작..."
chmod +x start-dual-yjs-servers.sh stop-yjs-servers.sh
./start-dual-yjs-servers.sh

echo "✅ 배포 완료!"
EOF

echo "🎉 EC2 배포가 완료되었습니다!"
echo "🔗 연결 정보:"
echo "  - HTTP WebSocket:  ws://43.201.125.200:1234"
echo "  - HTTPS WebSocket: wss://43.201.125.200:1235"
