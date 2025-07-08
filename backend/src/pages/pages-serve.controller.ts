import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../users/users.service';

@Controller('pages')
export class PagesServeController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':subdomain')
  async servePage(@Param('subdomain') subdomain: string, @Res() res: Response) {
    try {
      // 데이터베이스에서 해당 서브도메인의 페이지 찾기
      const page = await this.usersService.findPageBySubdomain(subdomain);
      
      if (!page) {
        throw new NotFoundException(`페이지를 찾을 수 없습니다: ${subdomain}`);
      }

      // 페이지 콘텐츠를 HTML로 렌더링
      const html = this.generatePageHTML(page);
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('페이지 서빙 오류:', error);
      
      // 오류 페이지 반환
      const errorHtml = this.generateErrorHTML(subdomain, error.message);
      res.status(404).setHeader('Content-Type', 'text/html').send(errorHtml);
    }
  }

  private generatePageHTML(page: any): string {
    const components = JSON.parse(page.content || '[]');
    
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title || '5Pointers 페이지'}</title>
    <style>
        body { 
            margin: 0; 
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* 반응형 레이아웃 시스템 */
        .page-container {
            width: 100%;
            box-sizing: border-box;
            background: #ffffff;
            padding: 24px;
            position: relative;
        }
        
        @media (max-width: 768px) {
            .page-container {
                padding: 16px;
            }
        }
        
        .component {
            max-width: 100%;
            box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
            .component {
                margin-bottom: 16px !important;
            }
        }
        
        /* 컴포넌트 스타일 */
        .text-component { 
            font-size: 16px;
            line-height: 1.5;
        }
        .button-component button { 
            padding: 12px 24px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 16px;
        }
        .image-component img { 
            max-width: 100%; 
            height: auto; 
        }
    </style>
</head>
<body>
    <div class="page-container">
        ${this.renderResponsiveComponents(components)}
    </div>
</body>
</html>`;
  }

  private renderResponsiveComponents(components: any[]): string {
    if (!Array.isArray(components) || components.length === 0) {
      return '<div class="component"><p>아직 콘텐츠가 없습니다.</p></div>';
    }

    // 데스크톱: 절대 위치, 모바일: 세로 정렬
    const desktopLayout = components.map(comp => {
      const content = this.renderSingleComponent(comp);
      return `<div style="position: absolute; left: ${comp.x || 0}px; top: ${comp.y || 0}px; width: ${comp.width || 'auto'}px; height: ${comp.height || 'auto'}px;">
        ${content}
      </div>`;
    }).join('');

    const mobileLayout = this.groupComponentsIntoRows(components).map(row => {
      const rowContent = row.map(comp => {
        const content = this.renderSingleComponent(comp);
        return `<div class="component" style="width: ${comp.width}px; height: ${comp.height || 'auto'}px; margin-bottom: 16px;">
          ${content}
        </div>`;
      }).join('');
      return `<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
        ${rowContent}
      </div>`;
    }).join('');

    return `
      <div class="desktop-layout" style="display: block;">
        ${desktopLayout}
      </div>
      <div class="mobile-layout" style="display: none;">
        ${mobileLayout}
      </div>
      <style>
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: block !important; }
        }
      </style>
    `;
  }

  private renderSingleComponent(comp: any): string {
    switch (comp.type) {
      case 'text':
        return `<div class="text-component">
          ${comp.props?.text || comp.props?.content || ''}
        </div>`;
        
      case 'image':
        return `<div class="image-component">
          <img src="${comp.props?.src || comp.props?.url || ''}" 
               alt="${comp.props?.alt || '이미지'}" />
        </div>`;
        
      case 'button':
        return `<div class="button-component">
          <button onclick="window.open('${comp.props?.link || '#'}', '_blank')">
            ${comp.props?.text || comp.props?.label || '버튼'}
          </button>
        </div>`;
        
      default:
        return `<div><strong>${comp.type}</strong></div>`;
    }
  }

  private groupComponentsIntoRows(components: any[]): any[][] {
    const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
    const rows = [];
    
    for (const component of sortedComponents) {
      const compTop = component.y || 0;
      const compBottom = compTop + (component.height || 50);
      
      let targetRow = null;
      for (const row of rows) {
        const hasOverlap = row.some(existingComp => {
          const existingTop = existingComp.y || 0;
          const existingBottom = existingTop + (existingComp.height || 50);
          return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
        });
        
        if (hasOverlap) {
          targetRow = row;
          break;
        }
      }
      
      if (targetRow) {
        targetRow.push(component);
      } else {
        rows.push([component]);
      }
    }
    
    return rows.map(row => row.sort((a, b) => (a.x || 0) - (b.x || 0)));
  }

  private generateErrorHTML(subdomain: string, errorMessage: string): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>페이지를 찾을 수 없습니다</title>
    <style>
        body { 
            margin: 0; 
            padding: 40px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
            text-align: center;
        }
        .error-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 60px 40px;
        }
        .error-code { 
            font-size: 72px; 
            font-weight: bold; 
            color: #dc3545; 
            margin-bottom: 20px;
        }
        .error-message { 
            font-size: 24px; 
            color: #495057; 
            margin-bottom: 30px;
        }
        .error-details { 
            color: #6c757d; 
            margin-bottom: 40px;
        }
        .back-button {
            display: inline-block;
            padding: 12px 24px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
        }
        .back-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-code">404</div>
        <div class="error-message">페이지를 찾을 수 없습니다</div>
        <div class="error-details">
            <p>요청하신 페이지 "<strong>${subdomain}</strong>"를 찾을 수 없습니다.</p>
            <p>${errorMessage}</p>
        </div>
        <a href="/" class="back-button">홈으로 돌아가기</a>
    </div>
</body>
</html>`;
  }
}
