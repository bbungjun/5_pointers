# 🔧 RDS 설정 단계별 가이드

## 현재 상황
- ❌ RDS 연결 타임아웃 (ETIMEDOUT)
- ❌ 로그인/회원가입 기능 불가
- 🔍 현재 IP: 1.238.129.195

## 🚨 즉시 해결해야 할 사항

### 1단계: AWS RDS 보안 그룹 설정 (필수!)

**AWS 콘솔에서 수행:**

1. **AWS 콘솔 로그인** → https://console.aws.amazon.com
2. **서비스** → **RDS** 클릭
3. **데이터베이스** 메뉴 클릭
4. **pointers-mysql-db** 인스턴스 클릭
5. **연결 및 보안** 탭 선택
6. **VPC 보안 그룹** 섹션에서 보안 그룹 ID 클릭 (sg-xxxxxxxxx)
7. **인바운드 규칙** 탭 선택
8. **규칙 편집** 버튼 클릭
9. **규칙 추가** 클릭하여 다음 설정:
   ```
   유형: MySQL/Aurora
   포트 범위: 3306
   소스: 0.0.0.0/0 (Anywhere IPv4)
   설명: 5Pointers RDS Access
   ```
10. **규칙 저장** 클릭

### 2단계: RDS 퍼블릭 액세스 확인

1. RDS 인스턴스 세부 정보에서 **퍼블릭 액세스 가능: 예** 확인
2. 만약 "아니요"라면 **수정** → **퍼블릭 액세스: 예** → **즉시 적용**

### 3단계: 연결 테스트

보안 그룹 설정 후 다음 명령어로 테스트:
```bash
node test-rds-connection-detailed.js
```

### 4단계: GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions

**필수 Secrets:**
```
DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=[실제_RDS_비밀번호]
DB_DATABASE=jungle
JWT_SECRET=[32자리_랜덤_문자열]
```

### 5단계: 백엔드 재배포

```bash
# 배포 트리거
echo "$(date)" >> backend/DEPLOYMENT_TRIGGER.md
git add backend/DEPLOYMENT_TRIGGER.md
git commit -m "🚀 Trigger backend deployment after RDS setup"
git push origin main
```

## 🔍 확인 방법

### RDS 연결 성공 시:
- ✅ `node test-rds-connection-detailed.js` 성공
- ✅ 백엔드 서버에서 테이블 자동 생성
- ✅ 로그인/회원가입 기능 활성화

### 테스트 URL:
- 백엔드 API: http://3.39.235.190:3001/health
- 프론트엔드: http://3.35.227.214

## 🚨 주의사항

1. **보안**: 0.0.0.0/0 설정은 임시입니다. 나중에 특정 IP로 제한하세요.
2. **비밀번호**: RDS 마스터 비밀번호를 정확히 입력해야 합니다.
3. **지역**: ap-northeast-2 (서울) 리전 확인

## 📞 문제 발생 시

1. AWS 콘솔에서 RDS 인스턴스 상태 확인
2. 보안 그룹 규칙이 올바르게 설정되었는지 확인
3. RDS 엔드포인트 주소가 정확한지 확인
