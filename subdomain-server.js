const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 백엔드 API URL 설정 - 로컬 개발 환경에서는 localhost 사용
const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' ? 
    'https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api' : 
    'http://localhost:3000/api');

// 배포된 사이트들이 저장될 디렉토리
const deployedSitesPath = path.join(__dirname, 'deployed-sites');

// 디렉토리가 없으면 생성
if (!fs.existsSync(deployedSitesPath)) {
  fs.mkdirSync(deployedSitesPath, { recursive: true });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'PageCube Subdomain Server',
    version: '1.0.0',
    port: PORT,
    api_base_url: API_BASE_URL
  });
});

// 기본 경로 처리
app.get('/', (req, res) => {
  res.send(`
    <h1>Wildcard Subdomain Server</h1>
    <p>서브도메인으로 접근하세요: http://[subdomain].localhost:${PORT}</p>
    <p>예시: http://134qwe.localhost:${PORT}</p>
    <p>또는: http://localhost:${PORT}/134qwe</p>
  `);
});

// 서브도메인 처리 미들웨어 (호스트 기반)
app.use(async (req, res, next) => {
  const host = req.get('host');
  const subdomain = host.split('.')[0];
  
  console.log('🌐 Request Host:', host, 'Subdomain:', subdomain, 'Path:', req.path);
  
  // localhost 접근이면 다음으로
  if (host === `localhost:${PORT}` || subdomain === 'localhost' || subdomain.includes(':')) {
    return next();
  }
  
  // 진짜 서브도메인이면 처리
  return handleSubdomainRequest(subdomain, req, res);
});

// 서브도메인 요청 처리 함수
async function handleSubdomainRequest(subdomain, req, res) {
  try {
    console.log(`🔍 Fetching data for subdomain: ${subdomain}`);
    
    // 백엔드 API를 통해 서브도메인 데이터 가져오기
    const response = await axios.get(`${API_BASE_URL}/generator/subdomain/${subdomain}`);
    
    console.log('📦 API Response:', response.status, response.data);
    
    if (response.data && response.data.components) {
      // 백엔드 페이지 정보도 함께 전달
      const page = {
        title: response.data.title || 'Deployed Site',
        subdomain: subdomain
      };
      const html = generateHTMLFromComponents(response.data.components, page);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } else {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    }
  } catch (error) {
    console.error('❌ API error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    if (error.response && error.response.status === 404) {
      res.status(404).send(`
        <h1>404 - Site Not Found</h1>
        <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
      `);
    } else {
      res.status(500).send(`
        <h1>500 - Server Error</h1>
        <p>API 연결 오류: ${error.message}</p>
        <p>API URL: ${API_BASE_URL}/generator/subdomain/${subdomain}</p>
      `);
    }
  }
}

// 프론트엔드와 동일한 컴포넌트 렌더링 로직 사용
const { generateHTMLFromComponents } = require('./component-renderers');

// favicon.ico 요청 처리
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// 경로 기반 서브도메인 라우트 (미들웨어보다 먼저 처리)
app.get('/:subdomain', async (req, res) => {
  const subdomain = req.params.subdomain;
  
  // 특수 경로들은 제외
  if (subdomain === 'health' || subdomain === 'favicon.ico') {
    return res.next();
  }
  
  console.log('🎯 Path-based subdomain route:', subdomain);
  return handleSubdomainRequest(subdomain, req, res);
});

app.listen(PORT, () => {
  console.log(`🌐 Wildcard subdomain server running on http://localhost:${PORT}`);
  console.log(`📁 Deployed sites directory: ${deployedSitesPath}`);
});
