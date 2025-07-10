# Y.js 협업 기능 문제 해결 가이드

## 🔍 문제 상황
WebSocket 연결 실패로 인한 협업 기능 오류:
```
WebSocket connection to 'wss://h0xs6j2ig6.execute-api.ap-northeast-2.amazonaws.com/page:...' failed
🔴 협업 연결 오류로 인해 로컬 모드로 전환
```

## 🛠️ 해결 방법

### 1. 환경 설정 수정 완료 ✅
- **문제**: 잘못된 WebSocket URL 사용 (API Gateway 대신 실제 y-js 서버 사용)
- **해결**: 올바른 서버 IP로 환경 변수 수정
  - 스테이징: `ws://localhost:1234` (로컬 테스트용)
  - 프로덕션: `ws://52.78.247.202:1234` (실제 서버 복구 후)

### 2. 보안 그룹 설정 완료 ✅
- y-js 서버 보안 그룹에 포트 1234 추가
- 포트 3003도 이미 열려있음

### 3. 에러 처리 개선 완료 ✅
- WebSocket 연결 실패 시 자동 재연결 시도
- 로컬 모드 상태 표시
- 더 자세한 로깅 및 에러 메시지

## 🚀 로컬 테스트 방법

### 1. Y.js 서버 시작
```bash
cd /home/jaemin/jungle
./start-yjs-server.sh
```

### 2. 프론트엔드 개발 서버 시작
```bash
cd /home/jaemin/jungle/my-web-builder/apps/frontend
npm run dev
```

### 3. 협업 테스트
- 브라우저에서 여러 탭으로 같은 페이지 열기
- 실시간 편집 동기화 확인

## 🔧 원격 서버 복구 방법

### 1. EC2 인스턴스 확인
- 인스턴스 ID: `i-011cd33f273f0e7ec`
- 공용 IP: `52.78.247.202`
- 이름: `yjs-websocket-server-korea`

### 2. 서버 접속 및 서비스 시작
```bash
# SSH 접속 (키 필요)
ssh -i your-key.pem ec2-user@52.78.247.202

# Y.js 서버 상태 확인
ps aux | grep node

# 서버 시작 (필요시)
cd /path/to/yjs-server
node yjs-server.js
```

### 3. 서비스 자동 시작 설정
```bash
# systemd 서비스 파일 생성
sudo nano /etc/systemd/system/yjs-websocket.service

# 서비스 활성화
sudo systemctl enable yjs-websocket
sudo systemctl start yjs-websocket
```

## 📊 현재 서버 구성

| 서비스 | IP | 포트 | 상태 |
|--------|----|----- |------|
| 백엔드 API | 13.124.90.104 | 3001 | ✅ 실행중 |
| 프론트엔드 | 3.35.227.214 | 80 | ✅ 실행중 |
| 서브도메인 | 13.209.22.112 | 3002 | ✅ 실행중 |
| Y.js WebSocket | 52.78.247.202 | 1234/3003 | ❌ 응답없음 |

## 🔄 다음 단계

1. **즉시**: 로컬 y-js 서버로 개발 및 테스트 진행
2. **단기**: 원격 y-js 서버 복구 및 자동 시작 설정
3. **장기**: AWS API Gateway WebSocket 또는 ELB 기반 고가용성 구성

## 📝 참고 사항

- 현재 로컬 모드로 전환되어 단일 사용자 편집은 정상 작동
- 실시간 협업은 y-js 서버 복구 후 가능
- 모든 환경 설정 파일은 수정 완료
- 에러 처리 및 재연결 로직 개선 완료
