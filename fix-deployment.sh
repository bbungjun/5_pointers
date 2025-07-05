#!/bin/bash

echo "🚀 5Pointers 배포 문제 해결 스크립트"
echo "=================================="

# 1. GitHub Actions 워크플로우 상태 확인
echo "1. GitHub Actions 워크플로우 확인 중..."
if [ -f ".github/workflows/5pointers-backend-deploy.yml" ]; then
    echo "✅ 백엔드 배포 워크플로우 존재"
else
    echo "❌ 백엔드 배포 워크플로우 없음"
fi

if [ -f ".github/workflows/5pointers-frontend-deploy.yml" ]; then
    echo "✅ 프론트엔드 배포 워크플로우 존재"
else
    echo "❌ 프론트엔드 배포 워크플로우 없음"
fi

# 2. Self-hosted runner 상태 확인
echo -e "\n2. Self-hosted runner 설정 확인..."
echo "다음 서버들이 GitHub Actions runner로 등록되어 있어야 합니다:"
echo "- backend-server (3.39.235.190:3001)"
echo "- frontend-server (3.35.227.214:80)"
echo "- subdomain-server (13.125.227.27:3002)"
echo "- websocket-server (43.203.138.8:3003)"

# 3. 환경 변수 체크
echo -e "\n3. 필요한 GitHub Secrets 확인..."
echo "다음 secrets이 GitHub 저장소에 설정되어 있어야 합니다:"
echo "- DB_HOST: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com"
echo "- DB_PORT: 3306"
echo "- DB_USERNAME: (RDS 사용자명)"
echo "- DB_PASSWORD: (RDS 비밀번호)"
echo "- DB_DATABASE: jungle"
echo "- JWT_SECRET: (JWT 비밀키)"
echo "- AWS_ACCESS_KEY_ID: (AWS 액세스 키)"
echo "- AWS_SECRET_ACCESS_KEY: (AWS 시크릿 키)"
echo "- AWS_REGION: ap-northeast-2"

# 4. 로컬 테스트
echo -e "\n4. 로컬 백엔드 빌드 테스트..."
cd backend
if [ -f "package.json" ]; then
    echo "백엔드 의존성 설치 중..."
    npm install
    echo "백엔드 빌드 테스트 중..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ 백엔드 빌드 성공"
    else
        echo "❌ 백엔드 빌드 실패"
    fi
else
    echo "❌ backend/package.json 없음"
fi

cd ..

# 5. 프론트엔드 테스트
echo -e "\n5. 프론트엔드 빌드 테스트..."
cd my-web-builder/apps/frontend
if [ -f "package.json" ]; then
    echo "프론트엔드 의존성 설치 중..."
    npm install --legacy-peer-deps
    echo "프론트엔드 빌드 테스트 중..."
    npm run build
    if [ $? -eq 0 ]; then
        echo "✅ 프론트엔드 빌드 성공"
    else
        echo "❌ 프론트엔드 빌드 실패"
    fi
else
    echo "❌ my-web-builder/apps/frontend/package.json 없음"
fi

cd ../../..

echo -e "\n🔧 해결 방법:"
echo "1. AWS RDS 보안 그룹에서 서버 IP들 허용"
echo "2. GitHub 저장소 Settings > Secrets에서 환경 변수 설정"
echo "3. 각 서버에서 GitHub Actions runner 재시작"
echo "4. main 브랜치에 push하여 배포 트리거"

echo -e "\n📋 다음 명령어로 배포 트리거:"
echo "git add ."
echo "git commit -m '🚀 Fix deployment configuration'"
echo "git push origin main"
