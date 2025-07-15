# 5Pointers - Web Page Builder

🚀 **GitHub Actions CI/CD 자동 배포 시스템 구축 완료!**

## 프로젝트 개요
5Pointers는 웹페이지 빌더 프로젝트입니다.

## 서버 구성
- **백엔드 API**: NestJS (13.124.90.104:3001)
- **프론트엔드 에디터**: React/Vite (3.35.227.214:80)
- **서브도메인 렌더러**: Next.js (13.209.22.112:3001)
- **WebSocket 서버**: y-js (13.124.221.182:1234/1235) ✅ **SSL 지원**

## 데이터베이스
- **RDS MySQL**: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com

## CI/CD 파이프라인
✅ GitHub Actions Self-hosted Runners 설정 완료
✅ 자동 테스트 및 배포 워크플로우 구성
✅ 실제 RDS 데이터베이스 연결

## 🤝 협업 기능 (Y.js WebSocket 서버)

### 환경별 실행 방법

#### 🏠 로컬 개발 환경
```bash
# npm 스크립트 사용
npm run yjs:local
# 또는
npm run yjs:dev

# 직접 실행
./start-yjs-local.sh

# 수동 환경변수 설정
NODE_ENV=development HOST=localhost EXTERNAL_IP=localhost node yjs-server.js
```

**로컬 접근 주소:**
- HTTP: `http://localhost:1234`
- HTTPS: `https://localhost:1235` (SSL 인증서가 있는 경우)
- WebSocket: `ws://localhost:1234`
- WebSocket Secure: `wss://localhost:1235` (SSL 인증서가 있는 경우)

#### 🌍 프로덕션 환경
```bash
# npm 스크립트 사용
npm run yjs:prod

# 직접 실행
./start-yjs-production.sh

# 수동 환경변수 설정
NODE_ENV=production HOST=0.0.0.0 EXTERNAL_IP=43.203.235.108 node yjs-server.js
```

**프로덕션 접근 주소:**
- HTTP: `http://43.203.235.108:1234`
- HTTPS: `https://43.203.235.108:1235` ✅ **SSL 지원**
- WebSocket: `ws://43.203.235.108:1234`
- WebSocket Secure: `wss://43.203.235.108:1235` ✅ **SSL 지원**

### 기능
✅ **다중 기기 간 실시간 협업 지원**
✅ **룸 기반 격리된 협업 환경**
✅ **환경별 자동 설정 (로컬/프로덕션)**
✅ **SSL/TLS 지원 (프로덕션)**

---
**최종 업데이트**: 2025-07-15 20:00 KST
