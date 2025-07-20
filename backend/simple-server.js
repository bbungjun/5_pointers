const express = require('express');
const app = express();

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    service: '5pointers-backend',
    message: 'Simple Express Server Running'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '5Pointers Backend API - Simple Server',
    timestamp: new Date(),
    status: 'running',
    endpoints: ['/health', '/auth/signup/local', '/auth/login/local']
  });
});

// 임시 회원가입 엔드포인트
app.post('/auth/signup/local', (req, res) => {
  res.json({
    success: true,
    message: 'Signup endpoint working - DB connection needed',
    timestamp: new Date()
  });
});

// 임시 로그인 엔드포인트
app.post('/auth/login/local', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint working - DB connection needed',
    timestamp: new Date()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  // 서버 시작
});
