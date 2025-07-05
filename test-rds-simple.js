const mysql = require('mysql2');

// 다양한 RDS 설정으로 테스트
const configs = [
  {
    name: 'README의 RDS 정보',
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'your_password_here', // 실제 비밀번호로 변경 필요
    database: 'jungle'
  },
  {
    name: '기본 root 사용자',
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'root',
    password: 'your_password_here', // 실제 비밀번호로 변경 필요
    database: 'jungle'
  }
];

async function testConnection(config) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 ${config.name} 테스트 중...`);
    console.log(`Host: ${config.host}`);
    console.log(`User: ${config.user}`);
    console.log(`Database: ${config.database}`);
    
    const connection = mysql.createConnection({
      ...config,
      connectTimeout: 5000,
      timeout: 5000
    });

    connection.connect((err) => {
      if (err) {
        console.error(`❌ 연결 실패: ${err.code} - ${err.message}`);
        connection.destroy();
        resolve(false);
      } else {
        console.log('✅ 연결 성공!');
        
        // 간단한 쿼리 테스트
        connection.query('SELECT 1 as test', (err, results) => {
          if (err) {
            console.error(`❌ 쿼리 실패: ${err.message}`);
          } else {
            console.log('✅ 쿼리 성공:', results);
          }
          connection.end();
          resolve(true);
        });
      }
    });

    // 타임아웃 처리
    setTimeout(() => {
      console.error('❌ 연결 타임아웃 (5초)');
      connection.destroy();
      resolve(false);
    }, 5000);
  });
}

async function runTests() {
  console.log('RDS 연결 테스트 시작...\n');
  
  for (const config of configs) {
    await testConnection(config);
  }
  
  console.log('\n📋 문제 해결 방법:');
  console.log('1. RDS 보안 그룹에서 현재 IP 주소 허용 확인');
  console.log('2. RDS 인스턴스가 Public Access 허용으로 설정되어 있는지 확인');
  console.log('3. 올바른 데이터베이스 사용자명/비밀번호 확인');
  console.log('4. VPC 및 서브넷 설정 확인');
}

runTests();
