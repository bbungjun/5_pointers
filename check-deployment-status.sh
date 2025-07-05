#!/bin/bash

echo "🔍 GitHub Actions 배포 상태 확인"
echo "================================"

echo "📋 최근 커밋:"
git log --oneline -3

echo -e "\n🚀 트리거된 워크플로우:"
echo "1. Backend Deploy (backend/** 경로 변경으로 트리거됨)"
echo "2. Frontend Deploy (my-web-builder/apps/frontend/** 경로 변경으로 트리거됨)"

echo -e "\n📊 확인할 URL들:"
echo "- GitHub Actions: https://github.com/Jungle-5pointers/5_pointers/actions"
echo "- 백엔드 API: http://3.39.235.190:3001"
echo "- 프론트엔드: http://3.35.227.214"
echo "- 서브도메인: http://13.125.227.27:3002"
echo "- WebSocket: ws://43.203.138.8:3003"

echo -e "\n🔧 수정된 사항:"
echo "✅ Vite --force 옵션 제거"
echo "✅ npm run build 명령어 사용"
echo "✅ 빌드 프로세스 개선"
echo "✅ 오류 처리 및 로깅 추가"

echo -e "\n⏳ 예상 배포 시간: 5-10분"
echo "📱 배포 완료 후 테스트할 기능:"
echo "- 프론트엔드 페이지 로딩"
echo "- 백엔드 API 응답"
echo "- 회원가입/로그인 (RDS 연결 해결 후)"

echo -e "\n🚨 아직 해결해야 할 사항:"
echo "- RDS 보안 그룹 설정 (MySQL 3306 포트 허용)"
echo "- GitHub Secrets 환경 변수 설정"
