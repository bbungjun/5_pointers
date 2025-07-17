#!/usr/bin/env node

/**
 * WebSocket 연결 테스트 스크립트
 * 로컬과 배포 환경의 WebSocket 서버 연결을 테스트합니다.
 */

const WebSocket = require('ws');

const testUrls = [
  'ws://localhost:1234',
  'wss://localhost:1235',
  'ws://43.203.235.108:1234',
  'wss://43.203.235.108:1235'
];

async function testWebSocketConnection(url) {
  return new Promise((resolve) => {
    console.log(`🔍 테스트 중: ${url}`);
    
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => {
      ws.terminate();
      resolve({ url, status: 'timeout', message: '연결 시간 초과 (5초)' });
    }, 5000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log(`✅ 연결 성공: ${url}`);
      ws.close();
      resolve({ url, status: 'success', message: '연결 성공' });
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`❌ 연결 실패: ${url} - ${error.message}`);
      resolve({ url, status: 'error', message: error.message });
    });
  });
}

async function runTests() {
  console.log('🚀 WebSocket 연결 테스트 시작...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    const result = await testWebSocketConnection(url);
    results.push(result);
    console.log(''); // 빈 줄 추가
  }
  
  console.log('📊 테스트 결과 요약:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.url}: ${result.message}`);
  });
  
  const successCount = results.filter(r => r.status === 'success').length;
  console.log(`\n🎯 성공: ${successCount}/${results.length}`);
  
  if (successCount === 0) {
    console.log('\n💡 모든 연결이 실패했습니다. 다음을 확인하세요:');
    console.log('  1. Y.js 서버가 실행 중인지 확인');
    console.log('  2. 방화벽 설정 확인');
    console.log('  3. SSL 인증서 설정 확인 (HTTPS의 경우)');
  }
}

runTests().catch(console.error);
