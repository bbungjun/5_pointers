/**
 * Y.js WebSocket 대용량 동시접속 테스트
 * 실제 Y.js 협업 시나리오를 시뮬레이션
 */

const WebSocket = require('ws');
const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

class YjsLoadTester {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'ws://43.203.235.108:1234';
    this.maxClients = options.maxClients || 100;
    this.rampUpTime = options.rampUpTime || 60000; // 1분
    this.testDuration = options.testDuration || 300000; // 5분
    this.roomPrefix = options.roomPrefix || 'load-test-room';
    this.roomCount = options.roomCount || 10;
    
    this.clients = [];
    this.stats = {
      connected: 0,
      disconnected: 0,
      errors: 0,
      messagesReceived: 0,
      messagesSent: 0,
      startTime: null,
      endTime: null
    };
  }

  // 단일 클라이언트 생성
  createClient(clientId, roomId) {
    return new Promise((resolve, reject) => {
      const ydoc = new Y.Doc();
      const roomName = `${this.roomPrefix}-${roomId}`;
      
      console.log(`🔗 클라이언트 ${clientId} 연결 시도: ${roomName}`);
      
      const provider = new WebsocketProvider(
        this.serverUrl,
        roomName,
        ydoc
      );

      const client = {
        id: clientId,
        roomId,
        ydoc,
        provider,
        isConnected: false,
        messageCount: 0
      };

      // 연결 이벤트 핸들러
      provider.on('status', ({ status }) => {
        if (status === 'connected') {
          client.isConnected = true;
          this.stats.connected++;
          console.log(`✅ 클라이언트 ${clientId} 연결됨 (총 ${this.stats.connected}개)`);
          resolve(client);
        } else if (status === 'disconnected') {
          client.isConnected = false;
          this.stats.disconnected++;
          console.log(`❌ 클라이언트 ${clientId} 연결 해제됨`);
        }
      });

      // 에러 핸들러
      provider.on('connection-error', (error) => {
        this.stats.errors++;
        console.error(`🚨 클라이언트 ${clientId} 연결 오류:`, error.message);
        reject(error);
      });

      // Y.js 문서 변경 감지
      ydoc.on('update', (update) => {
        client.messageCount++;
        this.stats.messagesReceived++;
      });

      // 시뮬레이션된 편집 작업 시작
      this.startEditingSimulation(client);
      
      this.clients.push(client);
    });
  }

  // 편집 작업 시뮬레이션
  startEditingSimulation(client) {
    const yarray = client.ydoc.getArray('components');
    
    const editingInterval = setInterval(() => {
      if (!client.isConnected) {
        clearInterval(editingInterval);
        return;
      }

      // 랜덤한 편집 작업 시뮬레이션
      const operations = [
        () => {
          // 컴포넌트 추가
          yarray.push([{
            id: `component-${Date.now()}-${Math.random()}`,
            type: 'text',
            content: `Test content from client ${client.id}`,
            x: Math.random() * 800,
            y: Math.random() * 600,
            timestamp: Date.now()
          }]);
          this.stats.messagesSent++;
        },
        () => {
          // 기존 컴포넌트 수정
          if (yarray.length > 0) {
            const index = Math.floor(Math.random() * yarray.length);
            const component = yarray.get(index);
            if (component) {
              component.x = Math.random() * 800;
              component.y = Math.random() * 600;
              component.timestamp = Date.now();
              this.stats.messagesSent++;
            }
          }
        },
        () => {
          // 컴포넌트 삭제
          if (yarray.length > 0) {
            const index = Math.floor(Math.random() * yarray.length);
            yarray.delete(index, 1);
            this.stats.messagesSent++;
          }
        }
      ];

      // 랜덤한 작업 실행
      const operation = operations[Math.floor(Math.random() * operations.length)];
      operation();
      
    }, 1000 + Math.random() * 2000); // 1-3초마다 편집

    // 테스트 종료 시 정리
    setTimeout(() => {
      clearInterval(editingInterval);
    }, this.testDuration);
  }

  // 부하 테스트 실행
  async runLoadTest() {
    console.log(`🚀 Y.js 부하 테스트 시작`);
    console.log(`📊 설정: ${this.maxClients}명 사용자, ${this.roomCount}개 룸, ${this.testDuration/1000}초`);
    
    this.stats.startTime = Date.now();
    
    // 점진적으로 클라이언트 추가
    const clientsPerBatch = Math.ceil(this.maxClients / 10);
    const batchInterval = this.rampUpTime / 10;
    
    for (let batch = 0; batch < 10; batch++) {
      const batchPromises = [];
      
      for (let i = 0; i < clientsPerBatch && (batch * clientsPerBatch + i) < this.maxClients; i++) {
        const clientId = batch * clientsPerBatch + i + 1;
        const roomId = (clientId % this.roomCount) + 1;
        
        batchPromises.push(
          this.createClient(clientId, roomId).catch(error => {
            console.error(`클라이언트 ${clientId} 생성 실패:`, error.message);
          })
        );
      }
      
      await Promise.allSettled(batchPromises);
      console.log(`📈 배치 ${batch + 1}/10 완료 (${this.stats.connected}개 연결됨)`);
      
      if (batch < 9) {
        await new Promise(resolve => setTimeout(resolve, batchInterval));
      }
    }

    console.log(`🎯 모든 클라이언트 연결 완료. 테스트 진행 중...`);
    
    // 주기적 상태 리포트
    const reportInterval = setInterval(() => {
      this.printStats();
    }, 10000); // 10초마다

    // 테스트 완료 대기
    await new Promise(resolve => setTimeout(resolve, this.testDuration));
    
    clearInterval(reportInterval);
    await this.cleanup();
    
    this.stats.endTime = Date.now();
    this.printFinalReport();
  }

  // 통계 출력
  printStats() {
    const now = Date.now();
    const elapsed = (now - this.stats.startTime) / 1000;
    const messagesPerSecond = Math.round(this.stats.messagesReceived / elapsed);
    
    console.log(`
📊 실시간 통계 (${elapsed.toFixed(0)}초 경과):
   🔗 연결된 클라이언트: ${this.stats.connected}
   📨 수신 메시지: ${this.stats.messagesReceived} (${messagesPerSecond}/초)
   📤 송신 메시지: ${this.stats.messagesSent}
   ❌ 오류: ${this.stats.errors}
   💾 메모리 사용량: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
    `);
  }

  // 최종 리포트
  printFinalReport() {
    const totalTime = (this.stats.endTime - this.stats.startTime) / 1000;
    const avgMessagesPerSecond = Math.round(this.stats.messagesReceived / totalTime);
    
    console.log(`
🎉 Y.js 부하 테스트 완료!

📈 최종 결과:
   ⏱️  총 테스트 시간: ${totalTime.toFixed(1)}초
   👥 최대 동시 연결: ${Math.max(this.stats.connected)}명
   📨 총 메시지 수신: ${this.stats.messagesReceived}개
   📤 총 메시지 송신: ${this.stats.messagesSent}개
   📊 평균 처리량: ${avgMessagesPerSecond} 메시지/초
   ❌ 총 오류 수: ${this.stats.errors}개
   ✅ 성공률: ${((this.stats.connected / this.maxClients) * 100).toFixed(1)}%

🏆 성능 평가:
   ${avgMessagesPerSecond > 500 ? '🟢 우수' : avgMessagesPerSecond > 200 ? '🟡 양호' : '🔴 개선 필요'}
   (목표: 500+ 메시지/초)
    `);
  }

  // 정리 작업
  async cleanup() {
    console.log('🧹 테스트 정리 중...');
    
    const cleanupPromises = this.clients.map(client => {
      return new Promise(resolve => {
        if (client.provider) {
          client.provider.destroy();
        }
        resolve();
      });
    });
    
    await Promise.all(cleanupPromises);
    console.log('✅ 정리 완료');
  }
}

// 테스트 실행
async function runTest() {
  const tester = new YjsLoadTester({
    serverUrl: process.env.YJS_SERVER_URL || 'ws://43.203.235.108:1234',
    maxClients: parseInt(process.env.MAX_CLIENTS) || 100,
    testDuration: parseInt(process.env.TEST_DURATION) || 300000, // 5분
    roomCount: parseInt(process.env.ROOM_COUNT) || 10
  });

  try {
    await tester.runLoadTest();
  } catch (error) {
    console.error('🚨 테스트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 직접 실행 시
if (require.main === module) {
  runTest();
}

module.exports = YjsLoadTester;
