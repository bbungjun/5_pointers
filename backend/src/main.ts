import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 글로벌 API 접두사 설정 - ddukddak.org 로그인 이슈 해결 (2025-07-07)
  app.setGlobalPrefix('api');

  // CORS 허용 설정 - 서브도메인 지원
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://ddukddak.org',
        'https://www.ddukddak.org',
        'https://pagecube.net',
        'https://www.pagecube.net',
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:3001'
      ];
      
      const subdomainPatterns = [
        /^https?:\/\/[^.]+\.ddukddak\.org$/,
        /^https?:\/\/[^.]+\.pagecube\.net$/,
        /^https?:\/\/[^.]+\.localhost:\d+$/
      ];
      
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      if (subdomainPatterns.some(pattern => pattern.test(origin))) {
        return callback(null, true);
      }
      
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
