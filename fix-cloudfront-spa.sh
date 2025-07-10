#!/bin/bash

# CloudFront SPA 라우팅 문제 해결 스크립트
# 403, 404 에러를 index.html로 리다이렉트하도록 설정

DISTRIBUTION_ID="E1YH7W2565N4LY"
REGION="ap-northeast-2"

echo "🔧 CloudFront SPA 라우팅 문제 해결 중..."
echo "📡 Distribution ID: $DISTRIBUTION_ID"

# 현재 CloudFront 설정 가져오기
echo "📋 현재 CloudFront 설정 가져오는 중..."
aws cloudfront get-distribution-config \
  --id $DISTRIBUTION_ID \
  --region $REGION \
  --output json > current-config.json

if [ $? -ne 0 ]; then
  echo "❌ CloudFront 설정을 가져오는데 실패했습니다."
  exit 1
fi

# ETag 추출 (업데이트에 필요)
ETAG=$(jq -r '.ETag' current-config.json)
echo "📌 ETag: $ETAG"

# 현재 설정에서 DistributionConfig 부분만 추출
jq '.DistributionConfig' current-config.json > distribution-config.json

# 에러 페이지 설정 추가/수정
echo "🔧 에러 페이지 설정 추가 중..."
jq '.CustomErrorResponses = [
  {
    "ErrorCode": 403,
    "ResponsePagePath": "/index.html",
    "ResponseCode": "200",
    "ErrorCachingMinTTL": 300
  },
  {
    "ErrorCode": 404,
    "ResponsePagePath": "/index.html", 
    "ResponseCode": "200",
    "ErrorCachingMinTTL": 300
  }
]' distribution-config.json > updated-config.json

echo "✅ 새로운 설정 생성 완료"

# CloudFront 배포 업데이트
echo "🚀 CloudFront 배포 업데이트 중..."
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --distribution-config file://updated-config.json \
  --if-match $ETAG \
  --region $REGION

if [ $? -eq 0 ]; then
  echo "✅ CloudFront 설정 업데이트 성공!"
  echo "⏳ 배포 완료까지 5-15분 정도 소요됩니다."
  echo ""
  echo "📋 설정된 에러 페이지:"
  echo "  - 403 Forbidden → /index.html (200)"
  echo "  - 404 Not Found → /index.html (200)"
  echo ""
  echo "🔍 배포 상태 확인:"
  echo "aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status'"
else
  echo "❌ CloudFront 설정 업데이트 실패"
  exit 1
fi

# 임시 파일 정리
rm -f current-config.json distribution-config.json updated-config.json

echo "🎉 SPA 라우팅 문제 해결 완료!"
echo "💡 이제 새로고침해도 Access Denied 에러가 발생하지 않습니다."
