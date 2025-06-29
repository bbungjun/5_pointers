import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeployDto } from './dto/deploy.dto';
import { Pages } from '../users/entities/pages.entity';
import { Submissions } from '../users/entities/submissions.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GeneratorService {
  private readonly deployPath = path.join(process.cwd(), '..', 'deployed-sites');

  constructor(
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Submissions)
    private submissionsRepository: Repository<Submissions>,
  ) {}

  /**
   * 노코드 에디터에서 생성한 컴포넌트들을 HTML로 변환하여 서브도메인에 배포
   * @param deployDto - 배포 요청 데이터 (projectId, userId, components)
   * @returns 배포된 사이트의 URL
   */
  async deploy(deployDto: DeployDto): Promise<{ url: string }> {
    const { projectId, userId, components } = deployDto;
    
    // 1. 페이지 존재 여부 확인 - pages 테이블에서 projectId로 조회
    const page = await this.pagesRepository.findOne({ where: { id: projectId } });
    if (!page) {
      throw new Error('Page not found');
    }
    
    // 2. 서브도메인 생성 - userId와 pageId를 조합하여 고유한 서브도메인 생성
    // 예: user1-abc123 → user1-abc123.localhost:3001
    const subdomain = `${userId}-${projectId}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const deployDir = path.join(this.deployPath, subdomain);
    
    // 3. 배포용 디렉토리 생성
    // deployed-sites/ 루트 디렉토리가 없으면 생성
    if (!fs.existsSync(this.deployPath)) {
      fs.mkdirSync(this.deployPath, { recursive: true });
    }
    // 서브도메인별 디렉토리 생성 (deployed-sites/user1-abc123/)
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    // 4. 컴포넌트 배열을 HTML로 변환
    const html = this.generateHTML(components, projectId);
    
    // 5. 정적 HTML 파일 생성 - 서브도메인 서버에서 서빙할 파일
    fs.writeFileSync(path.join(deployDir, 'index.html'), html);
    
    // 6. 최종 배포 URL 생성
    const url = `http://${subdomain}.localhost:3001`;
    
    // 7. 배포 정보를 데이터베이스에 저장
    // submissions 테이블의 data 컬럼에 JSON 형태로 저장
    const deploymentData = {
      components,        // 배포된 컴포넌트 데이터
      deployedUrl: url,  // 접근 가능한 URL
      deployedAt: new Date().toISOString(), // 배포 시간
      subdomain          // 생성된 서브도메인
    };
    
    // 8. 기존 배포 기록이 있는지 확인 (component_id='deployment'로 구분)
    let submission = await this.submissionsRepository.findOne({ 
      where: { pageId: projectId, component_id: 'deployment' }
    });
    
    // 9. 배포 정보 저장 또는 업데이트
    if (submission) {
      // 기존 배포가 있으면 업데이트 (재배포)
      submission.data = deploymentData;
      await this.submissionsRepository.save(submission);
    } else {
      // 첫 배포면 새 레코드 생성
      submission = this.submissionsRepository.create({
        pageId: projectId, // 외래키로 pageId 직접 설정
        component_id: 'deployment', // 배포 데이터임을 구분하는 식별자
        data: deploymentData
      });
      await this.submissionsRepository.save(submission);
    }
    
    return { url };
  }

  /**
   * 특정 페이지의 배포 이력 조회
   * @param pageId - 조회할 페이지 ID
   * @returns 배포 정보 배열
   */
  async getDeployments(pageId: string) {
    // submissions 테이블에서 해당 페이지의 배포 정보 조회
    const submission = await this.submissionsRepository.findOne({
      where: { pageId, component_id: 'deployment' }
    });
    
    // 배포 기록이 없으면 빈 배열 반환
    if (!submission) {
      return { deployments: [] };
    }
    
    // 배포 정보 반환 (data 컬럼에 저장된 JSON 데이터)
    return { deployments: [submission.data] };
  }

  /**
   * 컴포넌트 배열을 완전한 HTML 문서로 변환
   * @param components - 노코드 에디터에서 생성된 컴포넌트 배열
   * @param projectId - 페이지 ID (HTML 제목에 사용)
   * @returns 완성된 HTML 문자열
   */
  private generateHTML(components: any[], projectId: string): string {
    // 각 컴포넌트를 HTML 요소로 변환
    const componentHTML = components.map(comp => {
      // 컴포넌트 타입별로 적절한 HTML 태그 생성
      switch (comp.type) {
        case 'text':
          // 텍스트 컴포넌트 → div 태그
          return `<div style="position: absolute; left: ${comp.x}px; top: ${comp.y}px; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px;">${comp.props.text}</div>`;
        case 'button':
          // 버튼 컴포넌트 → button 태그
          return `<button style="position: absolute; left: ${comp.x}px; top: ${comp.y}px; background: ${comp.props.bg}; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px; border: none; padding: 12px; border-radius: 8px; cursor: pointer;">${comp.props.text}</button>`;
        case 'link':
          // 링크 컴포넌트 → a 태그
          return `<a href="${comp.props.href}" style="position: absolute; left: ${comp.x}px; top: ${comp.y}px; color: ${comp.props.color}; font-size: ${comp.props.fontSize}px; text-decoration: none;">${comp.props.text}</a>`;
        default:
          // 알 수 없는 컴포넌트 → 기본 div 태그
          return `<div style="position: absolute; left: ${comp.x}px; top: ${comp.y}px;">${comp.props.text || ''}</div>`;
      }
    }).join(''); // 모든 컴포넌트 HTML을 하나의 문자열로 결합

    // 완전한 HTML 문서 구조 생성
    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployed Site - ${projectId}</title>
    <style>
        /* 기본 스타일 리셋 및 폰트 설정 */
        body { margin: 0; padding: 0; font-family: Inter, sans-serif; }
        * { box-sizing: border-box; }
    </style>
</head>
<body>
    ${componentHTML}
</body>
</html>`;
  }
}