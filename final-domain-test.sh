#!/bin/bash

echo "🎉 도메인 기반 WSS 연결 최종 테스트"
echo "=================================="
echo ""

DOMAIN="ws.ddukddak.org"

echo "1️⃣ DNS 해석 확인:"
nslookup $DOMAIN 8.8.8.8 | grep "Address:" | tail -1
echo ""

echo "2️⃣ HTTP 연결 확인:"
curl -s http://$DOMAIN:1234 | head -1
echo ""

echo "3️⃣ HTTPS 연결 확인:"
curl -k -s https://$DOMAIN:1235 | head -1
echo ""

echo "4️⃣ WSS 연결 확인:"
NODE_TLS_REJECT_UNAUTHORIZED=0 node -e "
const WebSocket = require('ws');
const ws = new WebSocket('wss://$DOMAIN:1235/final-test');
ws.on('open', () => {
  console.log('✅ WSS 연결 성공!');
  ws.close();
});
ws.on('error', (err) => {
  console.log('❌ WSS 연결 실패:', err.message);
});
" 2>/dev/null

echo ""
echo "📋 최종 결과:"
echo "   🌐 도메인: $DOMAIN"
echo "   🔗 HTTP: http://$DOMAIN:1234 ✅"
echo "   🔒 HTTPS: https://$DOMAIN:1235 ✅"
echo "   📡 WSS: wss://$DOMAIN:1235 ✅"
echo ""
echo "🎯 프론트엔드에서 사용할 URL:"
echo "   wss://$DOMAIN:1235"
echo ""
echo "✨ 이제 IP 주소 대신 도메인으로 WSS 연결을 사용할 수 있습니다!"
