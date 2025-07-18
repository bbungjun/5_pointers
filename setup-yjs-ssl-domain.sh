#!/bin/bash

# Y.js 서버용 도메인 SSL 인증서 설정 스크립트

echo "🔒 Y.js 서버용 SSL 인증서 설정을 시작합니다..."

# 도메인 설정
DOMAIN="ws.ddukddak.org"
EMAIL="admin@ddukddak.org"

echo "📍 도메인: $DOMAIN"
echo "📧 이메일: $EMAIL"

# Certbot 설치 확인
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot 설치 중..."
    sudo apt update
    sudo apt install -y certbot
fi

# 기존 웹서버 중지 (포트 80 사용을 위해)
echo "🛑 기존 웹서버 중지 중..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# Let's Encrypt SSL 인증서 발급
echo "🔐 Let's Encrypt SSL 인증서 발급 중..."
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN

# 인증서 파일 확인
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$CERT_PATH" ]; then
    echo "✅ SSL 인증서가 성공적으로 생성되었습니다!"
    echo "📁 인증서 경로: $CERT_PATH"
    
    # 인증서 파일을 Y.js 서버 디렉토리로 복사
    echo "📋 인증서 파일을 복사 중..."
    sudo cp "$CERT_PATH/fullchain.pem" ./ws-ddukddak-org.crt
    sudo cp "$CERT_PATH/privkey.pem" ./ws-ddukddak-org.key
    sudo chown $USER:$USER ./ws-ddukddak-org.*
    
    echo "✅ 인증서 파일 복사 완료:"
    echo "   - ws-ddukddak-org.crt (인증서)"
    echo "   - ws-ddukddak-org.key (개인키)"
    
else
    echo "❌ SSL 인증서 생성에 실패했습니다."
    echo "💡 도메인 DNS 설정을 확인해주세요: $DOMAIN -> 43.203.235.108"
    exit 1
fi

# 자동 갱신 설정
echo "🔄 SSL 인증서 자동 갱신 설정 중..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "🎉 SSL 인증서 설정이 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "1. Y.js 서버 설정에서 새 인증서 파일 사용"
echo "2. 서버 재시작"
echo "3. https://$DOMAIN:1235 테스트"
echo ""
echo "🔗 테스트 URL: https://$DOMAIN:1235"
echo "🔗 WSS URL: wss://$DOMAIN:1235"
