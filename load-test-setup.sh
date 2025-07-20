#!/bin/bash

# Y.js WebSocket 부하 테스트 환경 설정

echo "🚀 Y.js WebSocket 부하 테스트 환경 설정 시작..."

# 필요한 패키지 설치
echo "📦 필요한 패키지 설치 중..."

# Artillery 설치 (전역)
echo "⚡ Artillery 설치 중..."
npm install -g artillery

# 로컬 의존성 설치
echo "📦 로컬 의존성 설치 중..."
npm install --save-dev ws yjs y-websocket

# 추가 성능 분석 도구 (선택사항)
echo "🔧 성능 분석 도구 설치 중..."
npm install --save-dev clinic autocannon

echo "✅ 부하 테스트 환경 설정 완료!"
echo ""
echo "📋 설치된 패키지:"
echo "  - ws: WebSocket 클라이언트"
echo "  - yjs: Y.js 라이브러리"
echo "  - y-websocket: Y.js WebSocket 프로바이더"
echo "  - artillery: 부하 테스트 도구"
echo "  - clinic: Node.js 성능 분석"
echo ""
echo "🎯 다음 단계:"
echo "1. ./run-load-test.sh 실행"
echo "2. 또는 node yjs-load-test.js 직접 실행"
echo "3. 성능 모니터링: node monitor-performance.js"
