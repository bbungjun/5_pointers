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
VITE_API_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=ws://localhost:3003
VITE_SUBDOMAIN_URL=http://localhost:3001

# 🌟 YJS 협업 기능을 위한 추가 설정
VITE_YJS_WEBSOCKET_URL=ws://[서버IP]:1234
```

#### 🌟 YJS 협업 기능 설정 (중요!)

**다른 기기에서 협업을 사용하려면:**

1. **서버 IP 확인**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# 또는
ip addr show
```

2. **YJS 서버 실행 (외부 접근 허용)**
```bash
cd 5_pointers
HOST=0.0.0.0 PORT=1234 node yjs-server.js
```

3. **프론트엔드 환경 변수 설정**
```bash
# my-web-builder/apps/frontend/.env 파일에 추가
VITE_YJS_WEBSOCKET_URL=ws://[실제서버IP]:1234
# 예: VITE_YJS_WEBSOCKET_URL=ws://192.168.1.100:1234
```

4. **방화벽 설정 (필요시)**
```bash
# Windows 방화벽에서 1234 포트 허용
# macOS/Linux
sudo ufw allow 1234
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

#### 3. 🌟 YJS 협업 서버 실행 (터미널 3) - 외부 접근 허용
```bash
cd 5_pointers
HOST=0.0.0.0 PORT=1234 node yjs-server.js
```
- **포트**: ws://0.0.0.0:1234 (외부 접근 가능)
- **기능**: 실시간 협업, WebSocket 연결
- **중요**: `HOST=0.0.0.0`으로 설정하여 외부에서 접근 가능

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
3. **YJS 서버** 실행 (포트 1234, 외부 접근 허용)
4. **서브도메인 서버** 실행 (포트 3001)
5. **프론트엔드 개발 서버** 실행 (포트 5173)

## 🌟 YJS 협업 기능 테스트 방법

### 1. 같은 기기에서 테스트
```bash
# 브라우저 1: http://localhost:5173
# 브라우저 2: http://localhost:5173 (새 탭)
```

### 2. 🌟 다른 기기에서 테스트 (중요!)
```bash
# 서버 기기에서 IP 확인
ipconfig  # Windows
ifconfig  # macOS/Linux

# 클라이언트 기기에서 접속
http://[서버IP]:5173
# 예: http://192.168.1.100:5173
```

### 3. 협업 기능 확인
1. **같은 페이지를 여러 브라우저/기기에서 열기**
2. **한 기기에서 컴포넌트 추가/수정**
3. **다른 브라우저/기기에서 실시간 반영 확인**
4. **브라우저 개발자 도구에서 WebSocket 연결 상태 확인**

### 4. 🌟 문제 해결

**YJS 서버가 외부에서 접근되지 않는 경우:**
```bash
# 1. 서버 IP 확인
ipconfig | findstr "IPv4"  # Windows
ifconfig | grep "inet "    # macOS/Linux

# 2. 방화벽 설정
# Windows: Windows Defender 방화벽에서 1234 포트 허용
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw allow 1234

# 3. YJS 서버 재시작 (외부 접근 허용)
HOST=0.0.0.0 PORT=1234 node yjs-server.js

# 4. 연결 테스트
# 클라이언트 기기에서: http://[서버IP]:1234
```

**프론트엔드에서 YJS 연결 실패:**
```bash
# 1. 환경 변수 확인
# my-web-builder/apps/frontend/.env
VITE_YJS_WEBSOCKET_URL=ws://[실제서버IP]:1234

# 2. 프론트엔드 서버 재시작
npm run dev

# 3. 브라우저 개발자 도구에서 확인
# Console 탭에서 YJS 연결 로그 확인
# Network 탭에서 WebSocket 연결 상태 확인
```

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
- **YJS 서버**: ws://localhost:1234 (같은 기기) / ws://[서버IP]:1234 (다른 기기)
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

### 2. 🌟 실시간 협업 기능 테스트
1. **같은 페이지를 여러 브라우저/기기에서 열기**
2. **한 브라우저/기기에서 컴포넌트 추가/수정**
3. **다른 브라우저/기기에서 실시간 반영 확인**
4. **브라우저 개발자 도구에서 WebSocket 연결 상태 확인**

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
lsof -i :1234  # YJS 서버
lsof -i :5173  # 프론트엔드

# 프로세스 종료
kill -9 [PID]
```

### 5. 🌟 YJS 협업 기능 문제 해결

**연결이 안 되는 경우:**
```bash
# 1. YJS 서버가 외부 접근을 허용하는지 확인
HOST=0.0.0.0 PORT=1234 node yjs-server.js

# 2. 방화벽 설정 확인
# Windows: Windows Defender 방화벽
# macOS: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw status

# 3. 네트워크 연결 테스트
# 클라이언트에서: ping [서버IP]
# 클라이언트에서: telnet [서버IP] 1234

# 4. 브라우저 개발자 도구에서 확인
# Console: YJS 연결 로그
# Network: WebSocket 연결 상태
```

**실시간 동기화가 안 되는 경우:**
```bash
# 1. 같은 룸에 있는지 확인
# URL의 페이지 ID가 동일한지 확인

# 2. YJS 서버 로그 확인
# 서버 터미널에서 연결 및 메시지 전송 로그 확인

# 3. 브라우저 캐시 클리어
# Ctrl+Shift+R (강제 새로고침)

# 4. 다른 브라우저에서 테스트
# Chrome, Firefox, Safari 등에서 테스트
```

### 6. 일반적인 문제들
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
2. **AWS Console**에서 서비스 상태 확인
3. **브라우저 개발자 도구**에서 API 호출 및 WebSocket 연결 확인

## 🌟 YJS 협업 기능 완전 가이드

### 1. 로컬 네트워크에서 협업 설정

**서버 기기에서:**
```bash
# 1. IP 주소 확인
ipconfig | findstr "IPv4"  # Windows
ifconfig | grep "inet "    # macOS/Linux

# 2. YJS 서버 실행 (외부 접근 허용)
cd 5_pointers
HOST=0.0.0.0 PORT=1234 node yjs-server.js

# 3. 서버 정보 확인
# 터미널에서 네트워크 인터페이스 정보 출력됨
```

**클라이언트 기기에서:**
```bash
# 1. 환경 변수 설정
# my-web-builder/apps/frontend/.env
VITE_YJS_WEBSOCKET_URL=ws://[서버IP]:1234

# 2. 프론트엔드 서버 실행
cd my-web-builder/apps/frontend
npm run dev

# 3. 브라우저에서 접속
http://[서버IP]:5173
```

### 2. 협업 기능 테스트 시나리오

**시나리오 1: 같은 기기, 다른 브라우저**
```bash
# 브라우저 1: http://localhost:5173
# 브라우저 2: http://localhost:5173 (새 탭)
# 같은 페이지에서 동시 편집
```

**시나리오 2: 다른 기기, 같은 네트워크**
```bash
# 서버 기기: http://localhost:5173
# 클라이언트 기기: http://192.168.1.100:5173
# 같은 페이지에서 동시 편집
```

**시나리오 3: 다른 기기, 다른 네트워크 (프로덕션)**
```bash
# 프로덕션 환경에서 자동으로 설정됨
# wss://ddukddak.org/yjs 사용
```

### 3. 디버깅 및 모니터링

**서버 측 로깅:**
```bash
# YJS 서버 터미널에서 확인
🔄 새로운 연결: Room page:abc123 (192.168.1.101)
📊 Room page:abc123 현재 연결 수: 2
📡 Room page:abc123: 1개 클라이언트에게 메시지 브로드캐스트
```

**클라이언트 측 로깅:**
```bash
# 브라우저 개발자 도구 Console에서 확인
Y.js 서버 연결 시도: ws://192.168.1.100:1234 Room: page:abc123
WebSocket 연결 상태: connected
Y.js 동기화 상태: 완료
```

### 4. 성능 최적화

**네트워크 최적화:**
```bash
# 1. 같은 네트워크 내에서 사용 권장
# 2. 방화벽 설정 최적화
# 3. WebSocket 연결 유지

# YJS 서버 설정 최적화
const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
  connect: true,
  maxBackoffTime: 2000,    // 재연결 최대 대기 시간
  resyncInterval: 3000,    // 재동기화 간격
});
```

**메모리 최적화:**
```bash
# 1. 사용하지 않는 룸 자동 정리
# 2. 연결 해제 시 리소스 정리
# 3. 주기적인 가비지 컬렉션
```

## 🎯 다음 단계

### 단기 계획 (1개월)
- [ ] YJS 서버 AWS 배포 완료
- [ ] 서브도메인 서버 AWS 이전
- [ ] 실시간 협업 기능 안정화
- [ ] 성능 모니터링 시스템 구축

### 중기 계획 (3개월)
- [ ] 다중 사용자 동시 편집 최적화
- [ ] 협업 히스토리 및 버전 관리
- [ ] 실시간 채팅 기능 추가
- [ ] 모바일 협업 지원

### 장기 계획 (6개월)
- [ ] 다중 리전 배포
- [ ] 자동 스케일링 설정
- [ ] 백업 및 재해 복구 시스템
- [ ] 고급 협업 기능 (화상회의, 화면공유 등)

---

## 🎉 마무리

**이제 완전한 협업 환경이 구축되었습니다!**

- ✅ **로컬 개발**: 4개 서버로 완전한 기능 테스트
- ✅ **자동 배포**: PR 머지 시 AWS 자동 배포
- ✅ **실시간 협업**: YJS WebSocket으로 동시 편집
- ✅ **환경 분리**: 개발/프로덕션 환경 완전 분리
- 🌟 **다중 기기 협업**: 로컬 네트워크 및 프로덕션 환경에서 완전 지원

**팀원들과 함께 멋진 프로젝트를 만들어보세요!** 🚀

---

*마지막 업데이트: 2025년 1월 5일*
*문의사항이 있으시면 GitHub Issues에 등록해주세요.*
