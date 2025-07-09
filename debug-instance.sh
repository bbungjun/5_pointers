#!/bin/bash

echo "🔍 EC2 인스턴스 디버깅 스크립트"
echo "================================"

# 현재 설정 확인
echo "📋 현재 AWS 설정:"
echo "리전: $(aws configure get region)"
echo "AWS CLI 버전: $(aws --version)"
echo ""

# 모든 인스턴스 나열 (모든 상태)
echo "📋 모든 EC2 인스턴스 (모든 상태):"
aws ec2 describe-instances \
  --region ap-northeast-2 \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0],PublicIpAddress,PrivateIpAddress]' \
  --output table

echo ""

# Subdomain 관련 인스턴스 검색
echo "📋 'Subdomain' 포함 인스턴스:"
aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=tag:Name,Values=*Subdomain*" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0],PublicIpAddress]' \
  --output table

echo ""

# PageCube 관련 인스턴스 검색
echo "📋 'PageCube' 포함 인스턴스:"
aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=tag:Name,Values=*PageCube*" \
  --query 'Reservations[].Instances[].[InstanceId,State.Name,Tags[?Key==`Name`].Value|[0],PublicIpAddress]' \
  --output table

echo ""

# 실행 중인 인스턴스만
echo "📋 실행 중인 모든 인스턴스:"
aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].[InstanceId,Tags[?Key==`Name`].Value|[0],PublicIpAddress]' \
  --output table

echo ""

# 정확한 태그 검색
echo "📋 정확한 태그로 검색 (PageCube-Subdomain-Simple):"
INSTANCE_ID=$(aws ec2 describe-instances \
  --region ap-northeast-2 \
  --filters "Name=tag:Name,Values=PageCube-Subdomain-Simple" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].InstanceId' \
  --output text)

if [ -z "$INSTANCE_ID" ]; then
  echo "❌ 인스턴스를 찾을 수 없음"
  
  # 다른 가능한 태그 이름들 시도
  echo ""
  echo "🔍 다른 가능한 태그 이름들 시도:"
  
  for tag in "PageCube-Subdomain" "Subdomain-Simple" "pagecube-subdomain" "PageCube Subdomain Simple"; do
    echo "  - 태그: $tag"
    RESULT=$(aws ec2 describe-instances \
      --region ap-northeast-2 \
      --filters "Name=tag:Name,Values=$tag" \
      --query 'Reservations[].Instances[].[InstanceId,State.Name]' \
      --output text)
    
    if [ -n "$RESULT" ]; then
      echo "    ✅ 발견: $RESULT"
    else
      echo "    ❌ 없음"
    fi
  done
else
  echo "✅ 인스턴스 발견: $INSTANCE_ID"
fi

echo ""
echo "🔍 권장사항:"
echo "1. 인스턴스 태그 이름을 정확히 확인하세요"
echo "2. 인스턴스가 실행 중인지 확인하세요"
echo "3. 올바른 리전(ap-northeast-2)에 있는지 확인하세요"