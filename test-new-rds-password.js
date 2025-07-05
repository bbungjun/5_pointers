const mysql = require('mysql2/promise');

async function testNewRDSPassword() {
  // 새로 설정한 비밀번호로 테스트
  const newCredentials = [
    { user: 'admin', password: 'Jungle5pointers2025!' },
    { user: 'root', password: 'Jungle5pointers2025!' }
  ];

  const baseConfig = {
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    database: 'jungle',
    connectTimeout: 10000
  };

  console.log('🔑 새 비밀번호로 RDS 연결 테스트');
  console.log('================================');
  console.log('새 비밀번호: Jungle5pointers2025!');
  console.log('');

  for (const cred of newCredentials) {
    console.log(`📡 테스트 중: ${cred.user} 사용자`);
    
    try {
      const connection = await mysql.createConnection({
        ...baseConfig,
        user: cred.user,
        password: cred.password
      });

      console.log('🎉 ✅ 연결 성공!');
      console.log(`✅ 올바른 사용자 정보: ${cred.user} / ${cred.password}`);
      
      // 데이터베이스 확인
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('\n📋 데이터베이스 목록:');
      databases.forEach(db => {
        console.log(`  - ${Object.values(db)[0]}`);
      });

      // jungle 데이터베이스 사용
      await connection.execute('USE jungle');
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('\n📋 jungle 데이터베이스 테이블:');
      if (tables.length === 0) {
        console.log('  ⚠️ 테이블이 없습니다. 백엔드 서버 실행 시 TypeORM이 자동 생성합니다.');
      } else {
        tables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
      }

      await connection.end();
      
      console.log('\n🎯 GitHub Secrets 설정 정보:');
      console.log('================================');
      console.log(`DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com`);
      console.log(`DB_PORT=3306`);
      console.log(`DB_USERNAME=${cred.user}`);
      console.log(`DB_PASSWORD=${cred.password}`);
      console.log(`DB_DATABASE=jungle`);
      console.log(`JWT_SECRET=your_32_character_random_string_here`);
      
      console.log('\n🚀 다음 단계:');
      console.log('1. GitHub 저장소 → Settings → Secrets에서 위 정보 설정');
      console.log('2. 백엔드 재배포로 테이블 자동 생성');
      console.log('3. 로그인/회원가입 기능 테스트');
      
      return true;

    } catch (error) {
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('❌ 인증 실패 - 비밀번호 재설정이 아직 적용되지 않았을 수 있습니다.');
        console.log('   5-10분 더 대기 후 다시 시도하세요.');
      } else {
        console.log(`❌ 연결 실패: ${error.code} - ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('🕐 비밀번호 재설정이 완료되지 않았을 수 있습니다.');
  console.log('AWS 콘솔에서 RDS 인스턴스 상태를 확인하고 5-10분 후 다시 시도하세요.');
  
  return false;
}

testNewRDSPassword();
