/**
 * 간단한 WebSocket 부하 테스트
 * Y.js 없이 순수 WebSocket 연결 테스트
 */

const WebSocket = require('ws');

class SimpleWebSocketTester {
  constructor(options = {}) {
    this.serverUrl = options.serverUrl || 'ws://43.203.235.108:1234';
    this.maxClients = options.maxClients || 50;
    this.testDuration = options.testDuration || 60000; // 1분
    this.messageInterval = options.messageInterval || 1000; // 1초
    
    this.clients = [];
    this.stats = {
      connected: 0,
      disconnected: 0,
      errors: 0,
      messagesSent: 0,
      messagesReceived: 0,
      startTime: null
    };
  }

  // 단일 WebSocket 클라이언트 생성
  createClient(clientId) {
    return new Promise((resolve, reject) => {
      const roomId = (clientId % 5) + 1; // 5개 룸에 분산
      const url = `${this.serverUrl}/page:test-room-${roomId}`;
      
      console.log(`🔗 클라이언트 ${clientId} 연결 시도: ${url}`);
      
      const ws = new WebSocket(url, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });

      const client = {
        id: clientId,
        ws: ws,
        roomId: roomId,
        messageCount: 0,
        isConnected: false
      };

      ws.on('open', () => {
        client.isConnected = true;
        this.stats.connected++;
        console.log(`✅ 클라이언트 ${clientId} 연결됨 (총 ${this.stats.connected}개)`);
        
        // 주기적으로 메시지 전송
        this.startMessageSending(client);
        resolve(client);
      });

      ws.on('message', (data) => {
        client.messageCount++;
        this.stats.messagesReceived++;
      });

      ws.on('close', () => {
        client.isConnected = false;
        this.stats.disconnected++;
        console.log(`❌ 클라이언트 ${clientId} 연결 해제됨`);
      });

      ws.on('error', (error) => {
        this.stats.errors++;
        console.error(`🚨 클라이언트 ${clientId} 오류:`, error.message);
        reject(error);
      });

      this.clients.push(client);
    });
  }

  // 메시지 전송 시작
  startMessageSending(client) {
    const sendInterval = setInterval(() => {
      if (!client.isConnected || client.ws.readyState !== WebSocket.OPEN) {
        clearInterval(sendInterval);
        return;
      }

      const message = JSON.stringify({
        type: 'test',
        clientId: client.id,
        roomId: client.roomId,
        data: `Test message from client ${client.id}`,
        timestamp: Date.now()
      });

      try {
        client.ws.send(message);
        this.stats.messagesSent++;
      } catch (error) {
        console.error(`메시지 전송 실패 (클라이언트 ${client.id}):`, error.message);
        clearInterval(sendInterval);
      }
    }, this.messageInterval);

    // 테스트 종료 시 정리
    setTimeout(() => {
      clearInterval(sendInterval);
    }, this.testDuration);
  }

  // 부하 테스트 실행
  async runTest() {
    console.log(`🚀 WebSocket 부하 테스트 시작`);
    console.log(`📊 설정: ${this.maxClients}개 클라이언트, ${this.testDuration/1000}초`);
    
    this.stats.startTime = Date.now();

    // 클라이언트를 배치로 생성 (서버 과부하 방지)
    const batchSize = 10;
    const batches = Math.ceil(this.maxClients / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchPromises = [];
      const startId = batch * batchSize + 1;
      const endId = Math.min(startId + batchSize - 1, this.maxClients);
      
      for (let clientId = startId; clientId <= endId; clientId++) {
        batchPromises.push(
          this.createClient(clientId).catch(error => {
            console.error(`클라이언트 ${clientId} 생성 실패:`, error.message);
          })
        );
      }
      
      await Promise.allSettled(batchPromises);
      console.log(`📈 배치 ${batch + 1}/${batches} 완료`);
      
      // 배치 간 잠시 대기
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`🎯 모든 클라이언트 연결 완료. 테스트 진행 중...`);

    // 주기적 상태 리포트
    const reportInterval = setInterval(() => {
      this.printStats();
    }, 5000);

    // 테스트 완료 대기
    await new Promise(resolve => setTimeout(resolve, this.testDuration));
    
    clearInterval(reportInterval);
    await this.cleanup();
    this.printFinalReport();
  }

  // 실시간 통계 출력
  printStats() {
    const elapsed = (Date.now() - this.stats.startTime) / 1000;
    const messagesPerSecond = Math.round(this.stats.messagesReceived / elapsed);
    
    console.log(`
📊 실시간 통계 (${elapsed.toFixed(0)}초 경과):
   🔗 연결된 클라이언트: ${this.stats.connected}
   📨 수신 메시지: ${this.stats.messagesReceived} (${messagesPerSecond}/초)
   📤 송신 메시지: ${this.stats.messagesSent}
   ❌ 오류: ${this.stats.errors}
    `);
  }

  // 최종 리포트
  printFinalReport() {
    const totalTime = (Date.now() - this.stats.startTime) / 1000;
    const avgMessagesPerSecond = Math.round(this.stats.messagesReceived / totalTime);
    const successRate = (this.stats.connected / this.maxClients) * 100;
    
    console.log(`
🎉 WebSocket 부하 테스트 완료!

📈 최종 결과:
   ⏱️  총 테스트 시간: ${totalTime.toFixed(1)}초
   👥 최대 동시 연결: ${this.stats.connected}명
   📨 총 메시지 수신: ${this.stats.messagesReceived}개
   📤 총 메시지 송신: ${this.stats.messagesSent}개
   📊 평균 처리량: ${avgMessagesPerSecond} 메시지/초
   ❌ 총 오류 수: ${this.stats.errors}개
   ✅ 연결 성공률: ${successRate.toFixed(1)}%

🏆 성능 평가:
   ${avgMessagesPerSecond > 100 ? '🟢 우수' : avgMessagesPerSecond > 50 ? '🟡 양호' : '🔴 개선 필요'}
   (목표: 100+ 메시지/초)
    `);
  }

  // 정리 작업
  async cleanup() {
    console.log('🧹 테스트 정리 중...');
    
    this.clients.forEach(client => {
      if (client.ws && client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });
    
    // 연결 종료 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✅ 정리 완료');
  }
}

// 테스트 실행
async function runSimpleTest() {
  const tester = new SimpleWebSocketTester({
    serverUrl: process.env.WS_SERVER_URL || 'ws://43.203.235.108:1234',
    maxClients: parseInt(process.env.MAX_CLIENTS) || 50,
    testDuration: parseInt(process.env.TEST_DURATION) || 60000,
    messageInterval: parseInt(process.env.MESSAGE_INTERVAL) || 1000
  });

  try {
    await tester.runTest();
  } catch (error) {
    console.error('🚨 테스트 실패:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSimpleTest();
}

module.exports = SimpleWebSocketTester;
