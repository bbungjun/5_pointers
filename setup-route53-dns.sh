#!/bin/bash

# Route 53 DNS 설정 자동화 스크립트

echo "🌐 Route 53 DNS 설정을 시작합니다..."

# 설정 변수
DOMAIN="ddukddak.org"
SUBDOMAIN="ws"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
TARGET_IP="43.203.235.108"

echo "📍 도메인: $DOMAIN"
echo "🔗 서브도메인: $FULL_DOMAIN"
echo "🎯 대상 IP: $TARGET_IP"

# 호스팅 존 ID 찾기
echo "🔍 호스팅 존 ID를 찾는 중..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='${DOMAIN}.'].Id" --output text 2>/dev/null | sed 's|/hostedzone/||')

if [ -z "$HOSTED_ZONE_ID" ] || [ "$HOSTED_ZONE_ID" = "None" ]; then
    echo "❌ $DOMAIN 호스팅 존을 찾을 수 없습니다."
    echo "💡 AWS 콘솔에서 수동으로 확인해주세요."
    
    # 모든 호스팅 존 나열
    echo "📋 사용 가능한 호스팅 존:"
    aws route53 list-hosted-zones --query "HostedZones[].{Name:Name,Id:Id}" --output table 2>/dev/null || {
        echo "❌ AWS CLI 인증 오류가 발생했습니다."
        echo "💡 다음 명령어로 AWS 자격 증명을 확인해주세요:"
        echo "   aws configure list"
        echo "   aws sts get-caller-identity"
        exit 1
    }
    exit 1
fi

echo "✅ 호스팅 존 ID: $HOSTED_ZONE_ID"

# 기존 레코드 확인
echo "🔍 기존 $FULL_DOMAIN A 레코드 확인 중..."
EXISTING_RECORD=$(aws route53 list-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --query "ResourceRecordSets[?Name=='${FULL_DOMAIN}.' && Type=='A'].ResourceRecords[0].Value" \
    --output text 2>/dev/null)

if [ "$EXISTING_RECORD" != "None" ] && [ -n "$EXISTING_RECORD" ]; then
    echo "⚠️  기존 A 레코드 발견: $FULL_DOMAIN -> $EXISTING_RECORD"
    if [ "$EXISTING_RECORD" = "$TARGET_IP" ]; then
        echo "✅ 이미 올바른 IP로 설정되어 있습니다!"
        echo "🧪 DNS 테스트를 진행합니다..."
        
        # DNS 해석 테스트
        RESOLVED_IP=$(nslookup $FULL_DOMAIN 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
        if [ "$RESOLVED_IP" = "$TARGET_IP" ]; then
            echo "✅ DNS 해석 성공: $FULL_DOMAIN -> $RESOLVED_IP"
            exit 0
        else
            echo "⚠️  DNS 전파 대기 중... (현재: $RESOLVED_IP, 예상: $TARGET_IP)"
        fi
    else
        echo "🔄 기존 레코드를 업데이트합니다..."
    fi
else
    echo "💡 새로운 A 레코드를 생성합니다..."
fi

# Change Batch JSON 생성
CHANGE_BATCH=$(cat <<EOF
{
    "Comment": "Add/Update A record for Y.js WebSocket server",
    "Changes": [
        {
            "Action": "UPSERT",
            "ResourceRecordSet": {
                "Name": "$FULL_DOMAIN",
                "Type": "A",
                "TTL": 300,
                "ResourceRecords": [
                    {
                        "Value": "$TARGET_IP"
                    }
                ]
            }
        }
    ]
}
EOF
)

echo "📝 DNS 레코드 변경 요청을 생성합니다..."
echo "$CHANGE_BATCH" > /tmp/route53-change-batch.json

# Route 53 레코드 변경 실행
echo "🚀 Route 53 레코드 변경을 실행합니다..."
CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id "$HOSTED_ZONE_ID" \
    --change-batch file:///tmp/route53-change-batch.json \
    --query "ChangeInfo.Id" \
    --output text 2>/dev/null)

if [ $? -eq 0 ] && [ -n "$CHANGE_ID" ]; then
    echo "✅ DNS 레코드 변경 요청이 성공했습니다!"
    echo "🔄 변경 ID: $CHANGE_ID"
    
    # 변경 상태 확인
    echo "⏳ DNS 변경 전파를 기다리는 중..."
    aws route53 wait resource-record-sets-changed --id "$CHANGE_ID" 2>/dev/null &
    WAIT_PID=$!
    
    # 타임아웃과 함께 대기
    timeout 300 bash -c "wait $WAIT_PID" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ DNS 변경이 전파되었습니다!"
    else
        echo "⏰ DNS 전파가 진행 중입니다. (최대 5분 소요)"
    fi
    
    # DNS 해석 테스트
    echo "🧪 DNS 해석 테스트를 진행합니다..."
    for i in {1..5}; do
        RESOLVED_IP=$(nslookup $FULL_DOMAIN 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
        if [ "$RESOLVED_IP" = "$TARGET_IP" ]; then
            echo "✅ DNS 해석 성공: $FULL_DOMAIN -> $RESOLVED_IP"
            break
        else
            echo "⏳ DNS 전파 대기 중... ($i/5) (현재: $RESOLVED_IP)"
            sleep 10
        fi
    done
    
    # 정리
    rm -f /tmp/route53-change-batch.json
    
    echo ""
    echo "🎉 Route 53 DNS 설정이 완료되었습니다!"
    echo ""
    echo "📋 설정 정보:"
    echo "   🌐 도메인: $FULL_DOMAIN"
    echo "   🎯 IP 주소: $TARGET_IP"
    echo "   ⏱️  TTL: 300초"
    echo ""
    echo "🧪 테스트 명령어:"
    echo "   nslookup $FULL_DOMAIN"
    echo "   curl https://$FULL_DOMAIN:1235"
    echo ""
    echo "📝 다음 단계:"
    echo "1. Y.js 서버에 SSL 인증서 설정"
    echo "2. 도메인 기반 Y.js 서버 배포"
    echo "3. WSS 연결 테스트"
    
else
    echo "❌ DNS 레코드 변경에 실패했습니다."
    echo "💡 AWS 권한을 확인하거나 수동으로 설정해주세요."
    rm -f /tmp/route53-change-batch.json
    exit 1
fi
