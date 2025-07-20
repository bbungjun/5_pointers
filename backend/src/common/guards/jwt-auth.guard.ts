// jwt-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    console.log('[JWT Guard] 인증 결과:', {
      error: err?.message,
      user: user ? { id: user.id, email: user.email } : null,
      info: info?.message
    });

    if (err || !user) {
      console.log('[JWT Guard] 인증 실패 - 토큰 재로그인 필요');
      throw new UnauthorizedException('유효하지 않은 토큰입니다. 다시 로그인해주세요.');
    }
    return user;
  }
}
