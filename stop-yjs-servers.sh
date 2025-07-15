#!/bin/bash

# Y.js 서버 종료 스크립트

echo "🛑 Y.js 서버들을 종료합니다..."

# PID 파일에서 프로세스 종료
if [ -f "yjs-http.pid" ]; then
    HTTP_PID=$(cat yjs-http.pid)
    if kill -0 $HTTP_PID 2>/dev/null; then
        echo "🌐 HTTP 서버 (PID: $HTTP_PID) 종료 중..."
        kill $HTTP_PID
        sleep 2
        if kill -0 $HTTP_PID 2>/dev/null; then
            echo "⚠️  강제 종료..."
            kill -9 $HTTP_PID
        fi
    fi
    rm -f yjs-http.pid
fi

if [ -f "yjs-https.pid" ]; then
    HTTPS_PID=$(cat yjs-https.pid)
    if kill -0 $HTTPS_PID 2>/dev/null; then
        echo "🔒 HTTPS 서버 (PID: $HTTPS_PID) 종료 중..."
        kill $HTTPS_PID
        sleep 2
        if kill -0 $HTTPS_PID 2>/dev/null; then
            echo "⚠️  강제 종료..."
            kill -9 $HTTPS_PID
        fi
    fi
    rm -f yjs-https.pid
fi

# 남은 프로세스 정리
echo "🧹 남은 Y.js 프로세스 정리..."
pkill -f "node.*yjs-server"

echo "✅ 모든 Y.js 서버가 종료되었습니다."
