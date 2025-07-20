/**
 * Y.js WebSocket 서버 성능 모니터링
 */

const os = require('os');
const fs = require('fs');

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.stats = {
      cpu: [],
      memory: [],
      connections: 0,
      messages: 0,
      errors: 0
    };
    this.logFile = `performance-${Date.now()}.log`;
  }

  // 시스템 리소스 모니터링
  collectSystemStats() {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();
    const systemMem = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };

    const stats = {
      timestamp: Date.now(),
      cpu: {
        user: cpuUsage.user / 1000000, // 마이크로초를 초로 변환
        system: cpuUsage.system / 1000000,
        usage: os.loadavg()[0] // 1분 평균 로드
      },
      memory: {
        heapUsed: memUsage.heapUsed / 1024 / 1024, // MB
        heapTotal: memUsage.heapTotal / 1024 / 1024,
        external: memUsage.external / 1024 / 1024,
        systemUsed: systemMem.used / 1024 / 1024,
        systemTotal: systemMem.total / 1024 / 1024,
        systemFree: systemMem.free / 1024 / 1024
      },
      network: {
        connections: this.stats.connections,
        messages: this.stats.messages,
        errors: this.stats.errors
      }
    };

    this.stats.cpu.push(stats.cpu);
    this.stats.memory.push(stats.memory);

    // 최근 100개 데이터만 유지
    if (this.stats.cpu.length > 100) {
      this.stats.cpu.shift();
      this.stats.memory.shift();
    }

    return stats;
  }

  // 로그 파일에 기록
  logStats(stats) {
    const logEntry = `${new Date(stats.timestamp).toISOString()},${stats.cpu.usage.toFixed(2)},${stats.memory.heapUsed.toFixed(2)},${stats.memory.systemUsed.toFixed(2)},${stats.network.connections},${stats.network.messages},${stats.network.errors}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
  }

  // 실시간 모니터링 시작
  startMonitoring(interval = 5000) {
    console.log(`📊 성능 모니터링 시작 (${interval/1000}초 간격)`);
    console.log(`📝 로그 파일: ${this.logFile}`);
    
    // CSV 헤더 작성
    fs.writeFileSync(this.logFile, 'timestamp,cpu_usage,heap_memory_mb,system_memory_mb,connections,messages,errors\n');

    const monitoringInterval = setInterval(() => {
      const stats = this.collectSystemStats();
      this.logStats(stats);
      this.printRealTimeStats(stats);
    }, interval);

    // 종료 시 정리
    process.on('SIGINT', () => {
      clearInterval(monitoringInterval);
      this.generateReport();
      process.exit(0);
    });

    return monitoringInterval;
  }

  // 실시간 통계 출력
  printRealTimeStats(stats) {
    const elapsed = (Date.now() - this.startTime) / 1000;
    
    console.clear();
    console.log(`
🚀 Y.js WebSocket 서버 성능 모니터링
⏱️  실행 시간: ${elapsed.toFixed(0)}초

💻 시스템 리소스:
   🔥 CPU 사용률: ${(stats.cpu.usage * 100).toFixed(1)}%
   🧠 힙 메모리: ${stats.memory.heapUsed.toFixed(1)}MB / ${stats.memory.heapTotal.toFixed(1)}MB
   💾 시스템 메모리: ${stats.memory.systemUsed.toFixed(1)}MB / ${stats.memory.systemTotal.toFixed(1)}MB (${((stats.memory.systemUsed/stats.memory.systemTotal)*100).toFixed(1)}%)

🌐 네트워크 통계:
   🔗 활성 연결: ${stats.network.connections}개
   📨 처리된 메시지: ${stats.network.messages}개
   ❌ 오류: ${stats.network.errors}개
   📊 메시지/초: ${(stats.network.messages / elapsed).toFixed(1)}

📈 성능 상태:
   ${this.getPerformanceStatus(stats)}
    `);
  }

  // 성능 상태 평가
  getPerformanceStatus(stats) {
    const cpuPercent = stats.cpu.usage * 100;
    const memPercent = (stats.memory.systemUsed / stats.memory.systemTotal) * 100;
    const messagesPerSecond = stats.network.messages / ((Date.now() - this.startTime) / 1000);

    let status = [];
    
    if (cpuPercent > 80) status.push('🔴 CPU 과부하');
    else if (cpuPercent > 60) status.push('🟡 CPU 높음');
    else status.push('🟢 CPU 정상');

    if (memPercent > 90) status.push('🔴 메모리 부족');
    else if (memPercent > 70) status.push('🟡 메모리 높음');
    else status.push('🟢 메모리 정상');

    if (messagesPerSecond > 500) status.push('🟢 처리량 우수');
    else if (messagesPerSecond > 200) status.push('🟡 처리량 양호');
    else status.push('🔴 처리량 낮음');

    return status.join(' | ');
  }

  // 최종 리포트 생성
  generateReport() {
    const totalTime = (Date.now() - this.startTime) / 1000;
    
    // 평균 계산
    const avgCpu = this.stats.cpu.reduce((sum, stat) => sum + stat.usage, 0) / this.stats.cpu.length;
    const avgMemory = this.stats.memory.reduce((sum, stat) => sum + stat.heapUsed, 0) / this.stats.memory.length;
    const maxMemory = Math.max(...this.stats.memory.map(stat => stat.heapUsed));
    
    const report = `
🎉 성능 모니터링 완료 리포트

⏱️  총 모니터링 시간: ${totalTime.toFixed(1)}초
📊 데이터 포인트: ${this.stats.cpu.length}개

💻 CPU 성능:
   📈 평균 사용률: ${(avgCpu * 100).toFixed(1)}%
   📊 최대 사용률: ${(Math.max(...this.stats.cpu.map(s => s.usage)) * 100).toFixed(1)}%

🧠 메모리 성능:
   📈 평균 힙 사용량: ${avgMemory.toFixed(1)}MB
   📊 최대 힙 사용량: ${maxMemory.toFixed(1)}MB

🌐 네트워크 성능:
   📨 총 메시지: ${this.stats.messages}개
   📊 평균 처리량: ${(this.stats.messages / totalTime).toFixed(1)} 메시지/초
   ❌ 총 오류: ${this.stats.errors}개

📝 상세 로그: ${this.logFile}
    `;

    console.log(report);
    
    // 리포트를 파일로 저장
    fs.writeFileSync(`report-${Date.now()}.txt`, report);
  }

  // 외부에서 통계 업데이트
  updateStats(type, value) {
    if (this.stats.hasOwnProperty(type)) {
      this.stats[type] = value;
    }
  }
}

module.exports = PerformanceMonitor;

// 스크립트 직접 실행 시
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.startMonitoring(2000); // 2초 간격
}
