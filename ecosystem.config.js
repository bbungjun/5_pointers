module.exports = {
  apps: [{
    name: 'yjs-websocket-server',
    script: './yjs-server.js',
    instances: 1,
    exec_mode: 'fork',
    
    // 환경 변수
    env: {
      NODE_ENV: 'production',
      HOST: '0.0.0.0',
      PORT: 1234
    },
    
    // 재시작 설정
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 로그 설정
    log_file: './logs/yjs-server.log',
    out_file: './logs/yjs-server-out.log',
    error_file: './logs/yjs-server-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 메모리 관리
    max_memory_restart: '500M',
    
    // 자동 재시작 조건
    restart_delay: 4000,
    
    // 클러스터 설정 (필요시)
    // instances: 'max',
    // exec_mode: 'cluster'
  }]
}
