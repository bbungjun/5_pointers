# 🔑 GitHub Secrets 설정 가이드

## RDS 비밀번호 재설정 후 설정할 Secrets

### GitHub 저장소에서 설정:
1. **GitHub 저장소** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭하여 다음 secrets 추가:

## 필수 Database Secrets
```
Name: DB_HOST
Value: pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com

Name: DB_PORT  
Value: 3306

Name: DB_USERNAME
Value: admin

Name: DB_PASSWORD
Value: Jungle5pointers2025!

Name: DB_DATABASE
Value: jungle
```

## Application Secrets
```
Name: JWT_SECRET
Value: ceafbee808f6c9c2429b5b3fdab88f1c77cd7b3a4cba1cbe1d91325f5213978f

Name: NODE_ENV
Value: production
```

## AWS Secrets (선택사항 - 이메일 기능용)
```
Name: AWS_ACCESS_KEY_ID
Value: [AWS_액세스_키]

Name: AWS_SECRET_ACCESS_KEY  
Value: [AWS_시크릿_키]

Name: AWS_REGION
Value: ap-northeast-2
```

## CORS 설정
```
Name: CORS_ORIGIN
Value: http://3.35.227.214
```

## 🔍 설정 확인 방법

### 1. RDS 연결 테스트
비밀번호 재설정 완료 후 (5-10분 대기):
```bash
node test-new-rds-password.js
```

### 2. GitHub Secrets 설정 완료 후
백엔드 재배포 트리거:
```bash
echo "RDS Password Reset: $(date)" >> backend/DEPLOYMENT_TRIGGER.md
git add backend/DEPLOYMENT_TRIGGER.md
git commit -m "🔑 Trigger deployment after RDS password reset"
git push origin main
```

### 3. 배포 완료 후 테스트
- 백엔드 API: http://3.39.235.190:3001/health
- 회원가입/로그인 기능 테스트

## 🚨 주의사항

1. **비밀번호 재설정 대기**: AWS에서 5-10분 소요
2. **즉시 적용 확인**: RDS 인스턴스 상태가 "수정 중" → "사용 가능"으로 변경 확인
3. **보안**: 강력한 비밀번호 사용 (Jungle5pointers2025!)

## 📞 문제 해결

### 여전히 연결 안 될 경우:
1. AWS 콘솔에서 RDS 인스턴스 상태 확인
2. "사용 가능" 상태인지 확인
3. 마스터 사용자명이 "admin"인지 확인
4. 더 오래 대기 (최대 15분)
