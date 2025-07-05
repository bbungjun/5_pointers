#!/bin/bash

echo "🚀 5Pointers 배포 트리거 스크립트"
echo "================================"

# 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "현재 브랜치: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️ main 브랜치가 아닙니다. main 브랜치로 전환하시겠습니까? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git checkout main
        git pull origin main
    else
        echo "❌ 배포는 main 브랜치에서만 가능합니다."
        exit 1
    fi
fi

# 변경사항 확인
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 변경사항이 있습니다:"
    git status --short
    
    echo -e "\n변경사항을 커밋하시겠습니까? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        echo "커밋 메시지를 입력하세요:"
        read -r commit_message
        
        git add .
        git commit -m "$commit_message"
        echo "✅ 커밋 완료"
    else
        echo "❌ 변경사항을 커밋하지 않으면 배포할 수 없습니다."
        exit 1
    fi
else
    echo "📝 변경사항이 없습니다. 빈 커밋으로 배포를 트리거하시겠습니까? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git commit --allow-empty -m "🚀 Trigger deployment - $(date)"
        echo "✅ 빈 커밋으로 배포 트리거"
    else
        echo "❌ 배포를 취소합니다."
        exit 1
    fi
fi

# Push to main
echo "🚀 main 브랜치에 푸시 중..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ 푸시 성공! GitHub Actions에서 배포가 시작됩니다."
    echo ""
    echo "📋 배포 상태 확인:"
    echo "- GitHub Actions: https://github.com/Jungle-5pointers/5_pointers/actions"
    echo "- 백엔드: http://3.39.235.190:3001"
    echo "- 프론트엔드: http://3.35.227.214"
    echo "- 서브도메인: http://13.125.227.27:3002"
    echo "- WebSocket: ws://43.203.138.8:3003"
else
    echo "❌ 푸시 실패"
    exit 1
fi
