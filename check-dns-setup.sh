#!/bin/bash

echo "🔍 DNS 설정 확인을 시작합니다..."

DOMAIN="ws.ddukddak.org"
TARGET_IP="43.203.235.108"

echo "📍 확인할 도메인: $DOMAIN"
echo "🎯 예상 IP: $TARGET_IP"
echo ""

# DNS 해석 테스트
echo "1️⃣ DNS 해석 테스트:"
RESOLVED_IP=$(nslookup $DOMAIN 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')

if [ "$RESOLVED_IP" = "$TARGET_IP" ]; then
    echo "✅ DNS 해석 성공: $DOMAIN -> $RESOLVED_IP"
else
    echo "❌ DNS 해석 실패 또는 전파 대기 중"
    echo "   현재: $RESOLVED_IP"
    echo "   예상: $TARGET_IP"
    echo "💡 DNS 전파는 최대 5분 소요될 수 있습니다."
fi

echo ""

# HTTP 연결 테스트
echo "2️⃣ HTTP 연결 테스트:"
HTTP_RESPONSE=$(curl -s --connect-timeout 10 http://$DOMAIN:1234 2>/dev/null)
if [[ "$HTTP_RESPONSE" == *"Y.js WebSocket Server"* ]]; then
    echo "✅ HTTP 연결 성공: http://$DOMAIN:1234"
else
    echo "❌ HTTP 연결 실패"
    echo "💡 Y.js 서버가 실행 중인지 확인해주세요."
fi

echo ""

# HTTPS 연결 테스트
echo "3️⃣ HTTPS 연결 테스트:"
HTTPS_RESPONSE=$(curl -k -s --connect-timeout 10 https://$DOMAIN:1235 2>/dev/null)
if [[ "$HTTPS_RESPONSE" == *"Y.js WebSocket Server"* ]]; then
    echo "✅ HTTPS 연결 성공: https://$DOMAIN:1235"
else
    echo "❌ HTTPS 연결 실패"
    echo "💡 SSL 인증서 설정이 필요할 수 있습니다."
fi

echo ""
echo "📋 요약:"
echo "   🌐 도메인: $DOMAIN"
echo "   🔗 HTTP: http://$DOMAIN:1234"
echo "   🔒 HTTPS: https://$DOMAIN:1235"
echo "   📡 WSS: wss://$DOMAIN:1235"
echo ""

if [ "$RESOLVED_IP" = "$TARGET_IP" ]; then
    echo "🎉 DNS 설정이 완료되었습니다!"
    echo "📝 다음 단계: SSL 인증서 설정 및 Y.js 서버 배포"
else
    echo "⏳ DNS 전파를 기다리거나 설정을 다시 확인해주세요."
fi
