#!/bin/bash

# Y.js 서버 도메인 SSL 배포 스크립트

echo "🚀 Y.js 서버 도메인 SSL 배포를 시작합니다..."

# 설정
EC2_IP="43.203.235.108"
EC2_USER="ubuntu"
KEY_PATH="~/.ssh/your-key.pem"  # 실제 키 파일 경로로 변경 필요
DOMAIN="ws.ddukddak.org"

echo "📍 대상 서버: $EC2_IP"
echo "🔗 도메인: $DOMAIN"

# 파일 업로드
echo "📤 파일을 EC2 서버로 업로드 중..."

# Y.js 서버 파일 업로드
scp -i $KEY_PATH yjs-server-domain.js $EC2_USER@$EC2_IP:~/
scp -i $KEY_PATH setup-yjs-ssl-domain.sh $EC2_USER@$EC2_IP:~/

# 서버에서 실행할 명령어들
REMOTE_COMMANDS="
echo '🔧 Y.js 서버 설정을 시작합니다...'

# 기존 Y.js 서버 중지
echo '🛑 기존 Y.js 서버 중지 중...'
pkill -f 'node.*yjs-server' || true
sleep 2

# SSL 인증서 설정
echo '🔒 SSL 인증서 설정 중...'
chmod +x setup-yjs-ssl-domain.sh
sudo ./setup-yjs-ssl-domain.sh

# Node.js 의존성 확인
echo '📦 Node.js 의존성 확인 중...'
npm list yjs ws || npm install yjs ws

# Y.js 서버 시작
echo '🚀 Y.js 서버 시작 중...'
NODE_ENV=production DOMAIN=$DOMAIN nohup node yjs-server-domain.js > yjs-domain.log 2>&1 &

# 서버 상태 확인
sleep 5
if pgrep -f 'node.*yjs-server-domain' > /dev/null; then
    echo '✅ Y.js 서버가 성공적으로 시작되었습니다!'
    echo '📋 서버 로그:'
    tail -10 yjs-domain.log
    echo ''
    echo '🔗 테스트 URL:'
    echo '   - HTTP: http://$DOMAIN:1234'
    echo '   - HTTPS: https://$DOMAIN:1235'
    echo '   - WS: ws://$DOMAIN:1234'
    echo '   - WSS: wss://$DOMAIN:1235'
else
    echo '❌ Y.js 서버 시작에 실패했습니다.'
    echo '📋 오류 로그:'
    tail -20 yjs-domain.log
    exit 1
fi
"

# 원격 서버에서 명령어 실행
echo "🔧 원격 서버에서 설정을 실행합니다..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP "$REMOTE_COMMANDS"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Y.js 서버 도메인 SSL 배포가 완료되었습니다!"
    echo ""
    echo "📋 접속 정보:"
    echo "   🌍 도메인: $DOMAIN"
    echo "   🔒 HTTPS: https://$DOMAIN:1235"
    echo "   🔗 WSS: wss://$DOMAIN:1235"
    echo ""
    echo "📝 다음 단계:"
    echo "1. Route 53에서 DNS 설정: $DOMAIN -> $EC2_IP"
    echo "2. 프론트엔드에서 새 WSS URL 테스트"
    echo "3. SSL 인증서 자동 갱신 확인"
    echo ""
    echo "🧪 테스트 명령어:"
    echo "   curl https://$DOMAIN:1235"
    echo "   # 응답: Y.js WebSocket Server (HTTPS) is running!"
else
    echo "❌ 배포 중 오류가 발생했습니다."
    exit 1
fi
