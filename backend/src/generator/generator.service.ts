import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployDto } from './dto/deploy.dto';
import { Pages, PageStatus } from '../users/entities/pages.entity';

@Injectable()
export class GeneratorService {
  constructor(
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
  ) {}

  /**
   * 노코드 에디터에서 생성한 컴포넌트들을 HTML로 변환하여 서브도메인에 배포
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트의 URL
   */
  async deploy(deployDto: DeployDto): Promise<{ url: string }> {
    const { projectId, userId, components } = deployDto;
    
    // 1. projectId 유효성 확인
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    // 2. 서브도메인 생성 - 사용자가 입력한 도메인을 우선 사용
    const userDomain = deployDto.domain?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const subdomain = userDomain || `${userId}-${projectId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    // 3. pages 테이블에 레코드가 없으면 생성, 있으면 서브도메인과 상태 업데이트
    let page = await this.pagesRepository.findOne({ where: { id: projectId } });
    if (!page) {
      page = this.pagesRepository.create({
        id: projectId,
        subdomain: subdomain,
        title: 'Deployed Page',
        status: PageStatus.DEPLOYED,
        userId: parseInt(userId.replace(/\D/g, '')) || 1
      });
      await this.pagesRepository.save(page);
    } else {
      // 기존 페이지가 있으면 서브도메인 업데이트 및 DEPLOYED 상태로 설정
      page.subdomain = subdomain;
      page.status = PageStatus.DEPLOYED;
      await this.pagesRepository.save(page);
    }
    
    // 4. 최종 배포 URL 생성 (환경별 분기)
    // 임시: AWS 인프라 구축 전까지는 백엔드에서 정적 파일 제공
    const url = process.env.NODE_ENV === 'production' 
      ? `https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/deployed-sites/${subdomain}` 
      : `http://${subdomain}.localhost:3001`;
    
    // 5. 컴포넌트 데이터를 pages 테이블의 content 컬럼에 저장
    page.content = { components };
    await this.pagesRepository.save(page);
    
    return { url };
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 배열
   */
  async getDeployments(pageId: string) {
    // pages 테이블에서 해당 페이지의 배포 정보 조회
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, status: PageStatus.DEPLOYED }
    });
    
    // 배포 기록이 없으면 빈 배열 반환
    if (!page) {
      return { deployments: [] };
    }
    
    // 배포 정보 반환
    return { 
      deployments: [{
        deployedUrl: process.env.NODE_ENV === 'production' 
          ? `https://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/deployed-sites/${page.subdomain}` 
          : `http://${page.subdomain}.localhost:3001`,
        deployedAt: page.updatedAt,
        subdomain: page.subdomain,
        projectId: page.id,
        components: page.content?.components || []
      }] 
    };
  }

  /**
   * 특정 페이지의 배포된 컴포넌트 데이터 조회 (서브도메인 렌더링용)
   * @param pageId - 조회할 페이지 ID
   * @returns 페이지의 컴포넌트 데이터
   */
  async getPageData(pageId: string) {
    // pages 테이블에서 해당 페이지의 배포 정보 조회
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, status: PageStatus.DEPLOYED }
    });
    
    // 배포 기록이 없으면 null 반환
    if (!page) {
      return null;
    }
    
    // 배포된 컴포넌트 데이터 반환
    return { 
      components: page.content?.components || []
    };
  }

  /**
   * 서브도메인으로 페이지 데이터 조회 (pages 테이블 기반)
   * @param subdomain - 조회할 서브도메인
   * @returns 페이지 컴포넌트 데이터
   */
  async getPageBySubdomain(subdomain: string) {
    try {
      // pages 테이블에서 subdomain으로 직접 조회
      const page = await this.pagesRepository.findOne({
        where: { subdomain, status: PageStatus.DEPLOYED }
      });
      
      if (!page) {
        throw new NotFoundException(`Subdomain "${subdomain}" not found`);
      }
      
      // content 컬럼에서 컴포넌트 데이터와 페이지 ID 반환
      return {
        components: page.content?.components || [],
        pageId: page.id
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 컴포넌트 배열을 정적 HTML로 변환
   * @param components - 컴포넌트 배열
   * @returns HTML 문자열
   */
  async generateStaticHTML(components: any[]): Promise<string> {
    const componentHTML = components.map(comp => {
      const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px;`;
      
      switch (comp.type) {
        case 'button':
          return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
        case 'text':
          return `<div style="${style}">${comp.props.text}</div>`;
        case 'link':
          return `<a href="${comp.props.url}" style="${style} text-decoration: underline;">${comp.props.text}</a>`;
        case 'attend':
          return `<button style="${style} background: ${comp.props.bg}; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
        case 'image':
          return `<img src="${comp.props.src}" style="${style} width: ${comp.props.width}px; height: ${comp.props.height}px;" alt="${comp.props.alt || ''}" />`;
        default:
          return `<div style="${style}">${comp.props.text || ''}</div>`;
      }
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>배포된 사이트</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Inter, sans-serif; 
            position: relative; 
            min-height: 100vh; 
            background: #f9fafb;
          }
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
      </html>
    `;
  }
}

  
