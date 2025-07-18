module.exports = {
  apps: [{
    name: 'subdomain-nextjs',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/subdomain-server',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      API_BASE_URL: 'https://ddukddak.org/api'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    error_file: '/home/ubuntu/.pm2/logs/subdomain-nextjs-error.log',
    out_file: '/home/ubuntu/.pm2/logs/subdomain-nextjs-out.log',
    log_file: '/home/ubuntu/.pm2/logs/subdomain-nextjs.log'
  }]
}
