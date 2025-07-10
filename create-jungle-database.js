const mysql = require('mysql2/promise');

async function createJungleDatabase() {
  const config = {
    host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Jungle5pointers2025!',
    // 데이터베이스를 지정하지 않고 연결
    connectTimeout: 10000
  };


  try {
    // 데이터베이스 지정 없이 연결
    const connection = await mysql.createConnection(config);

    // 기존 데이터베이스 목록 확인
    const [databases] = await connection.execute('SHOW DATABASES');
    databases.forEach(db => {
      console.log(`  - ${Object.values(db)[0]}`);
    });

    // jungle 데이터베이스가 있는지 확인
    const jungleExists = databases.some(db => Object.values(db)[0] === 'jungle');
    
    if (jungleExists) {
      console.log('\n✅ jungle 데이터베이스가 이미 존재합니다.');
    } else {
      console.log('\n🔧 jungle 데이터베이스 생성 중...');
      await connection.execute('CREATE DATABASE jungle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ jungle 데이터베이스 생성 완료!');
    }

    // jungle 데이터베이스 사용
    await connection.execute('USE jungle');
    console.log('✅ jungle 데이터베이스 선택 완료');

    // 테이블 목록 확인
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

    console.log('\n🎉 설정 완료!');
    console.log('================================');
    console.log('✅ RDS 연결: 성공');
    console.log('✅ admin 사용자: 인증 성공');
    console.log('✅ jungle 데이터베이스: 생성/확인 완료');
    console.log('✅ 비밀번호: Jungle5pointers2025!');

    console.log('\n🎯 GitHub Secrets 설정 정보:');
    console.log('DB_HOST=pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com');
    console.log('DB_PORT=3306');
    console.log('DB_USERNAME=admin');
    console.log('DB_PASSWORD=Jungle5pointers2025!');
    console.log('DB_DATABASE=jungle');
    console.log('JWT_SECRET=ceafbee808f6c9c2429b5b3fdab88f1c77cd7b3a4cba1cbe1d91325f5213978f');

    console.log('\n🚀 다음 단계:');
    console.log('1. GitHub Secrets에 위 정보 설정');
    console.log('2. 백엔드 재배포로 테이블 자동 생성');
    console.log('3. 로그인/회원가입 기능 테스트');

    return true;

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('코드:', error.code);
    return false;
  }
}

createJungleDatabase();
