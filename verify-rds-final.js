const mysql = require('mysql2/promise');

async function verifyRDSConnection() {
  const config = {
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Jungle5pointers2025!',
    database: 'jungle',
    connectTimeout: 10000
  };

  console.log('🔍 최종 RDS 연결 확인');
  console.log('====================');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ RDS 연결 성공!');
    console.log('✅ 사용자: admin');
    console.log('✅ 데이터베이스: jungle');
    
    // 간단한 쿼리로 연결 확인
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ 쿼리 실행 성공:', result[0]);

    // 테이블 목록 확인 (prepared statement 사용 안 함)
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 jungle 데이터베이스 테이블:');
    if (tables.length === 0) {
      console.log('  ⚠️ 테이블이 없습니다. (정상 - 백엔드 서버 실행 시 TypeORM이 자동 생성)');
    } else {
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
    }

    await connection.end();

    console.log('\n🎉 RDS 설정 완료!');
    console.log('==================');
    console.log('✅ 네트워크 연결: 정상');
    console.log('✅ 인증: 성공');
    console.log('✅ 데이터베이스: jungle 사용 가능');
    console.log('✅ 쿼리 실행: 정상');

    console.log('\n🎯 GitHub Secrets 설정 정보:');
    console.log('DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com');
    console.log('DB_PORT=3306');
    console.log('DB_USERNAME=admin');
    console.log('DB_PASSWORD=Jungle5pointers2025!');
    console.log('DB_DATABASE=jungle');

    console.log('\n🚀 다음 단계:');
    console.log('1. ✅ RDS 연결 문제 해결 완료');
    console.log('2. 📝 GitHub Secrets에 위 DB 정보 설정');
    console.log('3. 🚀 백엔드 재배포로 테이블 자동 생성');
    console.log('4. 🧪 로그인/회원가입 기능 테스트');

    return true;

  } catch (error) {
    console.error('❌ 연결 실패:', error.message);
    console.error('코드:', error.code);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('🔧 인증 문제: 사용자명/비밀번호 확인 필요');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('🔧 네트워크 문제: 보안 그룹 설정 확인 필요');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('🔧 데이터베이스 문제: jungle 데이터베이스 생성 필요');
    }
    
    return false;
  }
}

verifyRDSConnection();
