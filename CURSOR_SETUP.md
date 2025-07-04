# 5Pointers Cursor IDE 설정 가이드

## 🚀 로컬 개발 환경 설정

### 1. Cursor에서 프로젝트 열기
```bash
# Cursor IDE에서 이 폴더를 열어주세요
/Users/byeolkim/5pointers-local
```

### 2. 프론트엔드 개발 서버 실행
```bash
cd my-web-builder/apps/frontend
npm install
npm run dev
```
- 로컬 주소: http://localhost:5173
- AWS 백엔드와 자동 연결됨

### 3. 백엔드 개발 서버 실행 (선택사항)
```bash
cd backend
npm install
npm run start:dev
```
- 로컬 주소: http://localhost:3001
- AWS RDS 데이터베이스와 연결됨

### 4. 개발 모드 선택

#### 옵션 A: 하이브리드 개발 (추천)
- 프론트엔드: 로컬에서 개발 (hot reload)
- 백엔드: AWS 서버 사용 (안정적)
- 데이터베이스: AWS RDS 사용

#### 옵션 B: 풀 로컬 개발
- 모든 서비스를 로컬에서 실행
- 데이터베이스만 AWS RDS 사용

## 🔄 AWS와 로컬 연동

### 현재 AWS 배포 상태
- ✅ 프론트엔드: http://3.35.227.214/
- ✅ 백엔드 API: http://3.39.235.190:3001/
- ✅ WebSocket: ws://43.203.138.8:3003
- ✅ RDS MySQL: 연결됨

### 로컬 개발시 장점
1. **Hot Reload**: 코드 변경시 즉시 반영
2. **디버깅**: 브레이크포인트 설정 가능
3. **AWS 연동**: 실제 데이터베이스와 연결
4. **CI/CD**: 푸시시 자동 배포

## 🛠️ 추천 개발 워크플로우

1. **로컬에서 개발**: Cursor IDE에서 코드 작성
2. **실시간 테스트**: 로컬 서버에서 확인
3. **AWS 테스트**: 배포된 서버에서 최종 확인
4. **Git 푸시**: 자동 CI/CD 배포

## 📝 유용한 명령어

### 프론트엔드
```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

### 백엔드
```bash
npm run start:dev    # 개발 서버 (watch mode)
npm run start        # 프로덕션 서버
npm run test         # 테스트 실행
```

## 🔍 디버깅 팁

### 브라우저 콘솔
- F12 → Console 탭
- 프론트엔드 로그 확인

### VS Code/Cursor 디버거
- 브레이크포인트 설정
- 변수 값 실시간 확인

### 네트워크 탭
- API 호출 상태 확인
- 요청/응답 데이터 확인
