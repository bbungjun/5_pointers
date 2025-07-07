# Deployment Trigger

This file is used to trigger GitHub Actions deployment.

Last updated: 2025-07-07 13:15:00
Reason: Fix API endpoint routing issue by adding global prefix

Changes:
- Added app.setGlobalPrefix('api') to main.ts
- Fixed frontend API endpoint routing (404 errors)
- All API endpoints now have /api/ prefix
- Resolves pagecube.net login issues

Previous deployments:
- 2025-07-05 11:30:00: Fix Vite build command and improve deployment workflows
- Remove deprecated --force option from Vite build
- Improve build process with better error handling and logging
- Add dist directory cleanup for clean builds
RDS Connection Success: #오후
Emergency Backend Restart: #오후
🚨 백엔드 서버 강제 재시작 #오후
🚀 포트 3001 설정 완료 후 백엔드 재배포: #오후
