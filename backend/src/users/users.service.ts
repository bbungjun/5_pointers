import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, AuthProvider } from './entities/users.entity'
import { Pages, PageStatus } from './entities/pages.entity'
import { Submissions } from './entities/submissions.entity'
import { PageMembers } from './entities/page_members.entity'
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Submissions)
    private submissionsRepository: Repository<Submissions>,
    @InjectRepository(PageMembers)
    private pageMembersRepository: Repository<PageMembers>,
  ) {}

  async findByEmail(email: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'nickname', 'provider', 'provider_id', 'password', 'role'] });
  }

  async findBySocial(provider: AuthProvider, providerId: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { provider, provider_id: providerId } });
  }

  async createLocalUser(email: string, password: string): Promise<Users> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashed, provider: AuthProvider.LOCAL, role: 'USER' });
    return this.usersRepository.save(user);
  }

  async createSocialUser(provider: AuthProvider, providerId: string, email?: string): Promise<Users> {
    const user = this.usersRepository.create({ provider, provider_id: providerId, email, role: 'USER' });
    return this.usersRepository.save(user);
  }

  // 내 페이지 목록 조회
  async getMyPages(userId: number): Promise<Pages[]> {
    return this.pagesRepository.find({ 
      where: { owner: { id: userId } },
      order: { updatedAt: 'DESC' }
    });
  }

  // 페이지 단일 조회
  async getPage(userId: number, pageId: string): Promise<Pages> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    return page;
  }

  // 페이지 제목 수정
  async updatePageTitle(userId: number, pageId: string, title: string): Promise<Pages> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    page.title = title;
    return this.pagesRepository.save(page);
  }

  // 페이지 삭제
  async deletePage(userId: number, pageId: string): Promise<{ message: string }> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } }
    });
    
    if (!page) {
      throw new Error('Page not found');
    }
    
    await this.pagesRepository.remove(page);
    return { message: 'Page deleted successfully' };
  }

  // 페이지 생성 리팩토링
  async createPage(userId: number, body: { subdomain?: string; title?: string; templateId?: string }): Promise<Pages> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    let content = null;
    
    // templateId가 있으면 템플릿에서 content 가져오기
    if (body.templateId) {
      const templatesRepository = this.pagesRepository.manager.getRepository('Templates');
      const template = await templatesRepository.findOne({ where: { id: body.templateId } });
      if (template && template.content) {
        // 컴포넌트 ID 재발급
        content = this.regenerateComponentIds(template.content);
      }
    }
    
    const page = this.pagesRepository.create({
      owner: user,
      userId: userId,
      subdomain: body.subdomain || `page-${Date.now()}`,
      title: body.title || 'Untitled',
      content: content,
      status: PageStatus.DRAFT
    });
    
    return this.pagesRepository.save(page);
  }

  // 컴포넌트 ID 재발급 함수
  private regenerateComponentIds(components: any[]): any[] {
    return components.map(comp => ({
      ...comp,
      id: Math.random().toString(36).slice(2, 10)
    }));
  }

  async deployPage(pageId: string, components: any[], domain: string): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');
    
    // HTML 생성
    const html = this.generateHTML(components);
    
    // 파일 시스템에 HTML 저장
    const fs = require('fs');
    const path = require('path');
    const deployDir = path.join(process.cwd(), 'deployed-sites', domain);
    
    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(deployDir, 'index.html'), html);
    
    // submissions 테이블에 배포 데이터 저장
    const submissionsRepository = this.pagesRepository.manager.getRepository('Submissions');
    const submission = submissionsRepository.create({
      page: page,
      pageId: pageId,
      component_id: 'deploy_' + Date.now(),
      data: { html, components, deployedAt: new Date(), domain }
    });
    
    return submissionsRepository.save(submission);
  }

  async getDeployedSite(identifier: string): Promise<any> {
    const submissionsRepository = this.pagesRepository.manager.getRepository('Submissions');
    
    // 먼저 도메인으로 검색
    let submission = await submissionsRepository.findOne({ 
      where: { data: { domain: identifier } },
      order: { createdAt: 'DESC' }
    });
    
    // 도메인으로 찾지 못하면 pageId로 검색
    if (!submission) {
      submission = await submissionsRepository.findOne({ 
        where: { pageId: identifier },
        order: { createdAt: 'DESC' }
      });
    }
    
    if (!submission) {
      throw new Error('Deployed site not found');
    }
    
    return {
      pageId: submission.pageId,
      components: submission.data.components || [],
      deployedAt: submission.data.deployedAt,
      domain: submission.data.domain
    };
  }

  generateHTML(components: any[]): string {
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
        case 'comment':
          return this.generateCommentHTML(comp);
        default:
          return `<div style="${style}">${comp.props.text}</div>`;
      }
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Deployed Site</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Inter, sans-serif; position: relative; min-height: 100vh; }
        </style>
      </head>
      <body>
        ${componentHTML}
      </body>
      </html>
    `;
  }

  // 댓글 조회
  async getComments(pageId: string, componentId: string): Promise<any[]> {
    const comments = await this.submissionsRepository.find({
      where: { 
        pageId: pageId,
        component_id: componentId
      },
      order: { createdAt: 'DESC' }
    });

    return comments.map(comment => ({
      id: comment.id,
      author: comment.data.author,
      content: comment.data.content,
      createdAt: comment.createdAt
    }));
  }

  // 댓글 작성
  async createComment(pageId: string, componentId: string, commentData: { author: string; content: string; password: string }): Promise<any> {
    const hashedPassword = await bcrypt.hash(commentData.password, 10);
    
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      pageId: pageId,
      component_id: componentId,
      data: {
        author: commentData.author,
        content: commentData.content,
        password: hashedPassword
      }
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      author: saved.data.author,
      content: saved.data.content,
      createdAt: saved.createdAt
    };
  }

  // 댓글 삭제
  async deleteComment(pageId: string, componentId: string, commentId: string, password: string): Promise<any> {
    const comment = await this.submissionsRepository.findOne({
      where: {
        id: parseInt(commentId),
        pageId: pageId,
        component_id: componentId
      }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const isPasswordValid = await bcrypt.compare(password, comment.data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await this.submissionsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  generateCommentHTML(comp: any): string {
    const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
    const title = comp.props.title || '축하 메세지를 남겨주세요';
    const placeholder = comp.props.placeholder || '댓글을 남겨주세요';
    
    return `
      <div id="comment-${comp.id}" style="${style} width: 400px; padding: 24px; background: ${comp.props.backgroundColor || '#ffffff'}; border: 1px solid #ddd; border-radius: 8px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937;">${title}</h3>
        
        <form id="comment-form-${comp.id}" style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <input type="text" placeholder="이름" required style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
            <input type="password" placeholder="비밀번호" required style="padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
          </div>
          <textarea placeholder="${placeholder}" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: none; box-sizing: border-box;" rows="3"></textarea>
          <button type="submit" style="margin-top: 12px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer;">댓글 작성</button>
        </form>
        
        <div id="comments-list-${comp.id}" style="display: flex; flex-direction: column; gap: 12px;">
          <div style="text-align: center; color: #6b7280; padding: 32px;">첫 번째 댓글을 남겨보세요!</div>
        </div>
      </div>
      
      <script>
        (function() {
          const form = document.getElementById('comment-form-${comp.id}');
          const commentsList = document.getElementById('comments-list-${comp.id}');
          
          // 댓글 로드
          function loadComments() {
            fetch('http://localhost:3000/users/pages/${comp.pageId}/comments/${comp.id}')
              .then(res => res.json())
              .then(comments => {
                if (comments.length === 0) {
                  commentsList.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 32px;">첫 번째 댓글을 남겨보세요!</div>';
                } else {
                  commentsList.innerHTML = comments.map(comment => 
                    \`<div style="position: relative; padding: 16px; background: white; border: 1px solid #e5e7eb; border-radius: 8px;">
                      <button onclick="deleteComment('${comp.id}', '\${comment.id}')" style="position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 16px;">×</button>
                      <div style="padding-right: 32px;">
                        <div style="font-weight: 500; color: #1f2937; margin-bottom: 4px;">\${comment.author}</div>
                        <div style="color: #4b5563; font-size: 14px; line-height: 1.5;">\${comment.content}</div>
                        <div style="color: #9ca3af; font-size: 12px; margin-top: 8px;">\${new Date(comment.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>\`
                  ).join('');
                }
              })
              .catch(err => console.error('댓글 로드 실패:', err));
          }
          
          // 댓글 삭제
          window.deleteComment = function(componentId, commentId) {
            const password = prompt('비밀번호를 입력하세요:');
            if (!password) return;
            
            fetch(\`http://localhost:3000/users/pages/${comp.pageId}/comments/\${componentId}/\${commentId}\`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
            })
            .then(res => {
              if (res.ok) {
                loadComments();
              } else {
                alert('비밀번호가 일치하지 않습니다.');
              }
            })
            .catch(err => {
              console.error('댓글 삭제 실패:', err);
              alert('댓글 삭제에 실패했습니다.');
            });
          };
          
          // 댓글 작성
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputs = form.querySelectorAll('input, textarea');
            const author = inputs[0].value;
            const password = inputs[1].value;
            const content = inputs[2].value;
            
            if (!author || !password || !content) {
              alert('모든 필드를 입력해주세요.');
              return;
            }
            
            fetch('http://localhost:3000/users/pages/${comp.pageId}/comments/${comp.id}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ author, content, password })
            })
            .then(res => {
              if (res.ok) {
                form.reset();
                loadComments();
              } else {
                alert('댓글 작성에 실패했습니다.');
              }
            })
            .catch(err => {
              console.error('댓글 작성 실패:', err);
              alert('댓글 작성에 실패했습니다.');
            });
          });
          
          // 초기 로드
          loadComments();
        })();
      </script>
    `;
  }

  // 🔄 새로고침 복구 시스템 - roomId로 페이지 콘텐츠 조회
  async getPageContentByRoom(roomId: string): Promise<any> {
    const page = await this.pagesRepository.findOne({ 
      where: { subdomain: roomId } 
    });
    
    if (!page) {
      // 페이지가 없으면 기본 구조 반환
      return {
        components: [],
        canvasSettings: {
          width: 1200,
          height: 800,
          backgroundColor: "#ffffff"
        },
        lastModified: new Date(),
        version: 1
      };
    }
    
    return page.content || {
      components: [],
      canvasSettings: {
        width: 1200,
        height: 800,
        backgroundColor: "#ffffff"
      },
      lastModified: page.updatedAt,
      version: 1
    };
  }

  // 🔄 새로고침 복구 시스템 - roomId로 페이지 콘텐츠 저장
  async savePageContentByRoom(roomId: string, content: any): Promise<any> {
    // 먼저 페이지가 존재하는지 확인
    let page = await this.pagesRepository.findOne({ 
      where: { subdomain: roomId } 
    });
    
    if (!page) {
      // 페이지가 없으면 새로 생성 (기본 사용자 ID 1로 임시 설정)
      page = this.pagesRepository.create({
        subdomain: roomId,
        title: `Room ${roomId}`,
        userId: 1, // 임시 사용자 ID
        content: content,
        status: PageStatus.DRAFT
      });
      await this.pagesRepository.save(page);
    } else {
      // 기존 페이지 업데이트
      await this.pagesRepository.update(
        { subdomain: roomId },
        { 
          content: content,
          updatedAt: new Date()
        }
      );
    }
    
    return {
      success: true,
      message: "Content saved successfully",
      lastModified: new Date()
    };
  }
}