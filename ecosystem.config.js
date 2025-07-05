// PM2 설정 파일
module.exports = {
  apps: [
    {
      name: 'backend',
      script: './backend/dist/main.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'editor',
      script: 'npm',
      args: 'start',
      cwd: './apps/editor',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    },
    {
      name: 'subdomain-nextjs',
      script: 'npm',
      args: 'start',
      cwd: './apps/subdomain-nextjs',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
}