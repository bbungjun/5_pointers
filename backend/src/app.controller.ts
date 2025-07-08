import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { GeneratorService } from './generator/generator.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly generatorService: GeneratorService,
  ) {}

  @Get()
  async getRoot(@Req() req: Request, @Res() res: Response) {
    try {
      const host = req.get('host') || req.get('x-forwarded-host') || '';
      console.log('🌐 Root request - Host:', host);

      // 서브도메인 추출
      const subdomain = this.extractSubdomain(host);

      if (subdomain) {
        console.log('🔍 서브도메인 감지:', subdomain);

        // 서브도메인이 있으면 페이지 데이터 조회
        const pageData =
          await this.generatorService.getPageBySubdomain(subdomain);

        if (pageData) {
          console.log('✅ 페이지 데이터 발견:', pageData.pageId);
          const html = await this.generatorService.generateStaticHTML(
            pageData.components,
          );
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(html);
        } else {
          console.log('❌ 페이지 데이터 없음');
          return res.status(404).send(`
            <h1>사이트를 찾을 수 없습니다</h1>
            <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
            <p>Host: ${host}</p>
          `);
        }
      }

      // 서브도메인이 없으면 기본 응답
      console.log('🏠 기본 응답 반환');
      return res.send(this.appService.getHello());
    } catch (error) {
      console.error('루트 요청 처리 오류:', error);
      return res.status(500).send(`
        <h1>서버 오류</h1>
        <p>잠시 후 다시 시도해주세요.</p>
        <p>Error: ${error.message}</p>
      `);
    }
  }

  /**
   * Host 헤더에서 서브도메인 추출
   * @param host - Host 헤더 값
   * @returns 서브도메인 또는 null
   */
  private extractSubdomain(host: string): string | null {
    if (!host) return null;

    // 포트 번호 제거
    const hostnameWithoutPort = host.split(':')[0];
    const parts = hostnameWithoutPort.split('.');

    // pagecube.net 도메인 체크
    if (
      parts.length >= 3 &&
      parts[parts.length - 2] === 'pagecube' &&
      parts[parts.length - 1] === 'net'
    ) {
      // test.pagecube.net -> test
      const subdomain = parts[0];
      // api 서브도메인은 제외 (API 전용)
      if (subdomain === 'api') return null;
      return subdomain;
    }

    // 로컬 테스트용 (localhost:3000 등)
    if (
      hostnameWithoutPort.includes('localhost') ||
      hostnameWithoutPort.includes('127.0.0.1')
    ) {
      return null;
    }

    return null;
  }
}
