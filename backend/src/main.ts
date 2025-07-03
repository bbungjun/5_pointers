import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS 허용 설정
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 정적 파일 서빙 설정 (수정된 방식)
  const publicPath = join(__dirname, "..", "public");
  // console.log("Static files path:", publicPath);
  
  // uploads 폴더를 직접 서빙
  app.useStaticAssets(join(publicPath, "uploads"), {
    prefix: "/uploads/",
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log("ImageUploadServer-ver.2: Static file serving enabled (v2)");
}
bootstrap();
