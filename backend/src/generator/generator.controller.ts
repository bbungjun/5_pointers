import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GeneratorService } from './generator.service';
import { DeployDto } from './dto/deploy.dto';

/**
 * 노코드 에디터 배포 관리 API 컸트롤러
 * - 컴포넌트를 HTML로 변환하여 서브도메인에 배포
 * - 배포 이력 조회 기능 제공
 */
@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  /**
   * 노코드 에디터 프로젝트를 서브도메인에 배포
   * POST /generator/deploy
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트 URL
   */
  @Post('deploy')
  async deploy(@Body() deployDto: DeployDto) {
    try {
      const result = await this.generatorService.deploy(deployDto);
      return result;
    } catch (error) {
      console.error('🚨 배포 에러:', error.message);
      // 에러를 HTTP 응답으로 변환
      throw error;
    }
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * GET /generator/deployments/:pageId
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 목록
   */
  @Get('deployments/:pageId')
  async getDeployments(@Param('pageId') pageId: string) {
    return this.generatorService.getDeployments(pageId);
  }

  /**
   * 특정 페이지의 배포된 컴포넌트 데이터 조회 (서브도메인 렌더링용)
   * GET /generator/page/:pageId
   * @param pageId - 조회할 페이지 ID
   * @returns 페이지의 컴포넌트 데이터
   */
  @Get('page/:pageId')
  async getPageData(@Param('pageId') pageId: string) {
    return this.generatorService.getPageData(pageId);
  }

  /**
   * 서브도메인으로 페이지 데이터 조회
   * GET /generator/subdomain/:subdomain
   * @param subdomain - 조회할 서브도메인
   * @returns 페이지 컴포넌트 데이터
   */
  @Get('subdomain/:subdomain')
  async getPageBySubdomain(@Param('subdomain') subdomain: string) {
    return this.generatorService.getPageBySubdomain(subdomain);
  }

  /**
   * 임시 서브도메인 HTML 파일 제공 (AWS 인프라 구축 전까지)
   * GET /generator/deployed-sites/:subdomain
   * @param subdomain - 조회할 서브도메인
   * @param res - Express Response 객체
   * @returns HTML 파일
   */
  @Get('deployed-sites/:subdomain')
  async getDeployedSite(
    @Param('subdomain') subdomain: string,
    @Res() res: Response,
  ) {
    try {
      const pageData =
        await this.generatorService.getPageBySubdomain(subdomain);
      if (!pageData) {
        return res.status(404).send('<h1>페이지를 찾을 수 없습니다</h1>');
      }

      const html = await this.generatorService.generateStaticHTML(
        pageData.components,
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.status(500).send('<h1>서버 오류가 발생했습니다</h1>');
    }
  }

  /**
   * 경로 기반 서브도메인 서버용 API 엔드포인트 (EC2에서 호출)
   * GET /generator/api/site/:subdomain
   * @param subdomain - 조회할 서브도메인
   * @returns JSON 형태의 페이지 데이터
   */
  @Get('api/site/:subdomain')
  async getSiteDataForSubdomainServer(@Param('subdomain') subdomain: string) {
    try {
      const pageData =
        await this.generatorService.getPageBySubdomain(subdomain);
      if (!pageData) {
        throw new NotFoundException(`Site "${subdomain}" not found`);
      }

      const html = await this.generatorService.generateStaticHTML(
        pageData.components,
      );

      return {
        success: true,
        subdomain,
        pageId: pageData.pageId,
        html,
        components: pageData.components,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 서브도메인 HOST 헤더를 통한 사이트 렌더링 (CloudFront용)
   * GET /generator/subdomain-host
   * @param req - Express Request 객체 (HOST 헤더 포함)
   * @param res - Express Response 객체
   * @returns HTML 페이지 또는 에러 페이지
   */
  @Get('subdomain-host')
  async getSubdomainFromHost(@Req() req: Request, @Res() res: Response) {
    try {
      const host = req.get('host') || req.get('x-forwarded-host') || '';

      // 서브도메인 추출 (예: test.ddukddak.org -> test)
      const subdomain = this.extractSubdomain(host);

      if (!subdomain) {
        return res.status(400).send(`
          <h1>잘못된 서브도메인</h1>
          <p>Host: ${host}</p>
          <p>올바른 서브도메인 형식: yoursite.ddukddak.org</p>
        `);
      }


      const pageData =
        await this.generatorService.getPageBySubdomain(subdomain);
      if (!pageData) {
        return res.status(404).send(`
          <h1>사이트를 찾을 수 없습니다</h1>
          <p>서브도메인 "${subdomain}"에 배포된 사이트가 없습니다.</p>
          <p>Host: ${host}</p>
        `);
      }

      const html = await this.generatorService.generateStaticHTML(
        pageData.components,
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      res.status(500).send(`
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

    // CloudFront 또는 로컬 환경 처리
    const parts = host.split('.');

    // ddukddak.org 도메인 체크
    if (
      parts.length >= 3 &&
      parts[parts.length - 2] === 'ddukddak' &&
      parts[parts.length - 1] === 'org'
    ) {
      // test.ddukddak.org -> test
      return parts[0];
    }

    // 로컬 테스트용 (localhost:3000 등)
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return null;
    }

    return null;
  }
}
