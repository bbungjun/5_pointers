import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Templates } from '../users/entities/templates.entity';
import { Pages, PageStatus } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Templates)
    private templatesRepository: Repository<Templates>,
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async findAll(category?: string, editingMode?: string) {
    try {
      const queryBuilder = this.templatesRepository.createQueryBuilder('template')
        .leftJoinAndSelect('template.author', 'author')
        .orderBy('template.createdAt', 'DESC');

      if (category && category !== 'all') {
        queryBuilder.andWhere('template.category = :category', { category });
      }

      if (editingMode) {
        queryBuilder.andWhere('template.editingMode = :editingMode', { editingMode });
      }

      const templates = await queryBuilder.getMany();
      return templates;
    } catch (error) {
      throw new Error('템플릿 조회에 실패했습니다.');
    }
  }

  async createFromComponents(
    authorId: number,
    name: string,
    category: string,
    components: any[],
    editingMode?: string
  ) {
    try {
      const author = await this.usersRepository.findOne({ where: { id: authorId } });
      if (!author) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const template = this.templatesRepository.create({
        name,
        category,
        author,
        components: JSON.stringify(components),
        editingMode: editingMode || 'desktop',
      });

      const savedTemplate = await this.templatesRepository.save(template);
      return savedTemplate;
    } catch (error) {
      throw new Error('템플릿 생성에 실패했습니다.');
    }
  }

  // 템플릿으로 새 페이지 생성
  async createPageFromTemplate(
    templateId: string,
    userId: number,
    title?: string,
    subdomain?: string,
  ) {
    // 템플릿 조회
    const template = await this.templatesRepository.findOne({
      where: { id: templateId, isPublic: true },
    });

    if (!template) {
      throw new NotFoundException('템플릿을 찾을 수 없습니다.');
    }

    // 사용자 조회
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 컴포넌트 ID 재발급 및 캔버스 설정 복원
    let newContent;
    if (typeof template.content === 'object' && !Array.isArray(template.content)) {
      newContent = {
        components: this.regenerateComponentIds(template.content.components || []),
        canvasSettings: template.content.canvasSettings || { canvasHeight: 1080 }
      };
    } else {
      newContent = {
        components: this.regenerateComponentIds(Array.isArray(template.content) ? template.content : []),
        canvasSettings: { canvasHeight: 1080 }
      };
    }

    // 새 페이지 생성 (템플릿의 editingMode를 페이지에 저장)
    const newPage = this.pagesRepository.create({
      title: title || template.name,
      subdomain: subdomain || this.generateRandomSubdomain(),
      content: newContent,
      owner: user,
      status: PageStatus.DRAFT,
      editingMode: template.editingMode, // 템플릿의 편집 기준을 페이지에 저장
    });

    const savedPage = await this.pagesRepository.save(newPage);

    // 템플릿 사용 횟수 증가
    await this.templatesRepository.increment(
      { id: templateId },
      'usageCount',
      1,
    );

    return savedPage;
  }

  // 컴포넌트 ID 재발급
  private regenerateComponentIds(components: any[]): any[] {
    if (!Array.isArray(components)) return [];

    return components.map((comp) => ({
      ...comp,
      id: this.generateRandomId(),
    }));
  }

  // 랜덤 ID 생성
  private generateRandomId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  // 랜덤 서브도메인 생성
  private generateRandomSubdomain(): string {
    return 'tmpl-' + Math.random().toString(36).substring(2, 10);
  }


}
