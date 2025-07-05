# GitHub Secrets 설정 가이드

## 설정 방법
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭하여 다음 secrets 추가:

## 필수 Database Secrets
```
DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=[실제_RDS_마스터_비밀번호]
DB_DATABASE=jungle
```

## 필수 Application Secrets
```
JWT_SECRET=[랜덤_32자리_문자열]
NODE_ENV=production
```

## AWS Secrets (이메일 기능용)
```
AWS_ACCESS_KEY_ID=[AWS_액세스_키]
AWS_SECRET_ACCESS_KEY=[AWS_시크릿_키]
AWS_REGION=ap-northeast-2
```

## CORS 설정
```
CORS_ORIGIN=http://3.35.227.214
```

## JWT_SECRET 생성 방법
```bash
# Node.js에서 랜덤 문자열 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 확인 방법
- 모든 secrets이 설정되면 GitHub Actions에서 배포 시 환경 변수로 사용됩니다
- 백엔드 서버가 RDS에 연결하여 테이블을 자동 생성합니다
