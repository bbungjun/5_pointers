import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, AuthProvider } from './entities/users.entity';
import { Pages, PageStatus } from './entities/pages.entity';
import { Submissions } from './entities/submissions.entity';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

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
    return this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'nickname',
        'provider',
        'provider_id',
        'password',
        'role',
      ],
    });
  }

  async findBySocial(
    provider: AuthProvider,
    providerId: string,
  ): Promise<Users | undefined> {
    return this.usersRepository.findOne({
      where: { provider, provider_id: providerId },
    });
  }

  async createLocalUser(email: string, password: string): Promise<Users> {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      password: hashed,
      provider: AuthProvider.LOCAL,
      role: 'USER',
    });
    return this.usersRepository.save(user);
  }

  async createSocialUser(
    provider: AuthProvider,
    providerId: string,
    email?: string,
  ): Promise<Users> {
    const user = this.usersRepository.create({
      provider,
      provider_id: providerId,
      email,
      role: 'USER',
    });
    return this.usersRepository.save(user);
  }

  // 내 페이지 목록 조회
  async getMyPages(userId: number): Promise<Pages[]> {
    // 소유한 페이지들 가져오기
    const ownedPages = await this.pagesRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
      order: { updatedAt: 'DESC' },
    });

    // 초대받은 페이지들 가져오기
    const pageMembersRepository =
      this.pagesRepository.manager.getRepository('PageMembers');
    const memberPages = await pageMembersRepository.find({
      where: {
        user: { id: userId },
        status: 'ACCEPTED',
      },
      relations: ['page'],
      order: { createdAt: 'DESC' },
    });

    // 초대받은 페이지들의 정보 가져오기
    const invitedPages = await Promise.all(
      memberPages.map(async (member) => {
        const page = await this.pagesRepository.findOne({
          where: { id: member.page.id },
        });
        return page;
      }),
    );

    // 소유한 페이지와 초대받은 페이지 합치기
    const allPages = [...ownedPages, ...invitedPages];

    // 배포된 페이지는 deployedAt 기준, 그 외는 updatedAt 기준으로 정렬
    const sortedPages = allPages.sort((a, b) => {
      const aTime =
        a.status === 'DEPLOYED' && a.deployedAt
          ? new Date(a.deployedAt).getTime()
          : new Date(a.updatedAt).getTime();
      const bTime =
        b.status === 'DEPLOYED' && b.deployedAt
          ? new Date(b.deployedAt).getTime()
          : new Date(b.updatedAt).getTime();
      return bTime - aTime;
    });

    console.log('📋 getMyPages 결과:', {
      totalPages: sortedPages.length,
      deployedPages: sortedPages.filter((p) => p.status === 'DEPLOYED').length,
      draftPages: sortedPages.filter((p) => p.status === 'DRAFT').length,
      pages: sortedPages.map((p) => ({
        id: p.id,
        status: p.status,
        title: p.title,
      })),
    });

    return sortedPages;
  }

  // 네비게이션용 내 페이지 목록 조회 (기존 getMyPages와 동일)
  async getMyPagesForNavigation(
    userId: number,
    currentPageId?: string,
  ): Promise<Pages[]> {
    // 기존 getMyPages 메서드와 동일하게 배열 반환
    return this.getMyPages(userId);
  }

  // 사용자 통계 조회
  async getUserStats(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const totalPages = await this.pagesRepository.count({
      where: { owner: { id: userId } }
    });

    const deployedPages = await this.pagesRepository.count({
      where: { 
        owner: { id: userId },
        status: PageStatus.DEPLOYED 
      }
    });

    return {
      totalPages,
      deployedPages,
      maxPages: user.role === 'ADMIN' ? -1 : 10, // -1은 무제한
      maxDeployments: user.role === 'ADMIN' ? -1 : 5,
      isAdmin: user.role === 'ADMIN'
    };
  }

  // 페이지 단일 조회
  async getPage(userId: number, pageId: string): Promise<Pages> {
    // 먼저 페이지 소유자인지 확인
    let page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } },
    });

    // 페이지 소유자가 아니면 멤버 권한 확인
    if (!page) {
      console.log(`페이지 소유자가 아님, 멤버 권한 확인 중...`);

      // PageMembers 테이블에서 권한 확인
      const pageMembersRepository =
        this.pagesRepository.manager.getRepository('PageMembers');
      const member = await pageMembersRepository.findOne({
        where: {
          page: { id: pageId },
          user: { id: userId },
          status: 'ACCEPTED',
        },
      });

      if (!member) {
        throw new Error('Page not found');
      }

      // 멤버인 경우 페이지 정보 가져오기
      page = await this.pagesRepository.findOne({
        where: { id: pageId },
      });

      if (!page) {
        throw new Error('Page not found');
      }
    }

    return page;
  }

  // 페이지 멤버 목록 조회
  async getPageMembers(pageId: string, userId: number): Promise<any[]> {
    try {
      // 먼저 페이지 정보와 소유자 정보 가져오기
      let page = await this.pagesRepository.findOne({
        where: { id: pageId },
        relations: ['owner'],
      });

      if (!page) {
        console.log(`Page not found: ${pageId}`);
        return []; // 빈 배열 반환으로 변경
      }

      // 페이지 소유자인지 확인
      const isOwner = page.owner.id === userId;

      // 페이지 소유자가 아니면 멤버 권한 확인
      if (!isOwner) {
        const pageMembersRepository =
          this.pagesRepository.manager.getRepository('PageMembers');
        const member = await pageMembersRepository.findOne({
          where: {
            page: { id: pageId },
            user: { id: userId },
            status: 'ACCEPTED',
          },
        });

        if (!member) {
          console.log(`User ${userId} has no access to page ${pageId}`);
          return []; // 빈 배열 반환으로 변경
        }
      }

    // 페이지 멤버 목록 가져오기 (초대받은 사람들)
    const pageMembersRepository =
      this.pagesRepository.manager.getRepository('PageMembers');
    const invitedMembers = await pageMembersRepository.find({
      where: { page: { id: pageId } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    // 초대받은 멤버들 매핑
    const invitedMembersList = invitedMembers.map((member) => {
      // 초대 상태에 따라 다른 표시
      let displayName = '알 수 없음';
      let displayEmail = member.email;

      if (member.status === 'ACCEPTED' && member.user) {
        // 초대를 수락한 경우: 사용자 닉네임 표시
        displayName = member.user.nickname;
        displayEmail = member.user.email;
      } else if (member.status === 'PENDING') {
        // 초대 대기 중인 경우: 이메일 주소 표시
        displayName = member.email ? member.email.split('@')[0] : '알 수 없음';
        displayEmail = member.email;
      }

      return {
        id: member.id,
        email: displayEmail,
        userId: member.user?.id,
        nickname: displayName,
        role: member.role,
        status: member.status,
        createdAt: member.createdAt,
        isOwner: false,
      };
    });

    // 페이지 소유자 정보 추가
    const ownerMember = {
      id: `owner-${page.owner.id}`,
      email: page.owner.email,
      userId: page.owner.id,
      nickname: page.owner.nickname,
      role: 'OWNER',
      status: 'ACCEPTED',
      createdAt: page.createdAt,
      isOwner: true,
    };

      // 현재 사용자를 제외한 멤버 목록 반환
      const allMembers = [ownerMember, ...invitedMembersList];
      return allMembers.filter((member) => member.userId !== userId);
    } catch (error) {
      console.error('Error in getPageMembers:', error);
      return []; // 에러 발생 시 빈 배열 반환
    }
  }

  // 페이지 제목 수정
  async updatePageTitle(
    userId: number,
    pageId: string,
    title: string,
  ): Promise<Pages | null> {
    try {
      const page = await this.pagesRepository.findOne({
        where: { id: pageId, owner: { id: userId } },
      });

      if (!page) {
        console.log(`Page not found for title update: ${pageId}, userId: ${userId}`);
        return null;
      }

      page.title = title;
      return this.pagesRepository.save(page);
    } catch (error) {
      console.error('Error in updatePageTitle:', error);
      return null;
    }
  }

  // 페이지 컨텐츠 업데이트 (자동저장용)
  async updatePageContent(
    userId: number,
    pageId: string,
    content: any,
  ): Promise<Pages> {
    // 먼저 페이지 소유자인지 확인
    let page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } },
    });

    // 페이지 소유자가 아니면 멤버 권한 확인
    if (!page) {
      console.log(`페이지 소유자가 아님, 멤버 권한 확인 중...`);

      // PageMembers 테이블에서 권한 확인
      const pageMembersRepository =
        this.pagesRepository.manager.getRepository('PageMembers');
      const member = await pageMembersRepository.findOne({
        where: {
          page: { id: pageId },
          user: { id: userId },
          status: 'ACCEPTED',
        },
      });

      if (!member) {
        throw new Error('Page not found');
      }

      // 멤버인 경우 페이지 정보 가져오기
      page = await this.pagesRepository.findOne({
        where: { id: pageId },
      });

      if (!page) {
        throw new Error('Page not found');
      }
    }

    // content가 객체인 경우 그대로 저장, 아닌 경우 components 배열로 저장
    if (typeof content === 'object' && !Array.isArray(content)) {
      page.content = content;
    } else {
      page.content = {
        components: Array.isArray(content) ? content : [],
        canvasSettings: {
          canvasHeight: 1080, // 기본값
        },
      };
    }

    const savedPage = await this.pagesRepository.save(page);
    return savedPage;
  }

  // 페이지 삭제
  async deletePage(
    userId: number,
    pageId: string,
  ): Promise<{ message: string }> {
    // 먼저 페이지 소유자인지 확인
    let page = await this.pagesRepository.findOne({
      where: { id: pageId, owner: { id: userId } },
    });

    // 페이지 소유자가 아니면 멤버 권한 확인
    if (!page) {
      console.log(`페이지 소유자가 아님, 멤버 권한 확인 중...`);

      // PageMembers 테이블에서 권한 확인
      const pageMembersRepository =
        this.pagesRepository.manager.getRepository('PageMembers');
      const member = await pageMembersRepository.findOne({
        where: {
          page: { id: pageId },
          user: { id: userId },
          status: 'ACCEPTED',
        },
      });

      if (!member) {
        throw new Error('Page not found or access denied');
      }

      // 멤버인 경우 페이지 정보 가져오기
      page = await this.pagesRepository.findOne({
        where: { id: pageId },
      });

      if (!page) {
        throw new Error('Page not found');
      }
    }

    console.log('🗑️ 페이지 삭제:', { pageId, userId, pageTitle: page.title });

    await this.pagesRepository.remove(page);
    return { message: 'Page deleted successfully' };
  }

  // 페이지 생성 리팩토링
  async createPage(
    userId: number,
    body: { subdomain?: string; title?: string; templateId?: string },
  ): Promise<Pages> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 관리자가 아닌 경우 페이지 생성 제한 확인 (10개)
    if (user.role !== 'ADMIN') {
      const userPageCount = await this.pagesRepository.count({
        where: { owner: { id: userId } }
      });
      
      if (userPageCount >= 10) {
        throw new Error('페이지는 최대 10개까지만 생성할 수 있습니다.');
      }
    }

    let content = null;

    // templateId가 있으면 템플릿에서 content 가져오기
    if (body.templateId) {
      const templatesRepository =
        this.pagesRepository.manager.getRepository('Templates');
      const template = await templatesRepository.findOne({
        where: { id: body.templateId },
      });
      if (template && template.content) {
        // 컴포넌트 ID 재발급 및 구조 통일
        let componentsArr = Array.isArray(template.content)
          ? template.content
          : template.content.components || [];
        const canvasSettings =
          typeof template.content === 'object' &&
          !Array.isArray(template.content)
            ? template.content.canvasSettings || { canvasHeight: 1080 }
            : { canvasHeight: 1080 };

        content = {
          components: this.regenerateComponentIds(componentsArr),
          canvasSettings,
        };
      }
    }

    const page = this.pagesRepository.create({
      owner: user,
      subdomain: body.subdomain || `page-${Date.now()}`,
      title: body.title || 'Untitled',
      content: content,
      status: PageStatus.DRAFT,
    });

    return this.pagesRepository.save(page);
  }

  // 컴포넌트 ID 재발급 함수
  private regenerateComponentIds(components: any[]): any[] {
    return components.map((comp) => ({
      ...comp,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 8)}`,
    }));
  }

  async deployPage(
    userId: number,
    pageId: string,
    components: any[],
    domain: string,
  ): Promise<any> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId },
      relations: ['owner'],
    });
    if (!page) throw new Error('Page not found');

    // 관리자가 아닌 경우 배포 제한 확인 (5개)
    if (page.owner.role !== 'ADMIN') {
      const deployedPageCount = await this.pagesRepository.count({
        where: { 
          owner: { id: userId },
          status: PageStatus.DEPLOYED 
        }
      });
      
      if (deployedPageCount >= 5) {
        throw new Error('배포는 최대 5개까지만 할 수 있습니다. 관리자는 무제한 배포 가능합니다.');
      }
    }

    // 서브도메인 중복 검사
    const existingPage = await this.pagesRepository.findOne({
      where: { subdomain: domain },
      relations: ['owner'],
    });

    if (existingPage && existingPage.owner.id !== userId) {
      throw new Error('이미 존재하는 서브도메인입니다');
    }

    // HTML 생성
    const html = this.generateHTML(components);

    // 파일 시스템에 HTML 저장
    const deployDir = path.join(process.cwd(), 'deployed-sites', domain);

    if (!fs.existsSync(deployDir)) {
      fs.mkdirSync(deployDir, { recursive: true });
    }

    fs.writeFileSync(path.join(deployDir, 'index.html'), html);

    // 페이지 테이블에 서브도메인과 배포 상태 업데이트
    page.subdomain = domain;
    page.status = PageStatus.DEPLOYED;
    page.deployedAt = new Date();
    await this.pagesRepository.save(page);

    // submissions 테이블에 배포 데이터 저장
    const submissionsRepository =
      this.pagesRepository.manager.getRepository('Submissions');
    const submission = submissionsRepository.create({
      page: page,
      component_id: 'deploy_' + Date.now(),
      data: { html, components, deployedAt: new Date(), domain },
    });

    return submissionsRepository.save(submission);
  }

  async getDeployedSite(identifier: string): Promise<any> {
    const submissionsRepository =
      this.pagesRepository.manager.getRepository('Submissions');

    // 먼저 도메인으로 검색
    let submission = await submissionsRepository.findOne({
      where: { data: { domain: identifier } },
      order: { createdAt: 'DESC' },
    });

    // 도메인으로 찾지 못하면 pageId로 검색
    if (!submission) {
      submission = await submissionsRepository.findOne({
        where: { page: { id: identifier } },
        order: { createdAt: 'DESC' },
      });
    }

    if (!submission) {
      throw new Error('Deployed site not found');
    }

    return {
      pageId: submission.page.id,
      components: submission.data.components || [],
      deployedAt: submission.data.deployedAt,
      domain: submission.data.domain,
    };
  }

  generateHTML(components: any[]): string {
    const componentHTML = components
      .map((comp) => {
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
          case 'slido':
            return this.generateSlidoHTML(comp);
          default:
            return `<div style="${style}">${comp.props.text}</div>`;
        }
      })
      .join('');

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
        page: { id: pageId },
        component_id: componentId,
      },
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => ({
      id: comment.id,
      author: comment.data.author,
      content: comment.data.content,
      createdAt: comment.createdAt,
    }));
  }

  // 댓글 작성
  async createComment(
    pageId: string,
    componentId: string,
    commentData: { author: string; content: string; password: string },
  ): Promise<any> {
    const hashedPassword = await bcrypt.hash(commentData.password, 10);

    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      component_id: componentId,
      data: {
        author: commentData.author,
        content: commentData.content,
        password: hashedPassword,
      },
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      author: saved.data.author,
      content: saved.data.content,
      createdAt: saved.createdAt,
    };
  }

  // 댓글 삭제
  async deleteComment(
    pageId: string,
    componentId: string,
    commentId: string,
    password: string,
  ): Promise<any> {
    const comment = await this.submissionsRepository.findOne({
      where: {
        id: parseInt(commentId),
        page: { id: pageId },
        component_id: componentId,
      },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      comment.data.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    await this.submissionsRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  // Slido 의견 조회
  async getSlido(pageId: string, componentId: string): Promise<any[]> {
    const opinions = await this.submissionsRepository.find({
      where: {
        page: { id: pageId },
        component_id: componentId,
      },
      order: { createdAt: 'DESC' },
    });

    return opinions.map((opinion) => ({
      id: opinion.id,
      content: opinion.data.content,
      createdAt: opinion.createdAt,
    }));
  }

  // Slido 의견 작성
  async createSlido(
    pageId: string,
    componentId: string,
    slidoData: { content: string },
  ): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      component_id: componentId,
      data: {
        content: slidoData.content,
      },
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      content: saved.data.content,
      createdAt: saved.createdAt,
    };
  }

  // 페이지 콘텐츠 조회 (roomId 기반)
  async getPageContentByRoom(roomId: string): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: roomId } });
    if (!page) {
      throw new Error('Page not found');
    }
    return {
      content: page.content || [],
      editingMode: page.editingMode || 'desktop',
      title: page.title,
    };
  }

  // 페이지 콘텐츠 저장 (Y.js 백업용)
  async savePageContentByRoom(roomId: string, content: any): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: roomId } });
    if (!page) {
      throw new Error('Page not found');
    }

    page.content = content;
    await this.pagesRepository.save(page);

    return { message: 'Content saved successfully', content };
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
                res.json().then(data => {
                  // 더 나은 사용자 경험을 위한 인라인 에러 표시
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = data.message || '비밀번호가 일치하지 않습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  // 3초 후 에러 메시지 제거
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                }).catch(() => {
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = '비밀번호가 일치하지 않습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                });
              }
            })
            .catch(err => {
              console.error('댓글 삭제 실패:', err);
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              errorDiv.textContent = '댓글 삭제에 실패했습니다.';
              
              document.body.appendChild(errorDiv);
              
              setTimeout(() => {
                if (errorDiv.parentNode) errorDiv.remove();
              }, 3000);
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
              // 더 나은 사용자 경험을 위한 인라인 에러 표시
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = 'color: #dc2626; font-size: 12px; margin-top: 8px; text-align: center;';
              errorDiv.textContent = '모든 필드를 입력해주세요.';
              
              // 기존 에러 메시지 제거
              const existingError = form.querySelector('.error-message');
              if (existingError) existingError.remove();
              
              errorDiv.className = 'error-message';
              form.appendChild(errorDiv);
              
              // 3초 후 에러 메시지 제거
              setTimeout(() => {
                if (errorDiv.parentNode) errorDiv.remove();
              }, 3000);
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
                res.json().then(data => {
                  // 더 나은 사용자 경험을 위한 인라인 에러 표시
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = data.message || '댓글 작성에 실패했습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  // 3초 후 에러 메시지 제거
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                }).catch(() => {
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = '댓글 작성에 실패했습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                });
              }
            })
            .catch(err => {
              console.error('댓글 작성 실패:', err);
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              errorDiv.textContent = '댓글 작성에 실패했습니다.';
              
              document.body.appendChild(errorDiv);
              
              setTimeout(() => {
                if (errorDiv.parentNode) errorDiv.remove();
              }, 3000);
            });
          });
          
          // 초기 로드
          loadComments();
        })();
      </script>
    `;
  }

  /**
   * Page 컴포넌트에서 새 페이지 생성
   */
  async createPageFromComponent(createDto: {
    parentPageId: string;
    componentId: string;
    pageName?: string;
  }) {
    try {
      // 1. 새 페이지 생성
      const newPage = this.pagesRepository.create({
        title: createDto.pageName || '새 페이지',
        subdomain: 'page-' + Date.now(),
        content: {
          components: [],
          pageConnections: [],
          metadata: {
            totalComponents: 0,
            pageComponentCount: 0,
            lastModified: new Date().toISOString(),
            version: '1.0',
          },
        },
        status: PageStatus.DRAFT,
      });

      const savedPage = await this.pagesRepository.save(newPage);

      // 2. 부모 페이지의 연결 정보 업데이트
      await this.addPageConnection(createDto.parentPageId, {
        componentId: createDto.componentId,
        linkedPageId: savedPage.id,
        linkType: 'internal',
      });

      return {
        success: true,
        page: {
          id: savedPage.id,
          title: savedPage.title,
          subdomain: savedPage.subdomain,
          status: savedPage.status,
        },
      };
    } catch (error) {
      throw new Error('페이지 생성 실패: ' + error.message);
    }
  }

  /**
   * 부모 페이지에 연결 정보 추가
   */
  async addPageConnection(pageId: string, connectionData: any) {
    try {
      const page = await this.pagesRepository.findOne({
        where: { id: pageId },
      });
      if (!page) {
        throw new Error('부모 페이지를 찾을 수 없습니다.');
      }

      const content = page.content || {
        components: [],
        pageConnections: [],
        metadata: {},
      };

      // pageConnections 배열에 새 연결 추가
      const newConnection = {
        id: 'conn-' + Date.now(),
        componentId: connectionData.componentId,
        linkedPageId: connectionData.linkedPageId,
        linkType: connectionData.linkType,
        order: content.pageConnections?.length || 0,
        createdAt: new Date().toISOString(),
      };

      content.pageConnections = content.pageConnections || [];
      content.pageConnections.push(newConnection);

      // metadata 업데이트
      content.metadata = {
        ...content.metadata,
        pageComponentCount: content.pageConnections.length,
        lastModified: new Date().toISOString(),
      };

      // 부모 페이지 업데이트
      await this.pagesRepository.update(pageId, { content });
    } catch (error) {
      throw error;
    }
  }

  generateSlidoHTML(comp: any): string {
    const style = `position: absolute; left: ${comp.x}px; top: ${comp.y}px;`;
    const question = comp.props.question || '오늘 어떠셨나요?';
    const placeholder = comp.props.placeholder || '의견을 입력해보세요!';
    const backgroundColor = comp.props.backgroundColor || '#ffffff';

    return `
      <div id="slido-${comp.id}" style="${style} width: 400px; min-height: 300px; padding: 24px; background: ${backgroundColor}; border: 1px solid #e5e7eb; border-radius: 12px; font-family: Inter, sans-serif;">
        <!-- 제목 -->
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1f2937; text-align: center;">
          ${question}
        </div>
        
        <!-- LIVE 표시기 -->
        <div style="position: absolute; top: 12px; right: 12px; display: flex; align-items: center; gap: 6px; font-size: 10px; color: #6c757d;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #28a745; animation: pulse 2s infinite;"></div>
          LIVE
        </div>
        
        <!-- 의견 입력 폼 -->
        <form id="slido-form-${comp.id}" style="margin-bottom: 20px; display: flex; gap: 8px;">
          <input 
            type="text" 
            id="slido-input-${comp.id}"
            placeholder="${placeholder}" 
            required 
            style="flex: 1; padding: 12px 16px; border: 2px solid #e9ecef; border-radius: 25px; font-size: 14px; outline: none; transition: border-color 0.2s;"
            onfocus="this.style.borderColor='#007bff'"
            onblur="this.style.borderColor='#e9ecef'"
          />
          <button 
            type="submit" 
            style="padding: 12px 20px; border-radius: 25px; border: none; background-color: #007bff; color: #ffffff; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; min-width: 60px;"
            onmouseover="this.style.backgroundColor='#0056b3'"
            onmouseout="this.style.backgroundColor='#007bff'"
          >
            제출
          </button>
        </form>
        
        <!-- 의견 목록 -->
        <div id="slido-opinions-${comp.id}" style="max-height: 300px; overflow-y: auto;">
          <div style="text-align: center; color: #6b7280; padding: 40px 20px; font-size: 14px;">
            <div style="font-size: 32px; margin-bottom: 12px;">💭</div>
            <div>첫 번째 의견을 남겨보세요!</div>
          </div>
        </div>
      </div>
      
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .opinion-item {
          padding: 12px 16px;
          margin: 8px 0;
          background-color: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e9ecef;
          font-size: 14px;
          line-height: 1.4;
          color: #495057;
          word-break: break-word;
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
      
      <script>
        (function() {
          const form = document.getElementById('slido-form-${comp.id}');
          const input = document.getElementById('slido-input-${comp.id}');
          const opinionsList = document.getElementById('slido-opinions-${comp.id}');
          let isSubmitting = false;
          
          // 의견 목록 로드
          function loadOpinions() {
            fetch('http://localhost:3000/users/pages/${comp.pageId}/slido/${comp.id}')
              .then(res => res.json())
              .then(opinions => {
                if (opinions.length === 0) {
                  opinionsList.innerHTML = \`
                    <div style="text-align: center; color: #6b7280; padding: 40px 20px; font-size: 14px;">
                      <div style="font-size: 32px; margin-bottom: 12px;">💭</div>
                      <div>첫 번째 의견을 남겨보세요!</div>
                    </div>
                  \`;
                } else {
                  opinionsList.innerHTML = opinions.map(opinion => \`
                    <div class="opinion-item">
                      \${opinion.content}
                      <div style="font-size: 11px; color: #9ca3af; margin-top: 6px; text-align: right;">
                        \${new Date(opinion.createdAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  \`).join('');
                }
              })
              .catch(err => console.error('의견 로드 실패:', err));
          }
          
          // 의견 제출
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isSubmitting || !input.value.trim()) return;
            
            isSubmitting = true;
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.textContent = '...';
            submitButton.disabled = true;
            
            fetch('http://localhost:3000/users/pages/${comp.pageId}/slido/${comp.id}', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: input.value.trim() })
            })
            .then(res => {
              if (res.ok) {
                input.value = '';
                loadOpinions();
              } else {
                res.json().then(data => {
                  // 더 나은 사용자 경험을 위한 인라인 에러 표시
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = data.message || '의견 제출에 실패했습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  // 3초 후 에러 메시지 제거
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                }).catch(() => {
                  const errorDiv = document.createElement('div');
                  errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                  errorDiv.textContent = '의견 제출에 실패했습니다.';
                  
                  document.body.appendChild(errorDiv);
                  
                  setTimeout(() => {
                    if (errorDiv.parentNode) errorDiv.remove();
                  }, 3000);
                });
              }
            })
            .catch(err => {
              console.error('의견 제출 실패:', err);
              const errorDiv = document.createElement('div');
              errorDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #dc2626; color: white; padding: 12px 16px; border-radius: 8px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
              errorDiv.textContent = '의견 제출에 실패했습니다.';
              
              document.body.appendChild(errorDiv);
              
              setTimeout(() => {
                if (errorDiv.parentNode) errorDiv.remove();
              }, 3000);
            })
            .finally(() => {
              isSubmitting = false;
              submitButton.textContent = '제출';
              submitButton.disabled = false;
            });
          });
          
          // 실시간 업데이트 (3초마다)
          setInterval(loadOpinions, 3000);
          
          // 초기 로드
          loadOpinions();
        })();
      </script>
    `;
  }

  // 디자인 모드 업데이트
  async updateDesignMode(
    pageId: string,
    designMode: 'desktop' | 'mobile',
  ): Promise<any> {
    const page = await this.pagesRepository.findOne({
      where: { id: pageId },
    });

    if (!page) {
      throw new Error('Page not found');
    }

    // 페이지의 designMode 속성 업데이트 (content에 저장되어 있을 수 있음)
    if (!page.content) {
      page.content = {};
    }

    // content 객체에 designMode 저장
    page.content = {
      ...page.content,
      designMode: designMode,
    };

    const updatedPage = await this.pagesRepository.save(page);

    return {
      message: 'Design mode updated successfully',
      pageId: pageId,
      designMode: designMode,
    };
  }

  // 페이지 전체 submissions 조회 (Dashboard용)
  async getPageSubmissions(
    pageId: string,
    componentType?: string,
    limit?: number,
    offset?: number,
  ): Promise<any> {
    const queryBuilder = this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.page', 'page')
      .where('page.id = :pageId OR submission.component_id = :pageId', {
        pageId,
      })
      .orderBy('submission.createdAt', 'DESC');

    // 컴포넌트 타입별 필터링
    if (componentType) {
      switch (componentType) {
        case 'comment':
          queryBuilder.andWhere('submission.component_id LIKE :pattern', {
            pattern: 'comment_%',
          });
          break;
        case 'slido':
          queryBuilder.andWhere('submission.component_id LIKE :pattern', {
            pattern: 'slido_%',
          });
          break;
        case 'attendance':
          queryBuilder.andWhere('submission.component_id LIKE :pattern', {
            pattern: 'attend_%',
          });
          break;
      }
    }

    if (limit) {
      queryBuilder.limit(limit);
    }
    if (offset) {
      queryBuilder.offset(offset);
    }

    const submissions = await queryBuilder.getMany();

    // 총 개수 조회
    const totalCount = await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.page', 'page')
      .where('page.id = :pageId OR submission.component_id = :pageId', {
        pageId,
      })
      .getCount();

    // 타입별 통계 조회
    const typeStats = await this.submissionsRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.page', 'page')
      .select('submission.component_id', 'componentId')
      .addSelect('COUNT(*)', 'count')
      .where('page.id = :pageId OR submission.component_id = :pageId', {
        pageId,
      })
      .groupBy('submission.component_id')
      .getRawMany();

    const stats = {
      attendance: 0,
      comment: 0,
      slido: 0,
      other: 0,
    };

    typeStats.forEach((stat) => {
      const componentId = stat.componentId;
      const count = parseInt(stat.count);
      if (componentId.startsWith('attend_')) {
        stats.attendance += count;
      } else if (componentId.startsWith('comment_')) {
        stats.comment += count;
      } else if (componentId.startsWith('slido_')) {
        stats.slido += count;
      } else {
        stats.other += count;
      }
    });

    return {
      submissions: submissions.map((submission) => ({
        id: submission.id,
        componentId: submission.component_id,
        type: this.getSubmissionType(submission.component_id),
        data: submission.data,
        createdAt: submission.createdAt,
      })),
      totalCount,
      typeStats: stats,
    };
  }

  private getSubmissionType(componentId: string): string {
    if (componentId.startsWith('comment_')) return 'comment';
    if (componentId.startsWith('slido_')) return 'slido';
    if (componentId.startsWith('attend_')) return 'attendance';
    if (componentId.startsWith('deploy_')) return 'deploy';
    return 'other';
  }

  // 참석 의사 조회
  async getAttendance(pageId: string, componentId: string): Promise<any[]> {
    const submissions = await this.submissionsRepository.find({
      where: {
        page: { id: pageId },
        component_id: componentId,
      },
      order: { createdAt: 'DESC' },
    });

    return submissions.map((submission) => ({
      id: submission.id,
      attendeeName: submission.data.attendeeName,
      attendeeCount: submission.data.attendeeCount,
      guestSide: submission.data.guestSide,
      contact: submission.data.contact,
      companionCount: submission.data.companionCount,
      mealOption: submission.data.mealOption,
      createdAt: submission.createdAt,
    }));
  }

  // 참석 의사 작성
  async createAttendance(
    pageId: string,
    componentId: string,
    attendanceData: {
      attendeeName: string;
      attendeeCount: number;
      guestSide: string;
      contact: string;
      companionCount: number;
      mealOption: string;
      privacyConsent: boolean;
      motivation?: string;
      experience?: string;
      studentId?: string;
      major?: string;
      email?: string;
      formType?: string;
    },
  ): Promise<any> {
    const page = await this.pagesRepository.findOne({ where: { id: pageId } });
    if (!page) throw new Error('Page not found');

    const submission = this.submissionsRepository.create({
      page: page,
      component_id: componentId,
      data: {
        attendeeName: attendanceData.attendeeName,
        attendeeCount: attendanceData.attendeeCount,
        guestSide: attendanceData.guestSide,
        contact: attendanceData.contact,
        companionCount: attendanceData.companionCount,
        mealOption: attendanceData.mealOption,
        privacyConsent: attendanceData.privacyConsent,
        motivation: attendanceData.motivation,
        experience: attendanceData.experience,
        studentId: attendanceData.studentId,
        major: attendanceData.major,
        email: attendanceData.email,
        formType: attendanceData.formType,
      },
    });

    const saved = await this.submissionsRepository.save(submission);
    return {
      id: saved.id,
      attendeeName: saved.data.attendeeName,
      attendeeCount: saved.data.attendeeCount,
      guestSide: saved.data.guestSide,
      contact: saved.data.contact,
      companionCount: saved.data.companionCount,
      mealOption: saved.data.mealOption,
      privacyConsent: saved.data.privacyConsent,
      motivation: saved.data.motivation,
      experience: saved.data.experience,
      studentId: saved.data.studentId,
      major: saved.data.major,
      email: saved.data.email,
      formType: saved.data.formType,
      createdAt: saved.createdAt,
    };
  }
}
