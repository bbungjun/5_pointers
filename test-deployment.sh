#!/bin/bash

echo "🚀 배포 테스트 스크립트"
echo "===================="

# 1. 로컬 빌드 테스트
echo "1. 로컬 빌드 테스트..."

echo "📦 백엔드 빌드 테스트:"
cd backend
if npm run build; then
    echo "✅ 백엔드 빌드 성공"
    ls -la dist/
else
    echo "❌ 백엔드 빌드 실패"
    exit 1
fi

cd ..

echo -e "\n📦 프론트엔드 빌드 테스트:"
cd my-web-builder/apps/frontend

# 환경 변수 파일 생성
echo "VITE_API_URL=http://3.39.235.190:3001" > .env.production
echo "VITE_WEBSOCKET_URL=ws://43.203.138.8:3003" >> .env.production

if npm run build; then
    echo "✅ 프론트엔드 빌드 성공"
    ls -la dist/
else
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

cd ../../..

# 2. Git 상태 확인
echo -e "\n2. Git 상태 확인..."
git status

# 3. 배포 준비 확인
echo -e "\n3. 배포 준비 상태 확인..."

echo "✅ 워크플로우 파일들:"
ls -la .github/workflows/*.yml | grep -v disabled

echo -e "\n📋 필요한 GitHub Secrets:"
echo "- DB_HOST: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com"
echo "- DB_PORT: 3306"
echo "- DB_USERNAME: (RDS 사용자명)"
echo "- DB_PASSWORD: (RDS 비밀번호)"
echo "- DB_DATABASE: jungle"
echo "- JWT_SECRET: (JWT 비밀키)"
echo "- AWS_ACCESS_KEY_ID: (AWS 액세스 키)"
echo "- AWS_SECRET_ACCESS_KEY: (AWS 시크릿 키)"
echo "- AWS_REGION: ap-northeast-2"

echo -e "\n🎯 배포 트리거 방법:"
echo "1. 변경사항 커밋: git add . && git commit -m 'Fix Vite build command'"
echo "2. main 브랜치에 푸시: git push origin main"
echo "3. GitHub Actions에서 배포 상태 확인"

echo -e "\n📊 배포 후 확인할 URL들:"
echo "- 백엔드 API: http://3.39.235.190:3001"
echo "- 프론트엔드: http://3.35.227.214"
echo "- 서브도메인: http://13.125.227.27:3002"
echo "- WebSocket: ws://43.203.138.8:3003"

echo -e "\n✅ 로컬 빌드 테스트 완료!"
echo "이제 git push로 배포를 트리거할 수 있습니다."
