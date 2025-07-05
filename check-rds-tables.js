const mysql = require('mysql2/promise');

async function checkRDSTables() {
  // 다양한 가능한 설정으로 테스트
  const configs = [
    {
      name: 'Admin 사용자',
      host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: process.env.DB_PASSWORD || 'admin123!', // 일반적인 기본 비밀번호
      database: 'jungle',
      connectTimeout: 10000
    },
    {
      name: 'Root 사용자',
      host: 'pointers-mysql-db.chiyuym88mcj.ap-northeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'root',
      password: process.env.DB_PASSWORD || 'root123!',
      database: 'jungle',
      connectTimeout: 10000
    }
  ];

  for (const config of configs) {
    console.log(`\n🔍 ${config.name}로 RDS 연결 시도...`);
    console.log(`Host: ${config.host}`);
    console.log(`Database: ${config.database}`);
    
    try {
      const connection = await mysql.createConnection(config);
      console.log('✅ RDS 연결 성공!');
      
      // 데이터베이스 목록 확인
      console.log('\n📋 데이터베이스 목록:');
      const [databases] = await connection.execute('SHOW DATABASES');
      databases.forEach(db => {
        console.log(`  - ${Object.values(db)[0]}`);
      });
      
      // jungle 데이터베이스 선택
      await connection.execute('USE jungle');
      console.log('\n📋 jungle 데이터베이스의 테이블 목록:');
      
      const [tables] = await connection.execute('SHOW TABLES');
      if (tables.length === 0) {
        console.log('❌ 테이블이 없습니다!');
      } else {
        tables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
        
        // 각 테이블의 구조와 데이터 확인
        for (const table of tables) {
          const tableName = Object.values(table)[0];
          console.log(`\n🔍 ${tableName} 테이블 정보:`);
          
          try {
            // 테이블 구조 확인
            const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log('  구조:');
            structure.forEach(col => {
              console.log(`    - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });
            
            // 데이터 개수 확인
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`  데이터 개수: ${count[0].count}개`);
            
            // 샘플 데이터 확인 (최대 3개)
            if (count[0].count > 0) {
              const [sample] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
              console.log('  샘플 데이터:');
              sample.forEach((row, index) => {
                console.log(`    ${index + 1}. ${JSON.stringify(row, null, 2)}`);
              });
            }
          } catch (error) {
            console.log(`  ❌ 테이블 정보 조회 실패: ${error.message}`);
          }
        }
      }
      
      await connection.end();
      console.log('\n✅ RDS 테이블 확인 완료');
      return true;
      
    } catch (error) {
      console.error(`❌ 연결 실패: ${error.code} - ${error.message}`);
      
      if (error.code === 'ENOTFOUND') {
        console.error('🔍 DNS 해결 실패 - 호스트명 확인 필요');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('🔍 연결 거부 - 포트나 보안 그룹 확인 필요');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('🔍 인증 실패 - 사용자명/비밀번호 확인 필요');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('🔍 연결 타임아웃 - 보안 그룹 설정 확인 필요');
      }
    }
  }
  
  console.log('\n📋 해결 방법:');
  console.log('1. AWS RDS 보안 그룹에서 현재 IP (1.238.129.195) 허용');
  console.log('2. RDS 인스턴스 퍼블릭 액세스 활성화');
  console.log('3. 올바른 데이터베이스 사용자명/비밀번호 확인');
  console.log('4. 만약 테이블이 없다면 NestJS 애플리케이션 실행으로 자동 생성');
  
  return false;
}

// NestJS 엔티티 기반 예상 테이블 목록
console.log('🎯 예상되는 테이블 목록 (NestJS 엔티티 기반):');
console.log('- users: 사용자 정보');
console.log('- pages: 페이지 정보');  
console.log('- page_members: 페이지 멤버 정보');
console.log('- submissions: 제출 정보');
console.log('- templates: 템플릿 정보');

checkRDSTables();
