import { Controller, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
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

  @Post('social')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    try {
      const result = await this.authService.socialLogin(socialLoginDto);
      return result;
    } catch (error) {
      throw new UnauthorizedException('소셜 로그인에 실패했습니다.');
    }
  }
}
