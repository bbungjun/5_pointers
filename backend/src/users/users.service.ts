import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, AuthProvider } from './entities/users.entity'
import { Pages } from './entities/pages.entity'
import { Submissions } from './entities/submissions.entity'
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
  ) {}

  async findByEmail(email: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { email }, select: ['id', 'email', 'nickname', 'provider', 'provider_id', 'password'] });
  }

  async findBySocial(provider: AuthProvider, providerId: string): Promise<Users | undefined> {
    return this.usersRepository.findOne({ where: { provider, provider_id: providerId } });
  }

  async createLocalUser(email: string, password: string): Promise<Users> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ email, password: hashed, provider: AuthProvider.LOCAL });
    return this.usersRepository.save(user);
  }

  async createSocialUser(provider: AuthProvider, providerId: string, email?: string): Promise<Users> {
    const user = this.usersRepository.create({ provider, provider_id: providerId, email });
    return this.usersRepository.save(user);
  }

  async createPage(userId: number, subdomain: string, title: string = 'Untitled'): Promise<Pages> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    
    const page = this.pagesRepository.create({
      owner: user,
      userId: userId,
      subdomain,
      title,
      status: 'DRAFT'
    });
    return this.pagesRepository.save(page);
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
}