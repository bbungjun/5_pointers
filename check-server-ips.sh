#!/bin/bash

echo "🔍 서버 IP 주소 확인"
echo "=================="

echo "📍 현재 개발자 IP:"
curl -s https://api.ipify.org
echo ""

echo -e "\n📍 각 서버 IP 확인:"

echo "1. 백엔드 서버 (3.39.235.190:3001):"
curl -s --connect-timeout 5 http://3.39.235.190:3001/health 2>/dev/null && echo "✅ 응답 가능" || echo "❌ 응답 없음"

echo "2. 프론트엔드 서버 (3.35.227.214:80):"
curl -s --connect-timeout 5 http://3.35.227.214 2>/dev/null | head -c 50 && echo "... ✅ 응답 가능" || echo "❌ 응답 없음"

echo "3. 서브도메인 서버 (13.125.227.27:3002):"
curl -s --connect-timeout 5 http://13.125.227.27:3002 2>/dev/null | head -c 50 && echo "... ✅ 응답 가능" || echo "❌ 응답 없음"

echo "4. WebSocket 서버 (43.203.138.8:3003):"
curl -s --connect-timeout 5 http://43.203.138.8:3003 2>/dev/null && echo "✅ 응답 가능" || echo "❌ 응답 없음"

echo -e "\n📋 RDS 보안 그룹 설정 권장사항:"
echo "🔒 최소 권한 설정 (권장):"
echo "  - $(curl -s https://api.ipify.org)/32 (현재 개발자 IP)"
echo "  - 3.39.235.190/32 (백엔드 서버 - 필수)"

echo -e "\n🔧 AWS 콘솔 설정 방법:"
echo "1. AWS RDS → pointers-mysql-db → 연결 및 보안"
echo "2. VPC 보안 그룹 클릭 → 인바운드 규칙 → 규칙 편집"
echo "3. MySQL/Aurora (3306) 포트로 위 IP들 추가"

echo -e "\n⚠️ 보안 주의사항:"
echo "- 0.0.0.0/0 사용 금지 (모든 IP 허용)"
echo "- /32 사용으로 특정 IP만 허용"
echo "- 불필요한 서버 IP는 추가하지 않음"
