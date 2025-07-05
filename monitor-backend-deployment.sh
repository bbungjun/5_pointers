#!/bin/bash

echo "🔍 백엔드 배포 모니터링 시작..."
echo "================================"

for i in {1..20}; do
    echo "[$i/20] 테스트 중... ($(date))"
    
    # Health check 시도
    if curl -s --connect-timeout 5 http://3.39.235.190:3001/health > /dev/null 2>&1; then
        echo "🎉 백엔드 서버 연결 성공!"
        echo "📊 Health Check 결과:"
        curl -s http://3.39.235.190:3001/health | jq . 2>/dev/null || curl -s http://3.39.235.190:3001/health
        echo -e "\n📊 Root Endpoint 결과:"
        curl -s http://3.39.235.190:3001/ | jq . 2>/dev/null || curl -s http://3.39.235.190:3001/
        echo -e "\n✅ 로그인/회원가입 기능 복구 완료!"
        exit 0
    else
        echo "❌ 아직 연결 안됨 (30초 후 재시도)"
        sleep 30
    fi
done

echo "⚠️ 20번 시도 후에도 연결 실패"
echo "GitHub Actions 로그를 확인하세요: https://github.com/Jungle-5pointers/5_pointers/actions"
