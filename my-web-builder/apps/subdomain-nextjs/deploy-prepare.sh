#!/bin/bash

# 서브도메인 서버 배포 스크립트
# 컴포넌트 파일들을 서브도메인 서버로 복사하고 배포합니다.

echo "🚀 서브도메인 서버 배포 시작..."

# 1. 서브도메인 서버 디렉토리로 이동
cd /home/yjlee/5_pointers/my-web-builder/apps/subdomain-nextjs

# 2. 기존 컴포넌트 디렉토리 삭제 및 재생성
rm -rf components
mkdir -p components/renderers
mkdir -p components/editors

# 3. Frontend 컴포넌트들을 서브도메인 서버로 복사
echo "📦 컴포넌트 파일 복사 중..."

# ComponentRenderers 복사
cp -r ../frontend/src/pages/NoCodeEditor/ComponentRenderers/* components/renderers/
cp -r ../frontend/src/pages/NoCodeEditor/ComponentEditors/* components/editors/

# 4. config 파일 복사
cp ../frontend/src/config.js components/

# 5. 복사된 컴포넌트들의 config import 경로 수정
echo "🔧 config import 경로 수정 중..."
find components/renderers -name "*.jsx" -exec sed -i "s|from '../../../config'|from '../config'|g" {} \;
find components/renderers -name "*.jsx" -exec sed -i "s|from '../../../config.js'|from '../config.js'|g" {} \;

# 6. 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# 7. 빌드
echo "🔨 빌드 중..."
npm run build

echo "✅ 서브도메인 서버 배포 준비 완료!"
echo "📁 컴포넌트 파일이 components/ 디렉토리에 복사되었습니다."
echo "🔧 config import 경로가 수정되었습니다."
echo "🚀 이제 EC2에 배포할 수 있습니다."
