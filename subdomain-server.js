const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// 배포된 사이트들이 저장될 디렉토리
const deployedSitesPath = path.join(__dirname, 'deployed-sites');

// 디렉토리가 없으면 생성
if (!fs.existsSync(deployedSitesPath)) {
  fs.mkdirSync(deployedSitesPath, { recursive: true });
}

// 서브도메인 처리 미들웨어
app.use((req, res, next) => {
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  // localhost:3001 직접 접근시 기본 페이지
  if (host === `localhost:${PORT}` || subdomain === 'localhost') {
    return res.send(`
      <h1>Wildcard Subdomain Server</h1>
      <p>서브도메인으로 접근하세요: http://[subdomain].localhost:${PORT}</p>
    `);
  }
  
  // 서브도메인 디렉토리 경로
  const siteDir = path.join(deployedSitesPath, subdomain);
  
  // 해당 서브도메인 사이트가 존재하는지 확인
  if (fs.existsSync(siteDir)) {
    // 정적 파일 서빙
    express.static(siteDir)(req, res, next);
  } else {
    res.status(404).send(`
      <h1>404 - Site Not Found</h1>
      <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Wildcard subdomain server running on http://localhost:${PORT}`);
  console.log(`📁 Deployed sites directory: ${deployedSitesPath}`);
});