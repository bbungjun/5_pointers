/**
 * 고급 Y.js WebSocket 테스트 시나리오
 */

const YjsLoadTester = require('./yjs-load-test');

class AdvancedTestScenarios {
  
  // 시나리오 1: 점진적 부하 증가 테스트
  static async gradualLoadTest() {
    console.log('🎯 시나리오 1: 점진적 부하 증가 테스트');
    
    const phases = [
      { clients: 10, duration: 60000, name: '워밍업' },
      { clients: 25, duration: 120000, name: '초기 부하' },
      { clients: 50, duration: 180000, name: '중간 부하' },
      { clients: 100, duration: 300000, name: '최대 부하' },
      { clients: 150, duration: 120000, name: '스트레스 테스트' }
    ];

    for (const phase of phases) {
      console.log(`📈 ${phase.name}: ${phase.clients}명 사용자, ${phase.duration/1000}초`);
      
      const tester = new YjsLoadTester({
        maxClients: phase.clients,
        testDuration: phase.duration,
        roomCount: Math.ceil(phase.clients / 10)
      });
      
      await tester.runLoadTest();
      
      // 페이즈 간 휴식
      console.log('😴 30초 휴식...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // 시나리오 2: 룸 집중도 테스트
  static async roomConcentrationTest() {
    console.log('🎯 시나리오 2: 룸 집중도 테스트');
    
    const scenarios = [
      { clients: 100, rooms: 1, name: '단일 룸 집중' },
      { clients: 100, rooms: 5, name: '소수 룸 분산' },
      { clients: 100, rooms: 20, name: '다수 룸 분산' },
      { clients: 100, rooms: 100, name: '개별 룸' }
    ];

    for (const scenario of scenarios) {
      console.log(`🏠 ${scenario.name}: ${scenario.clients}명 → ${scenario.rooms}개 룸`);
      
      const tester = new YjsLoadTester({
        maxClients: scenario.clients,
        roomCount: scenario.rooms,
        testDuration: 180000 // 3분
      });
      
      await tester.runLoadTest();
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // 시나리오 3: 네트워크 장애 시뮬레이션
  static async networkFailureTest() {
    console.log('🎯 시나리오 3: 네트워크 장애 시뮬레이션');
    
    // 정상 연결 후 일부 클라이언트 강제 종료
    const tester = new YjsLoadTester({
      maxClients: 50,
      testDuration: 300000
    });

    // 테스트 시작
    const testPromise = tester.runLoadTest();
    
    // 2분 후 30% 클라이언트 강제 종료
    setTimeout(() => {
      console.log('🚨 네트워크 장애 시뮬레이션: 30% 클라이언트 강제 종료');
      const clientsToDisconnect = Math.floor(tester.clients.length * 0.3);
      
      for (let i = 0; i < clientsToDisconnect; i++) {
        const client = tester.clients[i];
        if (client && client.provider) {
          client.provider.destroy();
        }
      }
    }, 120000);

    await testPromise;
  }

  // 시나리오 4: 메모리 누수 테스트
  static async memoryLeakTest() {
    console.log('🎯 시나리오 4: 메모리 누수 테스트');
    
    const cycles = 5;
    const clientsPerCycle = 50;
    
    for (let cycle = 1; cycle <= cycles; cycle++) {
      console.log(`🔄 사이클 ${cycle}/${cycles}: ${clientsPerCycle}명 연결 → 해제`);
      
      const tester = new YjsLoadTester({
        maxClients: clientsPerCycle,
        testDuration: 60000 // 1분
      });
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      await tester.runLoadTest();
      
      // 강제 가비지 컬렉션
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDiff = (finalMemory - initialMemory) / 1024 / 1024;
      
      console.log(`💾 메모리 변화: ${memoryDiff.toFixed(2)}MB`);
      
      if (memoryDiff > 50) {
        console.warn('⚠️  메모리 누수 의심!');
      }
      
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }

  // 시나리오 5: 대용량 데이터 동기화 테스트
  static async largeDataSyncTest() {
    console.log('🎯 시나리오 5: 대용량 데이터 동기화 테스트');
    
    // 큰 데이터를 가진 클라이언트들
    const tester = new YjsLoadTester({
      maxClients: 20,
      testDuration: 180000,
      roomCount: 2
    });

    // 대용량 데이터 생성 함수 오버라이드
    const originalEditingSimulation = tester.startEditingSimulation;
    tester.startEditingSimulation = function(client) {
      const yarray = client.ydoc.getArray('components');
      
      // 초기에 큰 데이터 삽입
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: `large-component-${i}-${client.id}`,
        type: 'text',
        content: 'A'.repeat(1000), // 1KB 텍스트
        data: Array.from({ length: 50 }, (_, j) => `data-${j}`),
        timestamp: Date.now()
      }));
      
      yarray.push(largeData);
      
      // 기존 편집 시뮬레이션 실행
      originalEditingSimulation.call(this, client);
    };

    await tester.runLoadTest();
  }
}

// 테스트 실행
async function runAdvancedTests() {
  console.log('🚀 고급 Y.js WebSocket 테스트 시작');
  
  const scenarios = [
    AdvancedTestScenarios.gradualLoadTest,
    AdvancedTestScenarios.roomConcentrationTest,
    AdvancedTestScenarios.networkFailureTest,
    AdvancedTestScenarios.memoryLeakTest,
    AdvancedTestScenarios.largeDataSyncTest
  ];

  for (let i = 0; i < scenarios.length; i++) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`테스트 ${i + 1}/${scenarios.length} 시작`);
    console.log(`${'='.repeat(50)}\n`);
    
    try {
      await scenarios[i]();
    } catch (error) {
      console.error(`❌ 테스트 ${i + 1} 실패:`, error);
    }
    
    console.log(`\n✅ 테스트 ${i + 1} 완료\n`);
  }
  
  console.log('🎉 모든 고급 테스트 완료!');
}

if (require.main === module) {
  runAdvancedTests();
}

module.exports = AdvancedTestScenarios;
