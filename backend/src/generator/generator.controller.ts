import { Controller, Post, Body, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
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
    console.log('🚀 Deploy request received:', deployDto);
    return this.generatorService.deploy(deployDto);
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
  async getDeployedSite(@Param('subdomain') subdomain: string, @Res() res: Response) {
    try {
      const pageData = await this.generatorService.getPageBySubdomain(subdomain);
      if (!pageData) {
        return res.status(404).send('<h1>페이지를 찾을 수 없습니다</h1>');
      }
      
      const html = await this.generatorService.generateStaticHTML(pageData.components);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      console.error('배포된 사이트 조회 오류:', error);
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
      const pageData = await this.generatorService.getPageBySubdomain(subdomain);
      if (!pageData) {
        throw new NotFoundException(`Site "${subdomain}" not found`);
      }
      
      const html = await this.generatorService.generateStaticHTML(pageData.components);
      
      return {
        success: true,
        subdomain,
        pageId: pageData.pageId,
        html,
        components: pageData.components
      };
    } catch (error) {
      console.error('경로 기반 사이트 API 오류:', error);
      throw error;
    }
  }
}


