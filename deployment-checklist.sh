#!/bin/bash

echo "🚀 배포 전 최종 체크리스트"
echo "========================="
echo ""

# 1. 기존 IP 설정 제거 확인
echo "1️⃣ 기존 IP 주소 설정 제거 확인:"
if grep -r "43.203.235.108" /home/jaemin/jungle/my-web-builder/apps/frontend/src/ 2>/dev/null; then
    echo "❌ 기존 IP 주소가 아직 남아있습니다!"
    exit 1
else
    echo "✅ 기존 IP 주소 설정 완전 제거됨"
fi
echo ""

# 2. 도메인 설정 확인
echo "2️⃣ 도메인 설정 확인:"
if grep -q "ws.ddukddak.org" /home/jaemin/jungle/my-web-builder/apps/frontend/src/config.js; then
    echo "✅ 도메인 설정 정상"
else
    echo "❌ 도메인 설정 누락!"
    exit 1
fi
echo ""

# 3. DNS 해석 확인
echo "3️⃣ DNS 해석 확인:"
RESOLVED_IP=$(nslookup ws.ddukddak.org 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
if [ "$RESOLVED_IP" = "43.203.235.108" ]; then
    echo "✅ DNS 해석 정상: ws.ddukddak.org → $RESOLVED_IP"
else
    echo "❌ DNS 해석 실패: $RESOLVED_IP"
    exit 1
fi
echo ""

# 4. HTTPS 연결 확인
echo "4️⃣ HTTPS 연결 확인:"
HTTPS_RESPONSE=$(curl -k -s --connect-timeout 5 https://ws.ddukddak.org:1235 2>/dev/null)
if [[ "$HTTPS_RESPONSE" == *"Y.js WebSocket Server"* ]]; then
    echo "✅ HTTPS 연결 정상"
else
    echo "❌ HTTPS 연결 실패"
    exit 1
fi
echo ""

# 5. WSS 연결 확인
echo "5️⃣ WSS 연결 확인:"
WSS_TEST=$(NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
const WebSocket = require('ws');
const ws = new WebSocket('wss://ws.ddukddak.org:1235/deployment-test');
ws.on('open', () => { console.log('SUCCESS'); ws.close(); });
ws.on('error', () => { console.log('FAILED'); });
" 2>/dev/null)

if [ "$WSS_TEST" = "SUCCESS" ]; then
    echo "✅ WSS 연결 정상"
else
    echo "❌ WSS 연결 실패"
    exit 1
fi
echo ""

echo "🎉 모든 체크 완료! 배포 준비 완료!"
echo ""
echo "📋 배포 후 예상 동작:"
echo "   🏠 로컬: wss://172.30.74.11:1235"
echo "   🌍 프로덕션: wss://ws.ddukddak.org:1235"
echo ""
echo "✨ 이제 안전하게 배포할 수 있습니다!"
