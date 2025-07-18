#!/bin/bash

# EC2 서버에서 실행할 SSL 인증서 설정 명령어들

echo "🔒 EC2 서버에서 다음 명령어들을 순서대로 실행해주세요:"
echo ""

echo "1️⃣ 기존 Y.js 서버 중지:"
echo "sudo pkill -f 'node.*yjs-server' || true"
echo ""

echo "2️⃣ Certbot 설치 (Ubuntu/Debian):"
echo "sudo apt update"
echo "sudo apt install -y certbot"
echo ""

echo "3️⃣ 기존 웹서버 중지 (포트 80 사용을 위해):"
echo "sudo systemctl stop nginx 2>/dev/null || true"
echo "sudo systemctl stop apache2 2>/dev/null || true"
echo ""

echo "4️⃣ Let's Encrypt SSL 인증서 발급:"
echo "sudo certbot certonly \\"
echo "    --standalone \\"
echo "    --email admin@ddukddak.org \\"
echo "    --agree-tos \\"
echo "    --no-eff-email \\"
echo "    --domains ws.ddukddak.org"
echo ""

echo "5️⃣ 인증서 파일을 작업 디렉토리로 복사:"
echo "sudo cp /etc/letsencrypt/live/ws.ddukddak.org/fullchain.pem ./ws-ddukddak-org.crt"
echo "sudo cp /etc/letsencrypt/live/ws.ddukddak.org/privkey.pem ./ws-ddukddak-org.key"
echo "sudo chown \$USER:\$USER ./ws-ddukddak-org.*"
echo ""

echo "6️⃣ 인증서 파일 확인:"
echo "ls -la ws-ddukddak-org.*"
echo ""

echo "7️⃣ 자동 갱신 설정:"
echo "(crontab -l 2>/dev/null; echo '0 12 * * * /usr/bin/certbot renew --quiet') | crontab -"
echo ""

echo "📝 위 명령어들을 EC2 서버에서 실행한 후 완료되면 알려주세요!"
echo "그러면 도메인 SSL을 지원하는 Y.js 서버를 배포하겠습니다."
