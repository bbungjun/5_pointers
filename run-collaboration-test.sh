#!/bin/bash

# 5Pointers 협업 기능 성능 테스트 실행 스크립트

echo "🚀 5Pointers 협업 성능 테스트 시작"
echo "=================================="

# 환경 변수 설정
export YJS_WEBSOCKET_URL="wss://ws.ddukddak.org:1235"
export MAX_CLIENTS=20
export TEST_DURATION=60000

# 필요한 패키지 설치 확인
echo "📦 필요한 패키지 확인 중..."
npm list yjs y-websocket ws > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  필요한 패키지를 설치합니다..."
    npm install yjs y-websocket ws
fi

# 테스트 실행
echo "🔥 성능 테스트 실행 중..."
node collaboration-performance-test.js

echo ""
echo "✅ 테스트 완료!"
echo "📊 결과 파일을 확인하세요: collaboration-test-*.json"
