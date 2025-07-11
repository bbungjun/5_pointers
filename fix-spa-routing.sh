#!/bin/bash

# SPA 라우팅 문제 해결을 위한 Nginx 설정 수정 스크립트

echo "🔧 SPA 라우팅 문제 해결 중..."

# 프론트엔드 서버에 연결하여 Nginx 설정 수정
FRONTEND_IP="3.35.227.214"

echo "📡 프론트엔드 서버 ($FRONTEND_IP)에 연결 중..."

# Nginx 설정 파일 백업 및 수정
cat << 'EOF' > nginx-spa-config.conf
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # SPA 라우팅 지원
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (필요한 경우)
    location /api/ {
        proxy_pass http://13.124.90.104:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

echo "✅ Nginx 설정 파일 생성 완료"
echo "📋 다음 단계:"
echo "1. 프론트엔드 서버에 SSH 접속"
echo "2. sudo cp nginx-spa-config.conf /etc/nginx/sites-available/default"
echo "3. sudo nginx -t (설정 테스트)"
echo "4. sudo systemctl reload nginx"
echo ""
echo "또는 AWS Systems Manager를 통해 자동 적용:"
echo "aws ssm send-command --instance-ids i-FRONTEND_INSTANCE_ID --document-name 'AWS-RunShellScript' --parameters 'commands=[\"sudo nginx -t && sudo systemctl reload nginx\"]'"
