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
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 40px;
        }
        .component { 
            margin-bottom: 20px; 
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e1e5e9;
        }
        .text-component { background: #f8f9fa; }
        .image-component { text-align: center; }
        .image-component img { max-width: 100%; height: auto; border-radius: 4px; }
        .button-component { text-align: center; }
        .button-component button { 
            padding: 12px 24px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 16px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 2px solid #e1e5e9;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e1e5e9;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${page.title || '5Pointers 페이지'}</h1>
            <p>서브도메인: ${page.subdomain}</p>
        </div>
        
        <div class="content">
            ${this.renderComponents(components)}
        </div>
        
        <div class="footer">
            <p>Powered by 5Pointers | 생성일: ${new Date(page.createdAt).toLocaleDateString('ko-KR')}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private renderComponents(components: any[]): string {
    if (!Array.isArray(components) || components.length === 0) {
      return '<div class="component"><p>아직 콘텐츠가 없습니다.</p></div>';
    }

    return components.map(comp => {
      switch (comp.type) {
        case 'text':
          return `<div class="component text-component">
            <h3>${comp.props?.title || ''}</h3>
            <p>${comp.props?.content || comp.props?.text || ''}</p>
          </div>`;
          
        case 'image':
          return `<div class="component image-component">
            <img src="${comp.props?.src || comp.props?.url || ''}" 
                 alt="${comp.props?.alt || '이미지'}" />
            ${comp.props?.caption ? `<p><em>${comp.props.caption}</em></p>` : ''}
          </div>`;
          
        case 'button':
          return `<div class="component button-component">
            <button onclick="window.open('${comp.props?.link || '#'}', '_blank')">
              ${comp.props?.text || comp.props?.label || '버튼'}
            </button>
          </div>`;
          
        case 'heading':
          const level = comp.props?.level || 2;
          return `<div class="component">
            <h${level}>${comp.props?.text || comp.props?.content || ''}</h${level}>
          </div>`;
          
        default:
          return `<div class="component">
            <p><strong>${comp.type}</strong>: ${JSON.stringify(comp.props || {})}</p>
          </div>`;
      }
    }).join('');
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
