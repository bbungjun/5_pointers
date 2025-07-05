const mysql = require('mysql2/promise');

async function testRDSCredentials() {
  // 다양한 사용자명/비밀번호 조합 테스트
  const credentials = [
    // 일반적인 admin 조합
    { user: 'admin', password: 'admin123!' },
    { user: 'admin', password: '12345678' },
    { user: 'admin', password: 'password' },
    { user: 'admin', password: 'admin' },
    { user: 'admin', password: 'jungle123!' },
    
    // root 사용자 조합
    { user: 'root', password: 'root123!' },
    { user: 'root', password: '12345678' },
    { user: 'root', password: 'password' },
    { user: 'root', password: 'root' },
    
    // 기타 가능한 조합
    { user: 'mysql', password: 'mysql123!' },
    { user: 'dbadmin', password: 'dbadmin123!' },
    { user: 'jungle', password: 'jungle123!' },
  ];

  const baseConfig = {
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    database: 'jungle',
    connectTimeout: 10000
  };

  console.log('🔑 RDS 사용자 인증 테스트 시작...');
  console.log('=====================================');

  for (let i = 0; i < credentials.length; i++) {
    const cred = credentials[i];
    console.log(`\n📡 테스트 ${i + 1}/${credentials.length}: ${cred.user} / ${cred.password}`);
    
    try {
      const connection = await mysql.createConnection({
        ...baseConfig,
        user: cred.user,
        password: cred.password
      });

      console.log('🎉 ✅ 연결 성공!');
      console.log(`올바른 사용자 정보: ${cred.user} / ${cred.password}`);
      
      // 데이터베이스 정보 확인
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('📋 데이터베이스 목록:');
      databases.forEach(db => {
        console.log(`  - ${Object.values(db)[0]}`);
      });

      // jungle 데이터베이스 테이블 확인
      await connection.execute('USE jungle');
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 jungle 데이터베이스 테이블:');
      if (tables.length === 0) {
        console.log('  ⚠️ 테이블이 없습니다. 백엔드 서버 실행 시 자동 생성됩니다.');
      } else {
        tables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
      }

      await connection.end();
      
      console.log('\n🎯 GitHub Secrets 설정 정보:');
      console.log(`DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com`);
      console.log(`DB_PORT=3306`);
      console.log(`DB_USERNAME=${cred.user}`);
      console.log(`DB_PASSWORD=${cred.password}`);
      console.log(`DB_DATABASE=jungle`);
      
      return { user: cred.user, password: cred.password };

    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('❌ 인증 실패');
      } else {
        console.log(`❌ 연결 실패: ${error.code} - ${error.message}`);
      }
    }
  }

  console.log('\n🚨 모든 조합 실패!');
  console.log('📋 해결 방법:');
  console.log('1. AWS 콘솔에서 RDS 마스터 사용자명 확인');
  console.log('2. 비밀번호 재설정 (RDS → 수정 → 새 마스터 암호)');
  console.log('3. 새 비밀번호로 다시 테스트');
  
  return null;
}

testRDSCredentials();
