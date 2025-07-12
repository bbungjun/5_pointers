import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'fallback-secret-key';
    console.log('[JWT Strategy] JWT_SECRET 확인:', jwtSecret ? '설정됨' : '설정되지 않음');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('[JWT Strategy] Payload 검증:', {
      userId: payload.userId,
      email: payload.email,
      nickname: payload.nickname
    });

    // payload: { userId, email, nickname, role }
    const user = {
      userId: payload.userId,
      id: payload.userId,
      email: payload.email,
      nickname: payload.nickname,
      role: payload.role,
    };

    console.log('[JWT Strategy] 검증된 사용자:', user);
    return user;
  }
}
