#!/bin/bash

echo "🔍 RDS 테이블 생성 상태 확인"
echo "=========================="

echo "1. RDS 연결 문제 해결 후 백엔드 실행으로 테이블 자동 생성"
echo "   - TypeORM synchronize: true 설정으로 자동 생성됨"
echo ""

echo "2. 예상 테이블 목록:"
echo "   ✓ users - 사용자 정보"
echo "   ✓ pages - 페이지 정보"  
echo "   ✓ page_members - 페이지 멤버 정보"
echo "   ✓ submissions - 제출 정보"
echo "   ✓ templates - 템플릿 정보"
echo ""

echo "3. 테이블 생성 확인 방법:"
echo "   a) RDS 보안 그룹 설정 완료 후"
echo "   b) 백엔드 서버 실행: cd backend && npm run start:dev"
echo "   c) 테이블 확인: node check-rds-tables.js"
echo ""

echo "4. 현재 상태:"
if [ -f "backend/dist/main.js" ]; then
    echo "   ✅ 백엔드 빌드 완료"
else
    echo "   ⚠️ 백엔드 빌드 필요: cd backend && npm run build"
fi

echo ""
echo "5. 테이블이 없는 경우 해결 방법:"
echo "   - RDS 연결 성공 후 백엔드 서버를 한 번 실행하면 자동으로 테이블 생성"
echo "   - synchronize: true 설정으로 엔티티 기반 자동 생성"
echo ""

echo "📋 다음 단계:"
echo "1. AWS RDS 보안 그룹 설정 (포트 3306 허용)"
echo "2. GitHub Secrets에 DB 연결 정보 설정"
echo "3. 백엔드 서버 실행으로 테이블 자동 생성 확인"
echo "4. 회원가입/로그인 기능 테스트"
