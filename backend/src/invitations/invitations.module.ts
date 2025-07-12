import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';
import { PageMembers } from '../users/entities/page_members.entity';
import { Pages } from '../users/entities/pages.entity';
import { Users } from '../users/entities/users.entity';
import { InvitationsGateway } from './invitations.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([PageMembers, Pages, Users])],
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsGateway],
  exports: [InvitationsService],
})
export class InvitationsModule {}
