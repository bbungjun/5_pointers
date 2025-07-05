const mysql = require('mysql2/promise');

async function testRDSConnection() {
  // README에서 확인한 RDS 정보
  const config = {
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin', // 일반적인 RDS 기본 사용자명
    password: process.env.DB_PASSWORD || 'your_password_here',
    database: 'jungle',
    connectTimeout: 10000,
    acquireTimeout: 10000,
    timeout: 10000,
  };

  console.log('RDS 연결 테스트 시작...');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('User:', config.user);

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ RDS 연결 성공!');
    
    // 테이블 목록 확인
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 데이터베이스 테이블 목록:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Users 테이블 확인
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users 테이블 레코드 수: ${users[0].count}`);
    } catch (error) {
      console.log('⚠️ Users 테이블이 존재하지 않거나 접근할 수 없습니다:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ RDS 연결 실패:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🔍 DNS 해결 실패 - 호스트명을 확인하세요');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔍 연결 거부 - 포트나 보안 그룹을 확인하세요');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔍 인증 실패 - 사용자명/비밀번호를 확인하세요');
    }
  }
}

testRDSConnection();
