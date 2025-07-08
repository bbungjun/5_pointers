const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3002;

// MySQL 연결 설정
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '0000',
  database: 'jungle'
};

// 프록시 설정: 모든 요청을 서브도메인 서버로 전달
const subdomainProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    // 요청 경로에서 서브도메인 추출
    const subdomain = req.params.subdomain || req.url.split('/')[1];
    if (subdomain) {
      // Host 헤더를 서브도메인으로 설정
      proxyReq.setHeader('Host', `${subdomain}.localhost:3001`);
      console.log(`🔀 프록시: /${subdomain} -> ${subdomain}.localhost:3001`);
    }
  },
  onError: (err, req, res) => {
    console.error('프록시 오류:', err);
    res.status(500).send('프록시 서버 오류');
  }
});

// 홈페이지 - 배포된 서브도메인 목록 표시
app.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT subdomain, title, updated_at FROM pages WHERE status = "DEPLOYED" ORDER BY updated_at DESC'
    );
    await connection.end();

    const subdomainList = rows.map(row => 
      `<li><a href="/${row.subdomain}" target="_blank">${row.subdomain}</a> - ${row.title} (${new Date(row.updated_at).toLocaleString()})</li>`
    ).join('');

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>5Pointers 서브도메인 프록시</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; }
          .subdomain-list { background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
          ul { list-style-type: none; padding: 0; }
          li { margin-bottom: 10px; padding: 10px; background: white; border-radius: 4px; }
          a { color: #1976d2; text-decoration: none; font-weight: 500; }
          a:hover { text-decoration: underline; }
          .status { color: #4caf50; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌐 5Pointers 서브도메인 프록시</h1>
            <p class="status">✅ 서브도메인 서버가 실행 중입니다 (포트 3001)</p>
          </div>
          
          <div class="info">
            <h3>📋 사용 방법</h3>
            <p>아래 링크를 클릭하면 배포된 사이트에 접근할 수 있습니다.</p>
            <p><strong>프록시 주소:</strong> http://localhost:${PORT}/[서브도메인]</p>
          </div>
          
          <div class="subdomain-list">
            <h3>🚀 배포된 서브도메인 목록 (${rows.length}개)</h3>
            <ul>
              ${subdomainList}
            </ul>
          </div>
          
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>새로고침하면 최신 배포 목록을 확인할 수 있습니다.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('데이터베이스 오류:', error);
    res.status(500).send('<h1>데이터베이스 연결 오류</h1>');
  }
});

// 서브도메인별 프록시 라우트
app.use('/:subdomain', subdomainProxy);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🌐 서브도메인 프록시 서버가 http://localhost:${PORT}에서 실행 중입니다`);
  console.log(`📋 배포된 사이트 목록: http://localhost:${PORT}`);
  console.log(`🔗 사이트 접근 예시: http://localhost:${PORT}/testsite`);
});