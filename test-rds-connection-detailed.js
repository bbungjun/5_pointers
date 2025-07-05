const mysql = require('mysql2/promise');

async function testRDSConnection() {
  // 일반적인 RDS 설정들을 테스트
  const configs = [
    {
      name: 'Admin 사용자 (기본 설정)',
      host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'admin123!',
      database: 'jungle'
    },
    {
      name: 'Admin 사용자 (간단한 비밀번호)',
      host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: '12345678',
      database: 'jungle'
    },
    {
      name: 'Root 사용자',
      host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'root',
      password: 'root123!',
      database: 'jungle'
    }
  ];

  console.log('🔍 RDS 연결 테스트 시작...');
  console.log('현재 IP:', await getCurrentIP());
  console.log('');

  for (const config of configs) {
    console.log(`📡 ${config.name} 테스트 중...`);
    
    try {
      const connection = await mysql.createConnection({
        ...config,
        connectTimeout: 10000,
        acquireTimeout: 10000
      });

      console.log('✅ 연결 성공!');
      
      // 데이터베이스 목록 확인
      const [databases] = await connection.execute('SHOW DATABASES');
      console.log('📋 데이터베이스 목록:');
      databases.forEach(db => {
        console.log(`  - ${Object.values(db)[0]}`);
      });

      // jungle 데이터베이스 사용
      await connection.execute('USE jungle');
      
      // 테이블 목록 확인
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
      console.log('✅ 연결 테스트 완료\n');
      return true;

    } catch (error) {
      console.error(`❌ 연결 실패: ${error.code} - ${error.message}`);
      
      if (error.code === 'ETIMEDOUT') {
        console.error('🔧 해결방법: AWS RDS 보안 그룹에서 포트 3306 허용 필요');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('🔧 해결방법: 올바른 사용자명/비밀번호 확인 필요');
      } else if (error.code === 'ENOTFOUND') {
        console.error('🔧 해결방법: RDS 엔드포인트 주소 확인 필요');
      }
      console.log('');
    }
  }

  console.log('📋 다음 단계:');
  console.log('1. AWS RDS 보안 그룹에서 포트 3306 인바운드 규칙 추가');
  console.log('2. 소스: 0.0.0.0/0 (모든 IP 허용)');
  console.log('3. GitHub Secrets에 올바른 DB 정보 설정');
  console.log('4. 백엔드 서버 재배포로 테이블 자동 생성');
  
  return false;
}

async function getCurrentIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Unknown';
  }
}

testRDSConnection();
