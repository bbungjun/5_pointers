#!/bin/bash

# Y.js WebSocket 대용량 동시접속 테스트 실행 스크립트

echo "🚀 Y.js WebSocket 대용량 동시접속 테스트"
echo "========================================"

# 환경 변수 설정
export YJS_SERVER_URL=${YJS_SERVER_URL:-"ws://43.203.235.108:1234"}
export MAX_CLIENTS=${MAX_CLIENTS:-100}
export TEST_DURATION=${TEST_DURATION:-300000}  # 5분
export ROOM_COUNT=${ROOM_COUNT:-10}

echo "📋 테스트 설정:"
echo "   🌐 서버 URL: $YJS_SERVER_URL"
echo "   👥 최대 클라이언트: $MAX_CLIENTS"
echo "   ⏱️  테스트 시간: $(($TEST_DURATION / 1000))초"
echo "   🏠 룸 개수: $ROOM_COUNT"
echo ""

# 필요한 패키지 확인
echo "📦 의존성 확인 중..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    exit 1
fi

if ! npm list yjs &> /dev/null; then
    echo "📥 Y.js 설치 중..."
    npm install yjs y-websocket ws
fi

if ! npm list artillery &> /dev/null; then
    echo "📥 Artillery 설치 중..."
    npm install -g artillery
fi

echo "✅ 의존성 확인 완료"
echo ""

# 테스트 옵션 선택
echo "🎯 테스트 유형을 선택하세요:"
echo "1) 기본 부하 테스트 (추천)"
echo "2) Artillery WebSocket 테스트"
echo "3) 성능 모니터링만"
echo "4) 전체 테스트 (부하 + 모니터링)"

read -p "선택 (1-4): " choice

case $choice in
    1)
        echo "🎯 기본 부하 테스트 시작..."
        node yjs-load-test.js
        ;;
    2)
        echo "🎯 Artillery WebSocket 테스트 시작..."
        artillery run artillery-websocket-test.yml
        ;;
    3)
        echo "📊 성능 모니터링 시작..."
        node monitor-performance.js
        ;;
    4)
        echo "🎯 전체 테스트 시작..."
        echo "1단계: 성능 모니터링 시작..."
        node monitor-performance.js &
        MONITOR_PID=$!
        
        sleep 5
        
        echo "2단계: 부하 테스트 시작..."
        node yjs-load-test.js
        
        echo "3단계: 모니터링 종료..."
        kill $MONITOR_PID
        ;;
    *)
        echo "❌ 잘못된 선택입니다."
        exit 1
        ;;
esac

echo ""
echo "🎉 테스트 완료!"
echo ""
echo "📊 결과 분석:"
echo "   - 로그 파일들을 확인하세요"
echo "   - performance-*.log: 성능 데이터"
echo "   - report-*.txt: 최종 리포트"
echo ""
echo "💡 성능 개선 팁:"
echo "   - CPU 사용률 > 80%: 서버 스케일업 필요"
echo "   - 메모리 사용률 > 90%: 메모리 증설 필요"
echo "   - 처리량 < 200 msg/sec: 코드 최적화 필요"
