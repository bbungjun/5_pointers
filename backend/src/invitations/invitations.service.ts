import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageMembers } from '../users/entities/page_members.entity';
import { Pages } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import * as crypto from 'crypto';
import { InvitationsGateway } from './invitations.gateway';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(PageMembers)
    private pageMembersRepository: Repository<PageMembers>,
    @InjectRepository(Pages)
    private pagesRepository: Repository<Pages>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    private invitationsGateway: InvitationsGateway,
  ) {}

  /**
   * 초대 토큰 생성
   */
  private generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * 초대 이메일 발송 (AWS SES 사용)
   */


  /**
   * 페이지에 사용자 초대
   */
  async createInvitation(
    pageId: string,
    createInvitationDto: CreateInvitationDto,
    inviterId: number,
  ) {
    const { email, role } = createInvitationDto;

    // 페이지 존재 확인
    const page = await this.pagesRepository.findOne({
      where: { id: pageId },
      relations: ['owner'],
    });

    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    // 초대자 정보 확인
    const inviter = await this.usersRepository.findOne({
      where: { id: inviterId },
    });

    if (!inviter) {
      throw new NotFoundException('초대자를 찾을 수 없습니다.');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.pageMembersRepository.findOne({
      where: [
        { page: { id: pageId }, email },
        { page: { id: pageId }, user: { email } },
      ],
      relations: ['user'],
    });

    if (existingMember) {
      throw new ConflictException(
        '이미 페이지 멤버이거나 초대된 사용자입니다.',
      );
    }

    // 초대 토큰 생성
    const invitationToken = this.generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

    // 초대 레코드 생성
    const invitation = this.pageMembersRepository.create({
      page,
      email,
      role,
      status: 'PENDING',
      invitation_token: invitationToken,
      expires_at: expiresAt,
    });

    await this.pageMembersRepository.save(invitation);

    // 실시간 알림 전송 (해당 이메일의 유저가 있으면)
    const invitedUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (invitedUser) {
      this.invitationsGateway.sendInvitationToUser(invitedUser.id, {
        id: invitation.id,
        invitationToken: invitation.invitation_token,
        pageId: page.id,
        pageName: page.title,
        role,
        inviterName: inviter.nickname,
        expiresAt: expiresAt,
        createdAt: invitation.createdAt,
      });
    }

    // 초대 링크 생성 (이메일 발송 없이)
    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${invitationToken}`;

      return {
      message: '초대 링크를 성공적으로 생성했습니다.',
        invitationToken,
        success: true,
      inviteUrl,
      };
  }

  /**
   * 초대 토큰으로 초대 정보 조회
   */
  async getInvitationByToken(invitationToken: string) {
    const invitation = await this.pageMembersRepository.findOne({
      where: { invitation_token: invitationToken },
      relations: ['page', 'page.owner'],
    });

    if (!invitation) {
      throw new NotFoundException('유효하지 않은 초대 링크입니다.');
    }

    // 만료 확인
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      throw new BadRequestException('만료된 초대 링크입니다.');
    }

    // 이미 수락된 초대인지 확인
    if (invitation.status === 'ACCEPTED') {
      throw new BadRequestException('이미 수락된 초대입니다.');
    }

    return {
      pageId: invitation.page.id,
      pageName: invitation.page.title,
      role: invitation.role,
      inviterName: invitation.page.owner.nickname,
      email: invitation.email,
    };
  }

  /**
   * 초대 수락
   */
  async acceptInvitation(invitationToken: string, userId: number) {
    const invitation = await this.pageMembersRepository.findOne({
      where: { invitation_token: invitationToken },
      relations: ['page'],
    });

    if (!invitation) {
      throw new NotFoundException('유효하지 않은 초대 링크입니다.');
    }

    // 만료 확인
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      throw new BadRequestException('만료된 초대 링크입니다.');
    }

    // 이미 수락된 초대인지 확인
    if (invitation.status === 'ACCEPTED') {
      throw new BadRequestException('이미 수락된 초대입니다.');
    }

    // 사용자 정보 확인
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이메일 일치 확인 (보안 강화)
    if (invitation.email && invitation.email !== user.email) {
      throw new BadRequestException(
        '초대된 이메일과 로그인한 이메일이 일치하지 않습니다.',
      );
    }

    // 초대 수락 처리
    invitation.user = user;
    invitation.status = 'ACCEPTED';
    invitation.invitation_token = null; // 보안을 위해 토큰 제거

    await this.pageMembersRepository.save(invitation);

    return {
      message: '초대를 성공적으로 수락했습니다.',
      pageId: invitation.page.id,
      pageName: invitation.page.title,
    };
  }

  /**
   * 사용자의 초대 목록 조회
   */
  async getMyInvitations(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자 이메일로 보낸 초대 목록 조회
    const invitations = await this.pageMembersRepository.find({
      where: {
        email: user.email,
        status: 'PENDING',
      },
      relations: ['page', 'page.owner'],
      order: {
        createdAt: 'DESC',
      },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      invitationToken: invitation.invitation_token,
      pageId: invitation.page.id,
      pageName: invitation.page.title,
      role: invitation.role,
      inviterName: invitation.page.owner.nickname,
      expiresAt: invitation.expires_at,
      createdAt: invitation.createdAt,
    }));
  }

  /**
   * 초대 거절
   */
  async declineInvitation(invitationToken: string, userId: number) {
    const invitation = await this.pageMembersRepository.findOne({
      where: { invitation_token: invitationToken },
      relations: ['page'],
    });

    if (!invitation) {
      throw new NotFoundException('유효하지 않은 초대 링크입니다.');
    }

    // 만료 확인
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      throw new BadRequestException('만료된 초대 링크입니다.');
    }

    // 이미 처리된 초대인지 확인
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('이미 처리된 초대입니다.');
    }

    // 사용자 정보 확인
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이메일 일치 확인
    if (invitation.email && invitation.email !== user.email) {
      throw new BadRequestException(
        '초대된 이메일과 로그인한 이메일이 일치하지 않습니다.',
      );
    }

    // 초대 거절 처리 (레코드 삭제)
    await this.pageMembersRepository.remove(invitation);

    return {
      message: '초대를 성공적으로 거절했습니다.',
      pageId: invitation.page.id,
      pageName: invitation.page.title,
    };
  }
}
