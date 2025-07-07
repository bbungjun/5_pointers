import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /**
   * 페이지에 사용자 초대
   * POST /api/pages/{pageId}/invitations
   */
  @Post('pages/:pageId/invitations')
  @UseGuards(JwtAuthGuard)
  async createInvitation(
    @Param('pageId') pageId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Request() req
  ) {
    const inviterId = req.user.userId;
    return this.invitationsService.createInvitation(pageId, createInvitationDto, inviterId);
  }

  /**
   * 사용자의 초대 목록 조회
   * GET /api/invitations/my-invitations
   */
  @Get('my-invitations')
  @UseGuards(JwtAuthGuard)
  async getMyInvitations(@Request() req) {
    const userId = req.user.userId;
    return this.invitationsService.getMyInvitations(userId);
  }

  /**
   * 초대 토큰으로 초대 정보 조회 (로그인 불필요)
   * GET /api/invitations/{invitationToken}
   */
  @Get(':invitationToken')
  async getInvitationByToken(@Param('invitationToken') invitationToken: string) {
    return this.invitationsService.getInvitationByToken(invitationToken);
  }

  /**
   * 초대 수락 (로그인 필요)
   * POST /api/invitations/{invitationToken}/accept
   */
  @Post(':invitationToken/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(
    @Param('invitationToken') invitationToken: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return this.invitationsService.acceptInvitation(invitationToken, userId);
  }

  /**
   * 초대 거절 (로그인 필요)
   * POST /api/invitations/{invitationToken}/decline
   */
  @Post(':invitationToken/decline')
  @UseGuards(JwtAuthGuard)
  async declineInvitation(
    @Param('invitationToken') invitationToken: string,
    @Request() req
  ) {
    const userId = req.user.userId;
    return this.invitationsService.declineInvitation(invitationToken, userId);
  }
} 