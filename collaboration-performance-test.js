/**
 * 5Pointers 협업 기능 성능 테스트 스크립트
 * 
 * 테스트 항목:
 * 1. 동시 사용자 연결 테스트
 * 2. 컴포넌트 동기화 지연시간 측정
 * 3. 메모리 사용량 모니터링
 * 4. 네트워크 처리량 테스트
 * 5. 충돌 해결 성능 테스트
 */

const WebSocket = require('ws');
const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

// Node.js 환경에서 WebSocket 글로벌 설정
global.WebSocket = WebSocket;

class CollaborationPerformanceTest {
  constructor(options = {}) {
    this.wsUrl = options.wsUrl || 'wss://ws.ddukddak.org:1235';
    this.roomName = options.roomName || 'test-room-performance';
    this.maxClients = options.maxClients || 50;
    this.testDuration = options.testDuration || 60000; // 1분
    this.componentUpdateInterval = options.componentUpdateInterval || 1000; // 1초
    
    this.clients = [];
    this.metrics = {
      connectionTimes: [],
      syncLatencies: [],
      memoryUsage: [],
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      conflicts: 0
    };
    
    this.isRunning = false;
    this.startTime = null;
    
    // EventEmitter 메모리 누수 경고 해결
    process.setMaxListeners(100);
  }

  /**
   * 메인 테스트 실행
   */
  async runPerformanceTest() {
    console.log('🚀 5Pointers 협업 성능 테스트 시작');
    console.log(`📊 설정: ${this.maxClients}명 사용자, ${this.testDuration/1000}초 테스트`);
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    try {
      // 1. 동시 연결 테스트
      await this.testConcurrentConnections();
      
      // 2. 실시간 동기화 테스트
      await this.testRealtimeSync();
      
      // 3. 부하 테스트
      await this.testHighLoad();
      
      // 4. 결과 분석
      this.analyzeResults();
      
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * 동시 연결 테스트
   */
  async testConcurrentConnections() {
    console.log('\n📡 1. 동시 연결 테스트 시작');
    
    const connectionPromises = [];
    
    for (let i = 0; i < this.maxClients; i++) {
      const promise = this.createTestClient(i);
      connectionPromises.push(promise);
      
      // 연결 간격 조절 (서버 부하 방지)
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const results = await Promise.allSettled(connectionPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ 연결 성공: ${successful}/${this.maxClients}`);
    console.log(`❌ 연결 실패: ${failed}/${this.maxClients}`);
    
    if (failed > 0) {
      console.log('실패한 연결들:', results.filter(r => r.status === 'rejected').map(r => r.reason));
    }
  }

  /**
   * 테스트 클라이언트 생성
   */
  async createTestClient(clientId) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      try {
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider(this.wsUrl, this.roomName, ydoc, {
          connect: true
        });
        
        const client = {
          id: clientId,
          ydoc,
          provider,
          awareness: provider.awareness,
          connected: false,
          lastSync: null,
          messageCount: 0
        };
        
        // 연결 성공 처리
        provider.on('status', (event) => {
          if (event.status === 'connected') {
            const connectionTime = Date.now() - startTime;
            this.metrics.connectionTimes.push(connectionTime);
            
            client.connected = true;
            client.lastSync = Date.now();
            
            // 사용자 정보 설정
            client.awareness.setLocalStateField('user', {
              id: clientId,
              name: `TestUser${clientId}`,
              color: this.getRandomColor()
            });
            
            console.log(`🔗 클라이언트 ${clientId} 연결 완료 (${connectionTime}ms)`);
            resolve(client);
          }
        });
        
        // 메시지 수신 처리
        provider.on('sync', (isSynced) => {
          if (isSynced) {
            client.lastSync = Date.now();
            client.messageCount++;
            this.metrics.messagesReceived++;
          }
        });
        
        // 오류 처리
        provider.on('connection-error', (error) => {
          this.metrics.errors++;
          console.error(`❌ 클라이언트 ${clientId} 연결 오류:`, error);
          reject(error);
        });
        
        this.clients.push(client);
        
        // 타임아웃 설정
        setTimeout(() => {
          if (!client.connected) {
            reject(new Error(`클라이언트 ${clientId} 연결 타임아웃`));
          }
        }, 10000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 실시간 동기화 테스트
   */
  async testRealtimeSync() {
    console.log('\n⚡ 2. 실시간 동기화 테스트 시작');
    
    const connectedClients = this.clients.filter(c => c.connected);
    if (connectedClients.length === 0) {
      console.log('❌ 연결된 클라이언트가 없습니다.');
      return;
    }
    
    console.log(`📊 ${connectedClients.length}개 클라이언트로 동기화 테스트`);
    
    // 컴포넌트 업데이트 시뮬레이션
    const testComponents = this.generateTestComponents(10);
    
    for (let i = 0; i < 10; i++) {
      const client = connectedClients[i % connectedClients.length];
      const startTime = Date.now();
      
      // Y.js 트랜잭션으로 컴포넌트 업데이트
      client.ydoc.transact(() => {
        const yComponents = client.ydoc.getArray('components');
        yComponents.delete(0, yComponents.length);
        yComponents.insert(0, testComponents);
      });
      
      this.metrics.messagesSent++;
      
      // 동기화 지연시간 측정
      setTimeout(() => {
        const syncLatency = Date.now() - startTime;
        this.metrics.syncLatencies.push(syncLatency);
        console.log(`🔄 동기화 ${i+1}: ${syncLatency}ms`);
      }, 100);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * 고부하 테스트
   */
  async testHighLoad() {
    console.log('\n🔥 3. 고부하 테스트 시작');
    
    const connectedClients = this.clients.filter(c => c.connected);
    const testDuration = 30000; // 30초
    const updateInterval = 100; // 100ms마다 업데이트
    
    console.log(`📈 ${testDuration/1000}초간 ${updateInterval}ms 간격으로 업데이트`);
    
    const startTime = Date.now();
    let updateCount = 0;
    
    const interval = setInterval(() => {
      if (Date.now() - startTime > testDuration) {
        clearInterval(interval);
        console.log(`✅ 고부하 테스트 완료: ${updateCount}회 업데이트`);
        return;
      }
      
      // 랜덤 클라이언트 선택
      const client = connectedClients[Math.floor(Math.random() * connectedClients.length)];
      
      // 컴포넌트 위치 랜덤 변경
      client.ydoc.transact(() => {
        const yComponents = client.ydoc.getArray('components');
        if (yComponents.length > 0) {
          const index = Math.floor(Math.random() * yComponents.length);
          const component = yComponents.get(index);
          if (component) {
            component.x = Math.random() * 1000;
            component.y = Math.random() * 600;
          }
        }
      });
      
      updateCount++;
      this.metrics.messagesSent++;
      
      // 메모리 사용량 기록
      if (updateCount % 50 === 0) {
        const memUsage = process.memoryUsage();
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
          heapTotal: memUsage.heapTotal / 1024 / 1024
        });
      }
      
    }, updateInterval);
  }

  /**
   * 결과 분석 및 리포트 생성
   */
  analyzeResults() {
    console.log('\n📊 === 성능 테스트 결과 분석 ===');
    
    const totalDuration = Date.now() - this.startTime;
    
    // 연결 성능
    const avgConnectionTime = this.average(this.metrics.connectionTimes);
    const maxConnectionTime = Math.max(...this.metrics.connectionTimes);
    const minConnectionTime = Math.min(...this.metrics.connectionTimes);
    
    console.log('\n🔗 연결 성능:');
    console.log(`  평균 연결 시간: ${avgConnectionTime.toFixed(2)}ms`);
    console.log(`  최대 연결 시간: ${maxConnectionTime}ms`);
    console.log(`  최소 연결 시간: ${minConnectionTime}ms`);
    
    // 동기화 성능
    if (this.metrics.syncLatencies.length > 0) {
      const avgSyncLatency = this.average(this.metrics.syncLatencies);
      const maxSyncLatency = Math.max(...this.metrics.syncLatencies);
      const p95SyncLatency = this.percentile(this.metrics.syncLatencies, 95);
      
      console.log('\n⚡ 동기화 성능:');
      console.log(`  평균 동기화 지연: ${avgSyncLatency.toFixed(2)}ms`);
      console.log(`  최대 동기화 지연: ${maxSyncLatency}ms`);
      console.log(`  95% 동기화 지연: ${p95SyncLatency.toFixed(2)}ms`);
    }
    
    // 메시지 처리량
    const messageRate = (this.metrics.messagesSent + this.metrics.messagesReceived) / (totalDuration / 1000);
    
    console.log('\n📡 메시지 처리량:');
    console.log(`  전송된 메시지: ${this.metrics.messagesSent}`);
    console.log(`  수신된 메시지: ${this.metrics.messagesReceived}`);
    console.log(`  초당 메시지 처리: ${messageRate.toFixed(2)} msg/sec`);
    
    // 메모리 사용량
    if (this.metrics.memoryUsage.length > 0) {
      const avgMemory = this.average(this.metrics.memoryUsage.map(m => m.heapUsed));
      const maxMemory = Math.max(...this.metrics.memoryUsage.map(m => m.heapUsed));
      
      console.log('\n💾 메모리 사용량:');
      console.log(`  평균 힙 사용량: ${avgMemory.toFixed(2)} MB`);
      console.log(`  최대 힙 사용량: ${maxMemory.toFixed(2)} MB`);
    }
    
    // 오류율
    const errorRate = (this.metrics.errors / this.maxClients) * 100;
    
    console.log('\n❌ 오류 통계:');
    console.log(`  총 오류 수: ${this.metrics.errors}`);
    console.log(`  오류율: ${errorRate.toFixed(2)}%`);
    
    // 성능 등급 평가
    this.evaluatePerformance(avgSyncLatency, errorRate, messageRate);
    
    // 결과를 파일로 저장
    this.saveResults();
  }

  /**
   * 성능 등급 평가
   */
  evaluatePerformance(avgSyncLatency, errorRate, messageRate) {
    console.log('\n🏆 성능 등급 평가:');
    
    let grade = 'A';
    const issues = [];
    
    // avgSyncLatency가 undefined인 경우 기본값 설정
    const syncLatency = avgSyncLatency || 0;
    
    if (syncLatency > 100) {
      grade = 'B';
      issues.push('동기화 지연시간이 높음 (>100ms)');
    }
    
    if (syncLatency > 500) {
      grade = 'C';
      issues.push('동기화 지연시간이 매우 높음 (>500ms)');
    }
    
    if (errorRate > 5) {
      grade = 'C';
      issues.push('오류율이 높음 (>5%)');
    }
    
    if (messageRate < 10) {
      grade = 'B';
      issues.push('메시지 처리량이 낮음 (<10 msg/sec)');
    }
    
    console.log(`  전체 등급: ${grade}`);
    
    if (issues.length > 0) {
      console.log('  개선 필요 사항:');
      issues.forEach(issue => console.log(`    - ${issue}`));
    } else {
      console.log('  🎉 모든 성능 지표가 우수합니다!');
    }
  }

  /**
   * 결과를 파일로 저장
   */
  saveResults() {
    const results = {
      timestamp: new Date().toISOString(),
      testConfig: {
        maxClients: this.maxClients,
        testDuration: this.testDuration,
        wsUrl: this.wsUrl,
        roomName: this.roomName
      },
      metrics: this.metrics,
      summary: {
        avgConnectionTime: this.average(this.metrics.connectionTimes),
        avgSyncLatency: this.average(this.metrics.syncLatencies),
        messageRate: (this.metrics.messagesSent + this.metrics.messagesReceived) / (this.testDuration / 1000),
        errorRate: (this.metrics.errors / this.maxClients) * 100
      }
    };
    
    const filename = `collaboration-test-${Date.now()}.json`;
    require('fs').writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 결과가 ${filename}에 저장되었습니다.`);
  }

  /**
   * 테스트 컴포넌트 생성
   */
  generateTestComponents(count) {
    const components = [];
    for (let i = 0; i < count; i++) {
      components.push({
        id: `test-component-${i}`,
        type: 'Button',
        x: Math.random() * 1000,
        y: Math.random() * 600,
        width: 100 + Math.random() * 100,
        height: 40 + Math.random() * 20,
        text: `Test Button ${i}`,
        color: this.getRandomColor()
      });
    }
    return components;
  }

  /**
   * 랜덤 색상 생성
   */
  getRandomColor() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 평균 계산
   */
  average(arr) {
    return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  /**
   * 백분위수 계산
   */
  percentile(arr, p) {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * 정리 작업
   */
  async cleanup() {
    console.log('\n🧹 정리 작업 시작...');
    
    for (const client of this.clients) {
      try {
        if (client.provider) {
          client.provider.destroy();
        }
        if (client.ydoc) {
          client.ydoc.destroy();
        }
      } catch (error) {
        console.error(`클라이언트 ${client.id} 정리 중 오류:`, error);
      }
    }
    
    this.clients = [];
    this.isRunning = false;
    
    console.log('✅ 정리 작업 완료');
  }
}

// 실행 함수
async function runTest() {
  const config = {
    wsUrl: process.env.YJS_WEBSOCKET_URL || 'wss://ws.ddukddak.org:1235',
    roomName: `performance-test-${Date.now()}`,
    maxClients: parseInt(process.env.MAX_CLIENTS) || 20,
    testDuration: parseInt(process.env.TEST_DURATION) || 60000
  };
  
  const tester = new CollaborationPerformanceTest(config);
  await tester.runPerformanceTest();
}

// 스크립트 직접 실행 시
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = CollaborationPerformanceTest;
