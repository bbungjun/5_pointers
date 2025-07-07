#!/bin/bash

# 5Pointers 서브도메인 설정 스크립트
# 배포된 모든 서브도메인을 /etc/hosts에 자동으로 추가

echo "🔧 5Pointers 서브도메인 설정을 시작합니다..."

# MySQL에서 배포된 서브도메인 목록 가져오기
SUBDOMAINS=$(mysql -u root -p0000 jungle -N -e "SELECT subdomain FROM pages WHERE status = 'DEPLOYED';" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ 데이터베이스 연결 실패. MySQL 서버가 실행 중인지 확인하세요."
    exit 1
fi

# /etc/hosts 파일 백업
sudo cp /etc/hosts /etc/hosts.backup.$(date +%Y%m%d_%H%M%S)
echo "📦 /etc/hosts 파일 백업 완료"

# 기존 5Pointers 서브도메인 엔트리 제거
sudo sed -i '/# 5Pointers Subdomains - START/,/# 5Pointers Subdomains - END/d' /etc/hosts

# 새로운 서브도메인 엔트리 추가
echo "# 5Pointers Subdomains - START" | sudo tee -a /etc/hosts > /dev/null

for subdomain in $SUBDOMAINS; do
    if [ ! -z "$subdomain" ]; then
        echo "127.0.0.1   ${subdomain}.localhost" | sudo tee -a /etc/hosts > /dev/null
        echo "  ✅ ${subdomain}.localhost:3001 추가됨"
    fi
done

echo "# 5Pointers Subdomains - END" | sudo tee -a /etc/hosts > /dev/null

echo ""
echo "🎉 서브도메인 설정 완료!"
echo ""
echo "📋 설정된 서브도메인 목록:"
for subdomain in $SUBDOMAINS; do
    if [ ! -z "$subdomain" ]; then
        echo "  🌐 http://${subdomain}.localhost:3001"
    fi
done

echo ""
echo "🔍 테스트 방법:"
echo "  1. 브라우저에서 위 URL 중 하나를 직접 입력하세요"
echo "  2. 또는 curl로 테스트: curl http://testsite.localhost:3001"
echo ""
echo "🔄 새로운 서브도메인이 배포되면 이 스크립트를 다시 실행하세요:"
echo "  bash setup-subdomains.sh"