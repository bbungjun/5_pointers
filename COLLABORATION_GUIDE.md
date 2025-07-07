# 🤝 5Pointers 협업 가이드

## 📋 개발 환경 설정

### 1. 프로젝트 클론 후 초기 설정

```bash
# 프로젝트 클론
git clone https://github.com/your-username/5_pointers.git
cd 5_pointers

# 루트 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd my-web-builder
npm install
cd apps/frontend
npm install

# 백엔드 의존성 설치
cd ../../../backend
npm install

# YJS/서브도메인 서버 의존성 설치
cd ../
npm install ws yjs express mysql2
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

# OAuth 설정 (개발용)
GOOGLE_CLIENT_ID=686397346394-p4mje30o3ek1i22epfenbrf984t9qa1s.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
KAKAO_CLIENT_ID=c6bb2e19ecb4d4ac6e8ee3f56c81e9b0
```

### 3. 로컬 데이터베이스 설정

```bash
# MySQL 설치 및 실행 (macOS)
brew install mysql
brew services start mysql

# 데이터베이스 생성
mysql -u root -p
CREATE DATABASE jungle_local;
USE jungle_local;

# 필요한 테이블들이 TypeORM에 의해 자동 생성됩니다
```

## 🚀 개발 서버 실행

### 완전한 로컬 개발 환경을 위해 4개 서버 모두 실행

#### 1. 백엔드 서버 실행 (터미널 1)
```bash
cd backend
npm run start:dev
```
- **포트**: http://localhost:3000
- **기능**: API 서버, 핫 리로드

#### 2. 프론트엔드 서버 실행 (터미널 2)
```bash
cd my-web-builder/apps/frontend
npm run dev
```
- **포트**: http://localhost:5173
- **기능**: React 개발 서버, 핫 리로드

#### 3. YJS 협업 서버 실행 (터미널 3)
```bash
cd 5_pointers
PORT=3003 HOST=0.0.0.0 node yjs-server.js
```
- **포트**: ws://localhost:3003
- **기능**: 실시간 협업, WebSocket 연결

#### 4. 서브도메인 서버 실행 (터미널 4)
```bash
cd 5_pointers
PORT=3001 node subdomain-server.js
```
- **포트**: http://localhost:3001
- **기능**: 서브도메인 배포 테스트

### 서버 실행 순서 (중요!)
1. **MySQL 데이터베이스** 먼저 실행
2. **백엔드 서버** 실행 (포트 3000)
3. **YJS 서버** 실행 (포트 3003)
4. **서브도메인 서버** 실행 (포트 3001)
5. **프론트엔드 개발 서버** 실행 (포트 5173)

## 🔄 Git 워크플로우 & 자동 배포

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

### 2. Pull Request 생성 & 자동 배포
1. **GitHub에서 Pull Request 생성**
2. **코드 리뷰 요청**
3. **승인 후 main 브랜치에 merge**
4. **🚀 GitHub Actions가 자동으로 AWS에 배포!**

### 3. 자동 배포 트리거 조건
- **프론트엔드**: `my-web-builder/` 폴더 변경 시
- **백엔드**: `backend/` 폴더 변경 시
- **기타 파일** (README, 문서 등) 변경은 배포 안됨

## 🌍 환경별 URL & 서버 정보

### 개발환경 (로컬)
- **프론트엔드**: http://localhost:5173
- **백엔드**: http://localhost:3000
- **YJS 서버**: ws://localhost:3003
- **서브도메인 서버**: http://localhost:3001
- **데이터베이스**: localhost:3306 (MySQL)

### 프로덕션 환경 (AWS)
- **프론트엔드**: http://jungle-frontend-5.s3-website.ap-northeast-2.amazonaws.com
- **백엔드**: http://Jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com
- **YJS 서버**: wss://h0xs6j2ig6.execute-api.ap-northeast-2.amazonaws.com (AWS WebSocket API Gateway)
- **서브도메인 서버**: http://1.238.129.195:3001 (임시)
- **데이터베이스**: jungle-db5.cluster-chiyuym88mcj.ap-northeast-2.rds.amazonaws.com (AWS RDS Aurora MySQL)

## 🧪 기능별 테스트 방법

### 1. 기본 기능 테스트
```bash
# 로컬에서
http://localhost:5173

# 프로덕션에서
http://jungle-frontend-5.s3-website.ap-northeast-2.amazonaws.com
```
- ✅ 회원가입/로그인
- ✅ 페이지 생성/편집
- ✅ 템플릿 관리

### 2. 실시간 협업 기능 테스트
1. **같은 페이지를 여러 브라우저에서 열기**
2. **한 브라우저에서 컴포넌트 추가/수정**
3. **다른 브라우저에서 실시간 반영 확인**

### 3. 서브도메인 배포 테스트
1. **페이지 생성 후 도메인 설정**
2. **로컬**: `[도메인].localhost:3001`로 접근
3. **프로덕션**: 서브도메인 기능 (개발 중)

### 4. API 테스트 (Postman 또는 curl)
```bash
# 회원가입 테스트
curl -X POST http://localhost:3000/auth/signup/local \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","nickname":"TestUser"}'

# 로그인 테스트
curl -X POST http://localhost:3000/auth/login/local \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## ⚠️ 주의사항 & 문제 해결

### 1. 환경 변수 관리
- **`.env` 파일들은 절대 Git에 커밋하지 마세요**
- 새로운 환경 변수 추가 시 `.env.example` 파일도 업데이트
- 팀원들에게 새로운 환경 변수에 대해 알려주세요

### 2. 데이터베이스 관련
- **TypeORM의 `synchronize: true`** 설정으로 자동 동기화
- 중요한 스키마 변경 시 팀원들에게 미리 알려주세요
- 로컬 DB와 프로덕션 DB는 완전히 분리됨

### 3. 의존성 관리
- 새로운 패키지 설치 시 `package-lock.json`도 함께 커밋
- 팀원들에게 `npm install` 실행하도록 알려주세요

### 4. 포트 충돌 해결
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000  # 백엔드
lsof -i :3001  # 서브도메인 서버
lsof -i :3003  # YJS 서버
lsof -i :5173  # 프론트엔드

# 프로세스 종료
kill -9 [PID]
```

### 5. 일반적인 문제들
```bash
# 데이터베이스 연결 오류
brew services restart mysql

# 환경 변수 로드 안됨
# .env 파일 위치 및 내용 확인 후 서버 재시작

# YJS 협업 기능 안됨
# YJS 서버 실행 확인 및 WebSocket 연결 상태 확인

# 빌드 오류
npm run build  # 로컬에서 빌드 테스트
```

## 🛠️ 개발 도구 & 팁

### 1. 추천 VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### 2. 효율적인 개발을 위한 팁
- **VS Code 멀티 터미널** 사용해서 4개 서버 동시 관리
- **브라우저 개발자 도구** Network 탭으로 API 호출 확인
- **React Developer Tools** 확장 프로그램 설치
- **Postman** 또는 **Thunder Client**로 API 테스트

### 3. 코드 품질 유지
```bash
# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format

# 테스트 실행
npm run test
```

## 🚀 배포 상태 & 모니터링

### 현재 운영 중인 서비스들
- ✅ **백엔드 API**: AWS Elastic Beanstalk (완전 자동화)
- ✅ **프론트엔드**: AWS S3 + CloudFront (완전 자동화)
- ✅ **데이터베이스**: AWS RDS Aurora MySQL (안정적 운영)
- ✅ **YJS 협업 서버**: AWS WebSocket API Gateway (실시간 협업)
- ⚠️ **서브도메인 서버**: 임시 로컬 실행 (AWS 이전 예정)

### 배포 확인 방법
1. **GitHub Actions 탭**에서 배포 진행상황 확인
2. **배포 완료 후 프로덕션 URL 접속하여 테스트**
3. **배포 실패 시 GitHub Actions 로그 확인**

### 성능 모니터링
- **AWS CloudWatch**로 서버 성능 모니터링
- **브라우저 개발자 도구**로 프론트엔드 성능 확인
- **Network 탭**으로 API 응답 시간 확인

## 📞 도움이 필요할 때

### 1. 문제 해결 순서
1. **로컬에서 재현 가능한지 확인**
2. **GitHub Issues에 문제 등록** (템플릿 사용)
3. **팀 채팅방에 질문**
4. **코드 리뷰 시 질문 및 피드백**

### 2. 이슈 리포팅 템플릿
```markdown
## 문제 설명
- 어떤 문제가 발생했나요?

## 재현 단계
1. 
2. 
3. 

## 예상 결과
- 어떤 결과를 기대했나요?

## 실제 결과
- 실제로 어떤 일이 일어났나요?

## 환경 정보
- OS: 
- 브라우저: 
- Node.js 버전: 
```

## 🎯 협업 효율성 향상 팁

### 1. 커밋 메시지 컨벤션
```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

### 2. PR 작성 가이드
- **명확한 제목**: 무엇을 변경했는지 한눈에 알 수 있게
- **상세한 설명**: 왜 이 변경이 필요한지 설명
- **스크린샷**: UI 변경사항이 있다면 before/after 스크린샷
- **테스트 결과**: 어떤 테스트를 했는지 명시

### 3. 코드 리뷰 가이드
- **건설적인 피드백** 제공
- **코드의 의도** 이해하려고 노력
- **대안 제시** 시 이유도 함께 설명
- **칭찬도 잊지 말기** 👍

## 🔮 향후 개선 계획

### 단기 계획 (1-2주)
- [ ] 서브도메인 서버 AWS EC2 배포
- [ ] HTTPS 설정으로 보안 강화
- [ ] 에러 로깅 시스템 구축

### 중기 계획 (1개월)
- [ ] 실제 도메인 연결 (서브도메인 기능 완성)
- [ ] 성능 최적화 (CDN, 이미지 압축)
- [ ] 모니터링 대시보드 구축

### 장기 계획 (3개월)
- [ ] 다중 리전 배포
- [ ] 자동 스케일링 설정
- [ ] 백업 및 재해 복구 시스템

---

## 🎉 마무리

**이제 완전한 협업 환경이 구축되었습니다!**

- ✅ **로컬 개발**: 4개 서버로 완전한 기능 테스트
- ✅ **자동 배포**: PR 머지 시 AWS 자동 배포
- ✅ **실시간 협업**: YJS WebSocket으로 동시 편집
- ✅ **환경 분리**: 개발/프로덕션 환경 완전 분리

**팀원들과 함께 멋진 프로젝트를 만들어보세요!** 🚀

---

*마지막 업데이트: 2025년 7월 5일*
*문의사항이 있으시면 GitHub Issues에 등록해주세요.*
