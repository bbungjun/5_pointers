# Y.js WebSocket 서버 배포 가이드

## 🚀 서버 정보
- **IP**: 43.201.125.200 (Elastic IP)
- **포트**: 1234
- **인스턴스**: t3.medium (4GB RAM, 2 vCPU)

## 📋 배포 단계

### 1. 서버 접속
```bash
ssh -i your-key.pem ubuntu@43.201.125.200
```

### 2. 필요한 패키지 설치
```bash
# Node.js 설치 (이미 설치되어 있다면 스킵)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 설치 (권장)
sudo npm install -g pm2

# 또는 systemd 사용
```

### 3. Y.js 서버 파일 업로드
```bash
# 로컬에서 서버로 파일 전송
scp -i your-key.pem yjs-server.js ubuntu@43.201.125.200:~/
scp -i your-key.pem ecosystem.config.js ubuntu@43.201.125.200:~/
```

### 4. 서버 실행 방법

#### Option A: PM2 사용 (권장)
```bash
# PM2로 실행
pm2 start ecosystem.config.js

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status
pm2 logs yjs-websocket-server
```

#### Option B: systemd 서비스 사용
```bash
# 서비스 파일 복사
sudo cp yjs-server.service /etc/systemd/system/

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable yjs-server
sudo systemctl start yjs-server

# 상태 확인
sudo systemctl status yjs-server
```

#### Option C: 직접 실행
```bash
# 백그라운드 실행
nohup node yjs-server.js > yjs.log 2>&1 &

# 프로세스 확인
ps aux | grep yjs
```

### 5. 포트 및 방화벽 설정
```bash
# 포트 1234 열기
sudo ufw allow 1234

# 포트 사용 확인
netstat -tlnp | grep :1234
```

### 6. 서버 상태 확인
```bash
# 포트 확인
netstat -tlnp | grep :1234

# 프로세스 확인
ps aux | grep yjs

# Health Check (브라우저에서도 확인 가능)
curl http://43.201.125.200:1234/health
```

## 🔧 문제 해결

### Y.js 서버가 시작되지 않는 경우
```bash
# 로그 확인
pm2 logs yjs-websocket-server
# 또는
sudo journalctl -u yjs-server -f

# 포트 충돌 확인
sudo lsof -i :1234

# 방화벽 확인
sudo ufw status
```

### 연결이 안 되는 경우
```bash
# 보안 그룹 확인 (AWS 콘솔에서)
# - 인바운드 규칙에 포트 1234 TCP 허용되어 있는지 확인

# 서버 내부에서 테스트
curl http://localhost:1234/health

# 외부에서 테스트
curl http://43.201.125.200:1234/health
```

## 📊 모니터링

### PM2 모니터링
```bash
pm2 monit
pm2 status
pm2 logs --lines 50
```

### 시스템 리소스 확인
```bash
htop
free -h
df -h
```

## 🔄 업데이트 방법
```bash
# 서버 중지
pm2 stop yjs-websocket-server

# 새 파일 업로드
scp -i your-key.pem yjs-server.js ubuntu@43.201.125.200:~/

# 서버 재시작
pm2 restart yjs-websocket-server
```

## ✅ 최종 확인 사항
- [ ] Y.js 서버가 포트 1234에서 실행 중
- [ ] Health Check 엔드포인트 응답 확인
- [ ] 프론트엔드에서 WebSocket 연결 테스트
- [ ] 실시간 협업 기능 동작 확인
