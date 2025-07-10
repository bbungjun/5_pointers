#!/bin/bash

# Y.js WebSocket 서버 시작 스크립트

echo "🚀 Y.js WebSocket 서버를 시작합니다..."

# 필요한 패키지 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성 패키지를 설치합니다..."
    npm install
fi

# Y.js 서버 실행
echo "🔄 Y.js 서버를 포트 1234에서 시작합니다..."
echo "🌐 외부 접근 가능: http://[서버IP]:1234"
echo "🤝 협업 기능 테스트를 시작할 수 있습니다!"

# 환경변수 설정
export HOST=0.0.0.0
export PORT=1234

# 서버 실행
node yjs-server.js
