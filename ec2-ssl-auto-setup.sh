#!/bin/bash

# EC2에서 실행할 Let's Encrypt SSL 자동 설정 스크립트

echo "🔒 Let's Encrypt SSL 인증서 자동 설정을 시작합니다..."

DOMAIN="ws.ddukddak.org"
EMAIL="admin@ddukddak.org"

echo "📍 도메인: $DOMAIN"
echo "📧 이메일: $EMAIL"

# 1. 기존 Y.js 서버 중지
echo "🛑 기존 Y.js 서버 중지 중..."
sudo pkill -f 'node.*yjs-server' || true
sleep 3

# 2. Certbot 설치
echo "📦 Certbot 설치 중..."
sudo apt update -y
sudo apt install -y certbot

# 3. 기존 웹서버 중지
echo "🛑 기존 웹서버 중지 중..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 4. 포트 80 사용 중인 프로세스 확인 및 중지
echo "🔍 포트 80 사용 프로세스 확인 중..."
sudo lsof -ti:80 | xargs sudo kill -9 2>/dev/null || true

# 5. Let's Encrypt SSL 인증서 발급
echo "🔐 Let's Encrypt SSL 인증서 발급 중..."
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN \
    --non-interactive

# 6. 인증서 발급 확인
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$CERT_PATH" ]; then
    echo "✅ SSL 인증서가 성공적으로 발급되었습니다!"
    echo "📁 인증서 경로: $CERT_PATH"
    
    # 7. 인증서 파일 복사
    echo "📋 인증서 파일을 작업 디렉토리로 복사 중..."
    sudo cp "$CERT_PATH/fullchain.pem" ./ws-ddukddak-org.crt
    sudo cp "$CERT_PATH/privkey.pem" ./ws-ddukddak-org.key
    sudo chown $USER:$USER ./ws-ddukddak-org.*
    
    echo "✅ 인증서 파일 복사 완료:"
    ls -la ws-ddukddak-org.*
    
    # 8. Y.js 서버 재시작 (도메인 SSL 버전)
    echo "🚀 Y.js 서버 재시작 중..."
    if [ -f "yjs-server-domain.js" ]; then
        NODE_ENV=production DOMAIN=$DOMAIN nohup node yjs-server-domain.js > yjs-domain.log 2>&1 &
        echo "✅ Y.js 서버가 도메인 SSL 모드로 시작되었습니다"
    else
        echo "⚠️ yjs-server-domain.js 파일이 없습니다. 기본 서버로 시작합니다."
        NODE_ENV=production nohup node yjs-server.js > yjs-ssl.log 2>&1 &
    fi
    
    # 9. 서버 시작 확인
    sleep 5
    echo "🧪 HTTPS 연결 테스트 중..."
    HTTPS_TEST=$(curl -s --connect-timeout 10 https://$DOMAIN:1235 2>/dev/null)
    if [[ "$HTTPS_TEST" == *"Y.js WebSocket Server"* ]]; then
        echo "✅ HTTPS 연결 성공!"
        echo "🌐 테스트 URL: https://$DOMAIN:1235"
    else
        echo "❌ HTTPS 연결 실패. 로그를 확인해주세요:"
        tail -10 yjs-*.log
    fi
    
    # 10. 자동 갱신 설정
    echo "🔄 SSL 인증서 자동 갱신 설정 중..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo ""
    echo "🎉 Let's Encrypt SSL 설정이 완료되었습니다!"
    echo "🔗 이제 https://$DOMAIN:1235 에서 보안 경고 없이 접속할 수 있습니다!"
    
else
    echo "❌ SSL 인증서 발급에 실패했습니다."
    echo "💡 다음을 확인해주세요:"
    echo "   1. 도메인 DNS 설정: $DOMAIN -> $(curl -s ifconfig.me)"
    echo "   2. 포트 80이 열려있는지 확인"
    echo "   3. 방화벽 설정 확인"
    
    # 에러 로그 확인
    echo "📋 Certbot 로그:"
    sudo tail -20 /var/log/letsencrypt/letsencrypt.log 2>/dev/null || echo "로그 파일 없음"
    
    exit 1
fi
