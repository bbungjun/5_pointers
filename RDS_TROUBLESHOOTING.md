# RDS 연결 문제 해결 가이드

## 현재 상황
- RDS 호스트: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
- 현재 IP: 1.238.129.195
- 오류: ETIMEDOUT (연결 타임아웃)

## 해결해야 할 사항

### 1. AWS RDS 보안 그룹 설정
```bash
# AWS CLI로 보안 그룹 확인 (AWS CLI 설치 후)
aws rds describe-db-instances --db-instance-identifier pointers-mysql-db --region ap-northeast-2
```

**AWS 콘솔에서 확인할 사항**:
1. RDS → 데이터베이스 → pointers-mysql-db 선택
2. 연결 및 보안 탭에서 보안 그룹 확인
3. 보안 그룹의 인바운드 규칙에 다음 추가:
   - 유형: MySQL/Aurora (3306)
   - 소스: 현재 IP (1.238.129.195/32) 또는 0.0.0.0/0 (임시)

### 2. RDS 퍼블릭 액세스 설정
- RDS 인스턴스가 "퍼블릭 액세스 가능"으로 설정되어 있는지 확인

### 3. 올바른 데이터베이스 자격 증명
현재 추정 정보:
- 호스트: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
- 포트: 3306
- 사용자: admin 또는 root
- 데이터베이스: jungle

### 4. 환경 변수 설정
백엔드 서버의 .env 파일에 올바른 RDS 정보 설정:
```env
DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=실제_비밀번호
DB_DATABASE=jungle
```

## 테스트 명령어
```bash
# RDS 연결 테스트
node test-rds-simple.js

# 백엔드 서버에서 직접 테스트
cd backend
npm run start:dev
```
