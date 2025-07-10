#!/bin/bash
set -e

echo "🚀 Next.js 서브도메인 서버 배포 시작..."

# 현재 작업 디렉토리 확인
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEXTJS_DIR="$SCRIPT_DIR/my-web-builder/apps/subdomain-nextjs"

echo "📁 Next.js 프로젝트 디렉토리: $NEXTJS_DIR"

# Next.js 프로젝트 디렉토리로 이동
cd "$NEXTJS_DIR"

# 프로젝트 빌드
echo "🔨 Next.js 프로젝트 빌드 중..."
npm install
npm run build

# 배포 패키지 생성
echo "📦 배포 패키지 생성 중..."
tar -czf nextjs-subdomain-manual.tar.gz .next/ package.json pages/ node_modules/ next.config.js styles/ middleware.ts

# EC2 인스턴스에 직접 배포
echo "🚀 EC2 인스턴스에 배포 중..."

# 배포 스크립트 생성
cat > deploy-nextjs.sh << 'DEPLOY'
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
DEPLOY

echo "📤 EC2로 파일 전송 및 배포 실행..."

# EC2 인스턴스 정보
EC2_IP="13.209.22.112"
INSTANCE_ID="i-0895813dc286d929c"

# AWS SSM을 통한 배포 (Session Manager 사용)
echo "🌐 AWS SSM을 통한 배포 시도..."

# 먼저 파일을 S3에 업로드
echo "📤 S3에 배포 패키지 업로드..."
aws s3 cp nextjs-subdomain-manual.tar.gz s3://elasticbeanstalk-ap-northeast-2-490004614784/manual/nextjs-subdomain-manual.tar.gz --region ap-northeast-2 || {
  echo "❌ S3 업로드 실패. 로컬에서 직접 배포를 시도합니다."
  
  # 대안: SSH 키를 사용한 직접 배포 (만약 키가 있다면)
  echo "🔑 SSH를 통한 직접 배포 시도..."
  if [ -f ~/.ssh/pagecube-subdomain.pem ]; then
    echo "📤 SCP로 파일 전송..."
    scp -i ~/.ssh/pagecube-subdomain.pem nextjs-subdomain-manual.tar.gz ubuntu@$EC2_IP:/tmp/
    scp -i ~/.ssh/pagecube-subdomain.pem deploy-nextjs.sh ubuntu@$EC2_IP:/tmp/
    
    echo "🚀 SSH로 배포 실행..."
    ssh -i ~/.ssh/pagecube-subdomain.pem ubuntu@$EC2_IP "chmod +x /tmp/deploy-nextjs.sh && /tmp/deploy-nextjs.sh"
  else
    echo "❌ SSH 키를 찾을 수 없습니다. 수동 배포가 필요합니다."
    echo ""
    echo "수동 배포 방법:"
    echo "1. nextjs-subdomain-manual.tar.gz 파일을 EC2 인스턴스로 전송"
    echo "2. deploy-nextjs.sh 스크립트를 EC2 인스턴스로 전송"
    echo "3. EC2에서 스크립트 실행: chmod +x deploy-nextjs.sh && ./deploy-nextjs.sh"
    exit 1
  fi
  exit 0
}

# SSM을 통한 배포 실행
echo "🚀 SSM을 통한 배포 실행..."
aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=[
    "cd /tmp",
    "wget https://elasticbeanstalk-ap-northeast-2-490004614784.s3.ap-northeast-2.amazonaws.com/manual/nextjs-subdomain-manual.tar.gz",
    "pm2 delete all || true",
    "sudo pkill -f \"node.*next\" || true", 
    "sudo pkill -f \"next.*start\" || true",
    "sleep 3",
    "sudo rm -rf /opt/nextjs-subdomain",
    "sudo mkdir -p /opt/nextjs-subdomain", 
    "sudo chown -R ubuntu:ubuntu /opt/nextjs-subdomain",
    "cd /opt/nextjs-subdomain",
    "tar -xzf /tmp/nextjs-subdomain-manual.tar.gz",
    "export NODE_ENV=production",
    "export PORT=3000", 
    "export API_BASE_URL=https://pagecube.net/api",
    "pm2 start npm --name nextjs-subdomain -- start",
    "pm2 save",
    "pm2 startup --user ubuntu || true",
    "sleep 10",
    "pm2 status",
    "curl -f http://localhost:3000 || pm2 logs nextjs-subdomain --lines 20"
  ]' \
  --comment "Deploy Next.js Subdomain Server Manual" \
  --region ap-northeast-2

echo "✅ 배포 명령이 전송되었습니다."
echo "📋 AWS Systems Manager 콘솔에서 실행 상태를 확인하세요."

# 정리
rm -f nextjs-subdomain-manual.tar.gz deploy-nextjs.sh

echo "🎉 Next.js 서브도메인 서버 배포 스크립트 실행 완료!"