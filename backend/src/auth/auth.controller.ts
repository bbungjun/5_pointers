import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { SocialLoginDto } from './dto/social-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/local')
  async signupLocal(
    @Body() dto: { email: string; password: string; nickname: string },
  ) {
    return this.authService.signupLocal(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login/local')
  async loginLocal(@Request() req) {
    // req.user는 LocalStrategy의 validate()에서 반환한 user 객체
    return this.authService.login(req.user);
  }

  @Post('login/social')
  async loginSocial(@Body() dto: SocialLoginDto) {
    console.log('=== 소셜 로그인 요청 시작 ===');
    console.log('요청 데이터:', {
      provider: dto.provider,
      authorizationCode: dto.authorizationCode ? dto.authorizationCode.substring(0, 10) + '...' : '없음'
    });
    
    try {
      const result = await this.authService.loginSocial(dto);
      console.log('=== 소셜 로그인 성공 ===');
      return result;
    } catch (error) {
      console.error('=== 소셜 로그인 실패 ===');
      console.error('에러 타입:', error.constructor.name);
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
      throw error;
    }
  }

  // ... (아래에 로그인 엔드포인트 추가)
}
