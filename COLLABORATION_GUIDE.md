# 🤝 5Pointers 협업 가이드

## 📋 개발 환경 설정

### 1. 프로젝트 클론 후 초기 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-username/5_pointers.git
cd 5_pointers

# 의존성 설치
npm install
cd my-web-builder && npm install
cd apps/frontend && npm install
cd ../../../backend && npm install
```

### 2. 환경 설정 파일 생성

#### 프론트엔드 환경 설정
```bash
cd my-web-builder/apps/frontend

# 개발환경 설정 파일 생성
cp .env.example .env

# .env 파일 내용 (로컬 개발용)
VITE_API_URL=http://localhost:3000
VITE_WEBSOCKET_URL=ws://localhost:3003
VITE_SUBDOMAIN_URL=http://localhost:3001
```

#### 백엔드 환경 설정
```bash
cd backend

# 개발환경 설정 파일 생성
cp .env.example .env

# .env 파일 내용 (로컬 개발용)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_local_password
DB_DATABASE=jungle_local
JWT_SECRET=local-development-secret
PORT=3000
NODE_ENV=development
```

### 3. 로컬 데이터베이스 설정

```bash
# MySQL 설치 및 실행 (macOS)
brew install mysql
brew services start mysql

# 데이터베이스 생성
mysql -u root -p
CREATE DATABASE jungle_local;
```

## 🚀 개발 서버 실행

### 1. 백엔드 서버 실행
```bash
cd backend
npm run start:dev  # 또는 npm run dev
```
- 서버 주소: http://localhost:3000

### 2. 프론트엔드 서버 실행
```bash
cd my-web-builder/apps/frontend
npm run dev
```
- 서버 주소: http://localhost:5173

### 3. YJS 협업 서버 실행
```bash
cd 5_pointers
PORT=3003 HOST=0.0.0.0 node yjs-server.js
```
- 서버 주소: ws://localhost:3003

### 4. 서브도메인 서버 실행
```bash
cd 5_pointers
PORT=3001 node subdomain-server.js
```
- 서버 주소: http://localhost:3001

## 🔄 Git 워크플로우

### 1. 브랜치 전략
```bash
# 새로운 기능 개발
git checkout -b feature/기능명
git checkout -b fix/버그명

# 작업 완료 후
git add .
git commit -m "feat: 기능 설명" # 또는 "fix: 버그 수정"
git push origin feature/기능명
```

### 2. Pull Request 생성
1. GitHub에서 Pull Request 생성
2. 코드 리뷰 요청
3. 승인 후 main 브랜치에 merge

### 3. 자동 배포
- `main` 브랜치에 merge되면 GitHub Actions가 자동으로 AWS에 배포

## 🌍 환경별 URL

### 개발환경 (로컬)
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3000
- YJS 서버: ws://localhost:3003
- 서브도메인 서버: http://localhost:3001

### 프로덕션 환경 (AWS)
- 프론트엔드: http://jungle-frontend-5.s3-website.ap-northeast-2.amazonaws.com
- 백엔드: http://Jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com
- YJS 서버: ws://1.238.129.195:3003 (임시)
- 서브도메인 서버: http://1.238.129.195:3001 (임시)

## ⚠️ 주의사항

### 1. 환경 변수 관리
- `.env` 파일들은 **절대 Git에 커밋하지 마세요**
- 새로운 환경 변수 추가 시 `.env.example` 파일도 업데이트
- 팀원들에게 새로운 환경 변수에 대해 알려주세요

### 2. 데이터베이스 스키마 변경
- TypeORM의 `synchronize: true` 설정으로 자동 동기화
- 중요한 스키마 변경 시 팀원들에게 미리 알려주세요

### 3. 의존성 추가
- 새로운 패키지 설치 시 `package-lock.json`도 함께 커밋
- 팀원들에게 `npm install` 실행하도록 알려주세요

### 4. 서버 실행 순서
1. MySQL 데이터베이스 실행
2. 백엔드 서버 실행 (포트 3000)
3. YJS 서버 실행 (포트 3003)
4. 서브도메인 서버 실행 (포트 3001)
5. 프론트엔드 개발 서버 실행 (포트 5173)

## 🐛 문제 해결

### 1. 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000
lsof -i :3001
lsof -i :3003
lsof -i :5173

# 프로세스 종료
kill -9 PID
```

### 2. 데이터베이스 연결 오류
- MySQL 서비스 실행 확인
- 데이터베이스 존재 여부 확인
- 환경 변수 설정 확인

### 3. 환경 변수 로드 안됨
- `.env` 파일 위치 확인
- 파일명 정확성 확인 (`.env.example` 아님)
- 서버 재시작

### 4. YJS 협업 기능 안됨
- YJS 서버 실행 확인 (포트 3003)
- WebSocket 연결 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

## 📞 도움이 필요할 때

1. GitHub Issues에 문제 등록
2. 팀 채팅방에 질문
3. 코드 리뷰 시 질문 및 피드백

## 🎯 개발 팁

### 1. 효율적인 개발을 위해
- VS Code Extensions: ES7+ React/Redux/React-Native snippets, Prettier, ESLint
- 브라우저 개발자 도구 활용
- Postman으로 API 테스트

### 2. 코드 품질 유지
- ESLint 규칙 준수
- Prettier로 코드 포맷팅
- 의미있는 커밋 메시지 작성

### 3. 협업 효율성
- 작업 전 최신 코드 pull
- 작은 단위로 자주 커밋
- 명확한 PR 설명 작성

## 🚀 서버 배포 상태

### 현재 운영 중인 서버들:
- ✅ 백엔드 API: AWS Elastic Beanstalk
- ✅ 프론트엔드: AWS S3 + CloudFront
- ✅ 데이터베이스: AWS RDS Aurora MySQL
- ⚠️ YJS 서버: 로컬 실행 (AWS 배포 예정)
- ⚠️ 서브도메인 서버: 로컬 실행 (AWS 배포 예정)

### 향후 개선 계획:
1. YJS 서버와 서브도메인 서버를 AWS EC2에 배포
2. HTTPS 설정으로 보안 강화
3. 도메인 설정으로 서브도메인 기능 완성
