import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  // 환경 변수 디버깅
  console.log('[Main] 환경 변수 확인:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST ? '설정됨' : '설정되지 않음',
    JWT_SECRET: process.env.JWT_SECRET ? '설정됨' : '설정되지 않음',
    JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 글로벌 API 접두사 설정 - ddukddak.org 로그인 이슈 해결 (2025-07-07)
  app.setGlobalPrefix('api');

  // CORS 허용 설정 - 서브도메인 지원
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://ddukddak.org',
        'https://www.ddukddak.org',
        // 환경 변수로부터 추가 도메인 허용
        process.env.FRONTEND_URL,
        process.env.ALLOWED_ORIGINS?.split(',') || [],
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001'
      ].flat().filter(Boolean);
      
      const subdomainPatterns = [
        /^https?:\/\/[^.]+\.ddukddak\.org$/,
        /^https?:\/\/[^.]+\.localhost:\d+$/
      ];
      
      console.log('[CORS] 요청 Origin:', origin);
      console.log('[CORS] 허용된 Origins:', allowedOrigins);

      if (!origin) {
        console.log('[CORS] Origin 없음 - 허용');
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        console.log('[CORS] Origin 허용됨:', origin);
        return callback(null, true);
      }
      
      if (subdomainPatterns.some(pattern => pattern.test(origin))) {
        console.log('[CORS] 서브도메인 패턴 매치:', origin);
        return callback(null, true);
      }
      
      console.log('[CORS] Origin 거부됨:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Body parser 설정 - 큰 요청 허용
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 정적 파일 서빙 설정 (수정된 방식)
  const publicPath = join(__dirname, '..', 'public');
  // console.log("Static files path:", publicPath);

  // uploads 폴더를 직접 서빙
  app.useStaticAssets(join(publicPath, 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  console.log(
    'ImageUploadServer-ver.2: Static file serving enabled (v2) - API prefix configured',
  );
}
bootstrap();
