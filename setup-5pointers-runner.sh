#!/bin/bash

# 5Pointers GitHub Actions Self-hosted Runner 설정 스크립트
# 사용법: ./setup-5pointers-runner.sh [GITHUB_TOKEN] [RUNNER_NAME]

GITHUB_TOKEN=$1
RUNNER_NAME=$2
REPO_URL="https://github.com/Jungle-5pointers/5_pointers"

if [ -z "$GITHUB_TOKEN" ] || [ -z "$RUNNER_NAME" ]; then
    echo "사용법: $0 [GITHUB_TOKEN] [RUNNER_NAME]"
    echo "예시: $0 ghp_xxxx backend-server"
    exit 1
fi

echo "🚀 Setting up GitHub Actions Runner for 5Pointers..."

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 필수 패키지 설치
sudo apt-get install -y curl wget unzip git jq bc

# Node.js 18 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm 설치 (monorepo 지원)
npm install -g pnpm

# Docker 설치
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker 권한 설정
sudo usermod -aG docker ubuntu

# PM2 설치
sudo npm install -g pm2

# Nginx 설치 (프론트엔드 서버용)
sudo apt-get install -y nginx

# GitHub Actions Runner 디렉토리 생성
mkdir -p /home/ubuntu/actions-runner && cd /home/ubuntu/actions-runner

# GitHub Actions Runner 다운로드
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Runner 등록을 위한 토큰 생성
echo "🔑 Getting registration token..."
REGISTRATION_TOKEN=$(curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Jungle-5pointers/5_pointers/actions/runners/registration-token | jq -r .token)

if [ "$REGISTRATION_TOKEN" = "null" ]; then
    echo "❌ GitHub token이 유효하지 않거나 권한이 부족합니다."
    echo "필요한 권한: repo, workflow, admin:repo_hook"
    exit 1
fi

# Runner 설정
echo "⚙️ Configuring runner..."
./config.sh --url $REPO_URL --token $REGISTRATION_TOKEN --name $RUNNER_NAME --work _work --unattended --labels $RUNNER_NAME

# Runner를 서비스로 설정
sudo ./svc.sh install
sudo ./svc.sh start

# 방화벽 설정
sudo ufw allow 22,80,443,3001,3002,3003/tcp

echo "✅ GitHub Actions Runner '$RUNNER_NAME' 설정 완료!"
echo "📊 Runner 상태 확인: sudo ./svc.sh status"
echo "🔧 설치된 도구들:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - pnpm: $(pnpm --version)"
echo "   - Docker: $(docker --version)"
echo "   - PM2: $(pm2 --version)"

# 작업 디렉토리 생성
mkdir -p /home/ubuntu/5pointers-workspace
cd /home/ubuntu/5pointers-workspace

echo "🎉 5Pointers GitHub Actions Runner 설정이 완료되었습니다!"
echo "이제 GitHub에서 Actions를 실행할 수 있습니다."
