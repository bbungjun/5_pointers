import { IsIn, IsString } from 'class-validator';

export class SocialLoginDto {
  @IsIn(['google'])
  provider: 'google';

  @IsString()
  authorizationCode: string;
}
