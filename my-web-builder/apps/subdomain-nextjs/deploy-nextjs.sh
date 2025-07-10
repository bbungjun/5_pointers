#!/bin/bash
set -e

echo "🔧 Next.js 서브도메인 서버 설정 중..."

# 기존 프로세스 정리
echo "🔄 기존 프로세스 정리..."
pm2 delete all || true
sudo pkill -f "node.*next" || true
sudo pkill -f "next.*start" || true
sleep 3

# 앱 디렉토리 설정
echo "📁 앱 디렉토리 설정..."
sudo rm -rf /opt/nextjs-subdomain
sudo mkdir -p /opt/nextjs-subdomain
sudo chown -R ubuntu:ubuntu /opt/nextjs-subdomain

# 압축 파일 복사 및 압축 해제
echo "📥 파일 압축 해제..."
cd /opt/nextjs-subdomain
tar -xzf /tmp/nextjs-subdomain-manual.tar.gz

# 환경 변수 설정
echo "🔧 환경 변수 설정..."
export NODE_ENV=production
export PORT=3000
export API_BASE_URL="https://pagecube.net/api"

# PM2로 Next.js 서버 시작
echo "🚀 Next.js 서버 시작..."
pm2 start npm --name "nextjs-subdomain" -- start
pm2 save
pm2 startup

# 서버 상태 확인
echo "✅ 서버 상태 확인..."
sleep 10
pm2 status

# 포트 테스트
echo "🔍 포트 3000 테스트..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ Next.js 서버가 포트 3000에서 응답 중"
else
  echo "⚠️ 서버 응답 없음, 로그 확인"
  pm2 logs nextjs-subdomain --lines 20
fi

echo "🎉 Next.js 서브도메인 서버 배포 완료!"
echo "📋 PM2 상태: pm2 status"
echo "📋 로그 확인: pm2 logs nextjs-subdomain"
