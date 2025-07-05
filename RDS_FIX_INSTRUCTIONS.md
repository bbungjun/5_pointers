# 🔧 RDS 연결 문제 해결 방법

## 즉시 해결해야 할 사항

### 1. AWS RDS 보안 그룹 설정
AWS 콘솔에서 다음 단계를 수행하세요:

1. **AWS 콘솔 → RDS → 데이터베이스**
2. **pointers-mysql-db** 인스턴스 선택
3. **연결 및 보안** 탭 클릭
4. **VPC 보안 그룹** 클릭 (예: sg-xxxxxxxxx)
5. **인바운드 규칙** 탭에서 **규칙 편집** 클릭
6. **규칙 추가**:
   - 유형: `MySQL/Aurora`
   - 포트: `3306`
   - 소스: `0.0.0.0/0` (임시로 모든 IP 허용)
   - 설명: `5Pointers RDS Access`

### 2. RDS 퍼블릭 액세스 확인
1. RDS 인스턴스 세부 정보에서 **퍼블릭 액세스 가능**이 `예`로 설정되어 있는지 확인
2. 만약 `아니요`라면 인스턴스를 수정하여 퍼블릭 액세스를 활성화

### 3. GitHub Secrets 설정
GitHub 저장소에서 다음 설정:

1. **Settings → Secrets and variables → Actions**
2. **New repository secret** 클릭하여 다음 추가:

```
DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=[실제_RDS_비밀번호]
DB_DATABASE=jungle
JWT_SECRET=[랜덤_JWT_시크릿_키]
AWS_ACCESS_KEY_ID=[AWS_액세스_키]
AWS_SECRET_ACCESS_KEY=[AWS_시크릿_키]
AWS_REGION=ap-northeast-2
```

### 4. 연결 테스트
보안 그룹 설정 후 다음 명령어로 테스트:
```bash
node test-rds-simple.js
```

## 자동 배포 문제 해결

### 1. Self-hosted Runner 상태 확인
각 서버에서 GitHub Actions runner가 실행 중인지 확인:

**백엔드 서버 (3.39.235.190)**:
```bash
sudo systemctl status actions.runner.*
```

**프론트엔드 서버 (3.35.227.214)**:
```bash
sudo systemctl status actions.runner.*
```

### 2. 배포 트리거
모든 설정 완료 후:
```bash
git add .
git commit -m "🚀 Fix RDS connection and deployment"
git push origin main
```

## 확인 방법

### RDS 연결 확인:
- 백엔드 서버: http://3.39.235.190:3001/health
- 회원가입/로그인 기능 테스트

### 자동 배포 확인:
- GitHub Actions 탭에서 워크플로우 실행 상태 확인
- 각 서버의 애플리케이션 업데이트 확인
