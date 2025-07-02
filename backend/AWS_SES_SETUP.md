# AWS SES 이메일 발송 설정 가이드 📧

## 1. AWS 계정 준비
- AWS 계정이 필요합니다
- AWS SES 서비스에 접근할 수 있어야 합니다

## 2. AWS SES 설정

### 2.1 AWS Console에서 SES 설정
1. AWS Console → Amazon SES 서비스로 이동
2. **Create identity** 클릭
3. **Email address** 선택
4. 발신자로 사용할 이메일 주소 입력 (예: noreply@yourdomain.com)
5. **Create identity** 클릭
6. 해당 이메일로 온 인증 메일을 확인하여 인증 완료

### 2.2 Sandbox 모드 해제 (선택사항)
- 기본적으로 SES는 Sandbox 모드로 시작됩니다
- Sandbox 모드에서는 인증된 이메일로만 발송 가능
- 실제 서비스를 위해서는 Sandbox 탈출 신청 필요
- **Request production access** 버튼을 클릭하여 신청

## 3. AWS 자격 증명 설정

### 3.1 IAM 사용자 생성
1. AWS Console → IAM 서비스로 이동
2. **Users** → **Add user** 클릭
3. 사용자 이름 입력 (예: ses-user)
4. **Programmatic access** 선택
5. **Attach existing policies directly** 선택
6. **AmazonSESFullAccess** 정책 연결
7. 사용자 생성 완료 후 **Access Key ID**와 **Secret Access Key** 저장

### 3.2 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가:

```env
# AWS SES 설정
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
SES_FROM_EMAIL=noreply@yourdomain.com

# 기타 설정
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## 4. 테스트 방법

### 4.1 개발 환경에서 테스트
1. 백엔드 서버 시작: `npm run start:dev`
2. 프론트엔드에서 초대 기능 사용
3. 백엔드 콘솔에서 이메일 발송 로그 확인

### 4.2 이메일 발송 확인
- ✅ 성공: "이메일 발송 성공" 메시지
- ❌ 실패: "이메일 발송 실패" 메시지 + 개발 모드에서는 콘솔에 링크 출력

## 5. 문제 해결

### 5.1 자주 발생하는 오류

#### "Email address not verified"
- SES에서 발신자 이메일이 인증되지 않음
- AWS Console에서 이메일 주소 인증 필요

#### "AccessDenied"
- IAM 권한 부족
- AmazonSESFullAccess 정책이 연결되어 있는지 확인

#### "MessageRejected"
- Sandbox 모드에서 인증되지 않은 수신자로 발송 시도
- 수신자 이메일도 SES에서 인증하거나 Sandbox 탈출 필요

### 5.2 디버깅 팁
```javascript
// 이메일 서비스에서 상세 로그 확인
console.log('SES Config:', {
  region: process.env.AWS_REGION,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
  fromEmail: process.env.SES_FROM_EMAIL
});
```

## 6. 대안 이메일 서비스

AWS SES 대신 다른 서비스를 사용하고 싶다면:
- **SendGrid**: 간단한 설정, 월 100개 무료
- **Mailgun**: 강력한 API, 월 5,000개 무료  
- **Gmail SMTP**: 간단하지만 제한적

## 7. 보안 고려사항
- AWS 자격 증명을 절대 코드에 하드코딩하지 마세요
- `.env` 파일을 `.gitignore`에 추가하세요
- 운영 환경에서는 AWS IAM Role 사용을 권장합니다

---

💡 **팁**: 개발 중에는 이메일 발송이 실패해도 초대 링크가 콘솔에 출력되므로 테스트가 가능합니다! 