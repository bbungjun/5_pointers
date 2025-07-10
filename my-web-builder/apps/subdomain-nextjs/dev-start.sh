#!/bin/bash

# 개발 환경에서 서브도메인 서버 실행 스크립트
# Frontend 컴포넌트를 복사하고 개발 서버를 시작합니다.

echo "🚀 개발 환경 서브도메인 서버 시작..."

# 1. 서브도메인 서버 디렉토리로 이동
cd /home/yjlee/5_pointers/my-web-builder/apps/subdomain-nextjs

# 2. 최신 컴포넌트 복사
echo "📦 최신 컴포넌트 복사 중..."
rm -rf components
mkdir -p components/renderers
mkdir -p components/editors

# Frontend 컴포넌트들을 서브도메인 서버로 복사
cp -r ../frontend/src/pages/NoCodeEditor/ComponentRenderers/* components/renderers/
cp -r ../frontend/src/pages/NoCodeEditor/ComponentEditors/* components/editors/
cp ../frontend/src/config.js components/

# config import 경로 수정
find components/renderers -name "*.jsx" -exec sed -i "s|from '../../../config'|from '../config'|g" {} \;
find components/renderers -name "*.jsx" -exec sed -i "s|from '../../../config.js'|from '../config.js'|g" {} \;

# 3. 개발 서버 시작
echo "🔄 개발 서버 시작 중..."
npm run dev
