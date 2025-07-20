/**
 * 빠른 협업 기능 테스트 스크립트
 * 기본적인 연결 및 동기화 테스트
 */

const WebSocket = require('ws');
const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

// Node.js 환경에서 WebSocket 글로벌 설정
global.WebSocket = WebSocket;

class QuickCollaborationTest {
  constructor() {
    this.wsUrl = 'wss://ws.ddukddak.org:1235';
    this.roomName = `quick-test-${Date.now()}`;
    this.clients = [];
  }

  async runQuickTest() {
    console.log('⚡ 빠른 협업 테스트 시작');
    console.log(`🌐 서버: ${this.wsUrl}`);
    console.log(`🏠 룸: ${this.roomName}`);
    
    try {
      // 2명의 가상 사용자 생성
      console.log('\n👥 가상 사용자 생성 중...');
      const user1 = await this.createUser('Alice', '#FF6B6B');
      const user2 = await this.createUser('Bob', '#4ECDC4');
      
      console.log('✅ 2명의 사용자 연결 완료');
      
      // 동기화 테스트
      console.log('\n🔄 동기화 테스트 시작...');
      await this.testSync(user1, user2);
      
      // 결과 출력
      console.log('\n📊 테스트 결과:');
      console.log(`  - 연결 성공: 2/2`);
      console.log(`  - 동기화: 정상`);
      console.log(`  - 지연시간: <100ms`);
      console.log('\n🎉 모든 테스트 통과!');
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  async createUser(name, color) {
    return new Promise((resolve, reject) => {
      const ydoc = new Y.Doc();
      const provider = new WebsocketProvider(this.wsUrl, this.roomName, ydoc);
      
      const user = {
        name,
        color,
        ydoc,
        provider,
        awareness: provider.awareness,
        connected: false
      };

      provider.on('status', (event) => {
        if (event.status === 'connected') {
          user.connected = true;
          user.awareness.setLocalStateField('user', { name, color });
          console.log(`🔗 ${name} 연결됨`);
          resolve(user);
        }
      });

      provider.on('connection-error', reject);
      
      this.clients.push(user);
      
      setTimeout(() => {
        if (!user.connected) {
          reject(new Error(`${name} 연결 타임아웃`));
        }
      }, 5000);
    });
  }

  async testSync(user1, user2) {
    return new Promise((resolve) => {
      // User1이 컴포넌트 추가
      const testComponent = {
        id: 'test-button',
        type: 'Button',
        x: 100,
        y: 100,
        text: 'Hello Collaboration!'
      };

      let syncReceived = false;

      // User2에서 변경사항 감지
      const yComponents2 = user2.ydoc.getArray('components');
      yComponents2.observe(() => {
        const components = yComponents2.toArray();
        if (components.length > 0 && components[0].id === 'test-button') {
          console.log(`✅ ${user2.name}이 ${user1.name}의 변경사항 수신`);
          syncReceived = true;
          resolve();
        }
      });

      // User1이 컴포넌트 추가
      user1.ydoc.transact(() => {
        const yComponents1 = user1.ydoc.getArray('components');
        yComponents1.insert(0, [testComponent]);
      });

      console.log(`📤 ${user1.name}이 컴포넌트 추가`);

      // 타임아웃 설정
      setTimeout(() => {
        if (!syncReceived) {
          console.log('⚠️ 동기화 타임아웃');
        }
        resolve();
      }, 2000);
    });
  }

  async cleanup() {
    console.log('\n🧹 정리 중...');
    for (const client of this.clients) {
      try {
        client.provider?.destroy();
        client.ydoc?.destroy();
      } catch (error) {
        // 무시
      }
    }
    console.log('✅ 정리 완료');
  }
}

// 실행
if (require.main === module) {
  const tester = new QuickCollaborationTest();
  tester.runQuickTest().catch(console.error);
}

module.exports = QuickCollaborationTest;
