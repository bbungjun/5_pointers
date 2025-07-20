import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, AuthProvider } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { google } from 'googleapis';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    return user;
  }

  async login(user: any) {
    const payload = { 
      userId: user.id, 
      email: user.email, 
      nickname: user.nickname,
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role
      }
    };
  }

  async socialLogin(socialLoginDto: SocialLoginDto) {
    const { provider, authorizationCode } = socialLoginDto;
    
    if (provider === 'google') {
      return this.googleLogin(authorizationCode);
    } else if (provider === 'kakao') {
      return this.kakaoLogin(authorizationCode);
    } else {
      throw new UnauthorizedException('지원하지 않는 소셜 로그인입니다.');
    }
  }

  private async googleLogin(authorizationCode: string) {
    try {
      const profile = await this.getGoogleProfile(authorizationCode);
      const user = await this.findOrCreateUser(profile, 'google');
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Google 로그인에 실패했습니다.');
    }
  }

  private async kakaoLogin(authorizationCode: string) {
    try {
      const profile = await this.getKakaoProfile(authorizationCode);
      const user = await this.findOrCreateUser(profile, 'kakao');
      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Kakao 로그인에 실패했습니다.');
    }
  }

  private async getGoogleProfile(authorizationCode: string) {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authorizationCode,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Google 토큰 요청 실패');
    }

    const tokenData = await tokenResponse.json();
    const userInfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
    );

    if (!userInfoResponse.ok) {
      throw new Error('Google 사용자 정보 요청 실패');
    }

    return await userInfoResponse.json();
  }

  private async getKakaoProfile(authorizationCode: string) {
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
        code: authorizationCode,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Kakao 토큰 요청 실패');
    }

    const tokenData = await tokenResponse.json();
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Kakao 사용자 정보 요청 실패');
    }

    const userInfo = await userInfoResponse.json();
    return {
      id: userInfo.id.toString(),
      email: userInfo.kakao_account?.email,
      nickname: userInfo.properties?.nickname,
    };
  }

  private async findOrCreateUser(profile: any, provider: string) {
    let user = await this.usersService.findByProviderAndProviderId(provider, profile.id);
    
    if (user) {
      return user;
    }
    
    if (profile.email) {
      user = await this.usersService.findByEmail(profile.email);
      if (user) {
        // 기존 사용자의 provider 정보 업데이트
        user.provider = provider;
        user.providerId = profile.id;
        return await this.usersService.save(user);
      }
    }
    
    // 새 사용자 생성
    user = this.usersService.create({
      email: profile.email,
      nickname: profile.nickname || profile.name,
      provider,
      providerId: profile.id,
    });
    
    return await this.usersService.save(user);
  }
}
