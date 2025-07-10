#!/bin/bash
set -e

echo "🚀 Next.js 서브도메인 서버 수동 배포 시작..."

# GitHub에서 최신 코드 가져오기
echo "📥 GitHub에서 최신 코드 다운로드..."
cd /tmp
rm -rf 5_pointers-big_fix*
curl -L "https://github.com/Jungle-5pointers/5_pointers/archive/refs/heads/big_fix.tar.gz" -o big_fix.tar.gz
tar -xzf big_fix.tar.gz

# Next.js 프로젝트 빌드
echo "🔨 Next.js 프로젝트 빌드..."
cd 5_pointers-big_fix/my-web-builder/apps/subdomain-nextjs
npm install
npm run build

# 배포 패키지 생성
echo "📦 배포 패키지 생성..."
tar -czf /tmp/nextjs-subdomain-manual.tar.gz .next/ package.json pages/ node_modules/ next.config.js styles/ middleware.ts

# 기존 프로세스 정리
echo "🔄 기존 프로세스 정리..."
pm2 delete all || true
sudo pkill -f "node.*next" || true
sudo pkill -f "next.*start" || true
sudo pkill -f "subdomain-server" || true
sleep 5

# 앱 디렉토리 설정
echo "📁 앱 디렉토리 설정..."
sudo rm -rf /opt/nextjs-subdomain
sudo mkdir -p /opt/nextjs-subdomain
sudo chown -R ubuntu:ubuntu /opt/nextjs-subdomain

# 배포 패키지 압축 해제
echo "📤 배포 패키지 압축 해제..."
cd /opt/nextjs-subdomain
tar -xzf /tmp/nextjs-subdomain-manual.tar.gz

# 환경 변수 설정
echo "🔧 환경 변수 설정..."
export NODE_ENV=production
export PORT=3000
export API_BASE_URL=https://pagecube.net/api

# PM2로 Next.js 서버 시작
echo "🚀 Next.js 서버 시작..."
pm2 start npm --name nextjs-subdomain -- start
pm2 save
pm2 startup ubuntu --user ubuntu || true

# 서버 상태 확인
echo "✅ 서버 상태 확인..."
sleep 10
pm2 status

# 포트 테스트
echo "🔍 포트 3000 테스트..."
sleep 5
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ Next.js 서버가 포트 3000에서 응답 중"
else
  echo "⚠️ 서버 응답 없음, 로그 확인"
  pm2 logs nextjs-subdomain --lines 20
fi

echo "🎉 Next.js 서브도메인 서버 배포 완료!"
echo "📋 PM2 상태: pm2 status"
echo "📋 로그 확인: pm2 logs nextjs-subdomain"