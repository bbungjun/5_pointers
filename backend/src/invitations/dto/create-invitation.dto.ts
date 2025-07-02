import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export enum MemberRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN'
}

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole = MemberRole.EDITOR;
} 