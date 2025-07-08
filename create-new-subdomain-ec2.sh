#!/bin/bash
set -e

echo "🚀 새로운 서브도메인 서버 EC2 인스턴스 생성..."

# User Data 스크립트 생성 (서버 자동 설치 및 시작)
cat > user-data-script.sh << 'USERDATA'
#!/bin/bash
exec > /var/log/user-data.log 2>&1
set -e

echo "🔧 EC2 인스턴스 초기 설정 시작..."

# 시스템 업데이트
apt-get update -y

# Node.js 20 설치
echo "📦 Node.js 20 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# AWS CLI 설치 (최신 버전)
echo "📦 AWS CLI 설치 중..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install

# SSM Agent 설치
echo "📦 SSM Agent 설치 중..."
apt-get install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl start amazon-ssm-agent

# 서브도메인 서버 파일 다운로드 및 설정
echo "📥 서브도메인 서버 설정 중..."
cd /home/ubuntu

# S3에서 파일 다운로드
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/auto-deploy/subdomain-server.js ./ --region ap-northeast-2
aws s3 cp s3://elasticbeanstalk-ap-northeast-2-490004614784/auto-deploy/subdomain-proxy.js ./ --region ap-northeast-2

# 앱 디렉토리 생성
mkdir -p /opt/pagecube-subdomain
cp subdomain-server.js /opt/pagecube-subdomain/
cp subdomain-proxy.js /opt/pagecube-subdomain/
cd /opt/pagecube-subdomain

# package.json 생성
cat > package.json << 'PKG'
{
  "name": "pagecube-subdomain-server",
  "version": "1.0.0",
  "main": "subdomain-server.js",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "mysql2": "^3.6.0"
  }
}
PKG

# 의존성 설치
npm install --production

# deployed-sites 디렉토리 생성
mkdir -p deployed-sites

# 소유권 설정
chown -R ubuntu:ubuntu /opt/pagecube-subdomain
chown -R ubuntu:ubuntu /home/ubuntu

# 서버 자동 시작 서비스 생성
cat > /etc/systemd/system/pagecube-subdomain.service << 'SERVICE'
[Unit]
Description=PageCube Subdomain Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/pagecube-subdomain
ExecStart=/usr/bin/node subdomain-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
SERVICE

# 서비스 활성화 및 시작
systemctl daemon-reload
systemctl enable pagecube-subdomain
systemctl start pagecube-subdomain

echo "✅ 서브도메인 서버 설정 완료!"
echo "📊 서비스 상태: $(systemctl is-active pagecube-subdomain)"

# 서버 테스트
sleep 10
if curl -f http://localhost:3001 >/dev/null 2>&1; then
    echo "✅ 서버가 정상적으로 실행 중입니다!"
else
    echo "❌ 서버 시작 실패, 로그 확인 필요"
fi

echo "🎉 EC2 인스턴스 초기 설정 완료!"
USERDATA

# 새 EC2 인스턴스 생성
echo "🔧 새 EC2 인스턴스 생성 중..."

# 기존 인스턴스 정보 가져오기 (보안 그룹, 서브넷 등)
OLD_INSTANCE_INFO=$(aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=tag:Name,Values=PageCube-Subdomain-Simple" \
  --query 'Reservations[].Instances[].[SecurityGroups[0].GroupId,SubnetId,KeyName]' \
  --output text)

SECURITY_GROUP=$(echo "$OLD_INSTANCE_INFO" | awk '{print $1}')
SUBNET_ID=$(echo "$OLD_INSTANCE_INFO" | awk '{print $2}')
KEY_NAME=$(echo "$OLD_INSTANCE_INFO" | awk '{print $3}')

echo "📋 기존 설정 사용:"
echo "- Security Group: $SECURITY_GROUP"
echo "- Subnet: $SUBNET_ID"
echo "- Key Name: $KEY_NAME"

# 새 인스턴스 생성
NEW_INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c2acfcb2ac4d02a0 \
  --instance-type t3.micro \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SECURITY_GROUP" \
  --subnet-id "$SUBNET_ID" \
  --user-data file://user-data-script.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=PageCube-Subdomain-New}]' \
  --region ap-northeast-2 \
  --query 'Instances[0].InstanceId' \
  --output text)

echo "✅ 새 인스턴스 생성됨: $NEW_INSTANCE_ID"

# 인스턴스 시작 대기
echo "⏳ 인스턴스 시작 대기 중..."
aws ec2 wait instance-running --instance-ids $NEW_INSTANCE_ID --region ap-northeast-2

# 새 인스턴스 IP 주소 가져오기
NEW_IP=$(aws ec2 describe-instances \
  --region ap-northeast-2 \
  --instance-ids $NEW_INSTANCE_ID \
  --query 'Reservations[].Instances[].PublicIpAddress' \
  --output text)

echo "🌐 새 인스턴스 IP: $NEW_IP"

# 정리
rm user-data-script.sh

echo "✅ 새 EC2 인스턴스 생성 완료!"
echo "📋 다음 단계:"
echo "1. 3-5분 대기 (User Data 스크립트 실행)"
echo "2. DNS 업데이트: *.pagecube.net → $NEW_IP"
echo "3. 기존 인스턴스 종료"
echo ""
echo "🔍 새 인스턴스 정보:"
echo "- Instance ID: $NEW_INSTANCE_ID"
echo "- IP Address: $NEW_IP"
echo "- Name: PageCube-Subdomain-New"
