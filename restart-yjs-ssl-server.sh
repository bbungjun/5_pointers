#!/bin/bash

echo "🔄 Y.js SSL WebSocket 서버 재시작 중..."

# 기존 프로세스 종료
echo "📋 기존 Y.js 서버 프로세스 확인 중..."
pkill -f "node.*yjs-server.js" || echo "실행 중인 Y.js 서버가 없습니다."

# 잠시 대기
sleep 2

# SSL 인증서 생성 (없는 경우)
if [ ! -f "server.key" ] || [ ! -f "server.crt" ]; then
    echo "🔐 SSL 인증서 생성 중..."
    openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/C=KR/ST=Seoul/L=Seoul/O=YJS/CN=43.201.125.200"
    echo "✅ SSL 인증서가 생성되었습니다."
fi

# 새 서버 시작
echo "🚀 새 Y.js SSL WebSocket 서버 시작 중..."
nohup node yjs-server.js > yjs-server.log 2>&1 &

# 프로세스 ID 저장
echo $! > yjs-server.pid

echo "✅ Y.js SSL WebSocket 서버가 시작되었습니다!"
echo "📋 프로세스 ID: $(cat yjs-server.pid)"
echo "📄 로그 파일: yjs-server.log"
echo "🔗 HTTP: http://43.201.125.200:1234"
echo "🔒 HTTPS: https://43.201.125.200:1235"
echo "🔗 WSS: wss://43.201.125.200:1235"

# 서버 상태 확인
sleep 3
if ps -p $(cat yjs-server.pid) > /dev/null; then
    echo "✅ 서버가 정상적으로 실행 중입니다."
    echo "📊 최근 로그:"
    tail -n 10 yjs-server.log
else
    echo "❌ 서버 시작에 실패했습니다."
    echo "📊 오류 로그:"
    tail -n 20 yjs-server.log
fi
