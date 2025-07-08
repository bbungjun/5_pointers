# Deployment Trigger

This file is used to trigger GitHub Actions deployment.

Last updated: 2025-07-08 23:50:00
Reason: Integrate subdomain server into Elastic Beanstalk backend

Changes:
- Modified app.controller.ts to handle subdomain routing at root path
- Added subdomain extraction and HTML rendering logic
- Updated app.module.ts to include AppController and AppService
- Fixed unit tests to work with new controller structure
- Integrated GeneratorService for subdomain page rendering
- Eliminated separate EC2 instances for subdomain handling
- All subdomain requests now processed through single EB environment

Infrastructure improvements:
- Cost optimization: Removed separate EC2 instances
- Simplified deployment: Single application handles all routing
- Better maintainability: Unified codebase and logging
- Enhanced scalability: Leverages EB auto-scaling

Previous deployments:
- 2025-07-07 13:15:00: Fix API endpoint routing issue by adding global prefix
- 2025-07-05 11:30:00: Fix Vite build command and improve deployment workflows
- Remove deprecated --force option from Vite build
- Improve build process with better error handling and logging
- Add dist directory cleanup for clean builds
RDS Connection Success: #오후
Emergency Backend Restart: #오후
🚨 백엔드 서버 강제 재시작 #오후
🚀 포트 3001 설정 완료 후 백엔드 재배포: #오후
