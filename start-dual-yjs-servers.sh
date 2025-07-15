#!/bin/bash

# Y.js 듀얼 서버 시작 스크립트
# 1234 포트: HTTP WebSocket (ws://)
# 1235 포트: HTTPS WebSocket (wss://)

echo "🚀 Y.js 듀얼 서버를 시작합니다..."

# 기존 프로세스 종료
echo "🛑 기존 Y.js 서버 프로세스를 종료합니다..."
pkill -f "node.*yjs-server"
sleep 2

# 로그 디렉토리 생성
mkdir -p logs

# 1234 포트 HTTP 서버 시작
echo "🌐 HTTP WebSocket 서버 시작 (포트 1234)..."
nohup node yjs-server.js > logs/yjs-http-1234.log 2>&1 &
HTTP_PID=$!
echo $HTTP_PID > yjs-http.pid
echo "✅ HTTP 서버 PID: $HTTP_PID"

# 잠시 대기
sleep 3

# 1235 포트 HTTPS 서버 시작
echo "🔒 HTTPS WebSocket 서버 시작 (포트 1235)..."
nohup node yjs-server-ssl.js > logs/yjs-https-1235.log 2>&1 &
HTTPS_PID=$!
echo $HTTPS_PID > yjs-https.pid
echo "✅ HTTPS 서버 PID: $HTTPS_PID"

# 서버 상태 확인
sleep 3
echo ""
echo "📊 서버 상태 확인:"

# HTTP 서버 확인
if curl -s http://43.201.125.200:1234 > /dev/null; then
    echo "✅ HTTP 서버 (1234): 정상 작동"
else
    echo "❌ HTTP 서버 (1234): 연결 실패"
fi

# HTTPS 서버 확인
if curl -s -k https://43.201.125.200:1235 > /dev/null; then
    echo "✅ HTTPS 서버 (1235): 정상 작동"
else
    echo "❌ HTTPS 서버 (1235): 연결 실패"
fi

echo ""
echo "🔗 연결 정보:"
echo "  - HTTP WebSocket:  ws://43.201.125.200:1234"
echo "  - HTTPS WebSocket: wss://43.201.125.200:1235"
echo ""
echo "📋 관리 명령어:"
echo "  - 로그 확인: tail -f logs/yjs-http-1234.log"
echo "  - 로그 확인: tail -f logs/yjs-https-1235.log"
echo "  - 서버 종료: ./stop-yjs-servers.sh"
echo ""
echo "🎉 Y.js 듀얼 서버가 성공적으로 시작되었습니다!"
