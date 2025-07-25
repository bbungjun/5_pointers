import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Users, AuthProvider } from '../users/entities/users.entity';
import { Repository } from 'typeorm';
import axios from 'axios';
import { google } from 'googleapis';

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

  async login(user: Users) {
    // console.log('Login - User object:', user);
    // console.log('Login - User ID:', user.id, 'Type:', typeof user.id);

    const payload = {
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
    // console.log('Login - JWT payload:', payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async socialLogin(user: any) {
    const payload = {
      userId: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signupLocal(dto: {
    email: string;
    password: string;
    nickname: string;
  }) {
    // 중복 이메일 체크
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 사용 중인 이메일입니다.');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
      nickname: dto.nickname,
      provider: AuthProvider.LOCAL,
    });
    await this.userRepository.save(user);
    return { message: '회원가입 성공' };
  }

  async loginSocial(dto: {
    provider: 'google';
    authorizationCode: string;
  }) {
    let profile: {
      email: string;
      nickname: string;
      provider_id: string;
      provider: AuthProvider;
    };

    switch (dto.provider) {
      case 'google':
        profile = await this.getGoogleProfile(dto.authorizationCode);
        break;
      default:
        throw new BadRequestException('지원하지 않는 소셜 로그인입니다.');
    }

    const user = await this.findOrCreateUser(profile);
    return this.login(user);
  }

  private async getGoogleProfile(code: string) {
    // 환경에 따른 콜백 URL 설정
    const isProduction = process.env.NODE_ENV === 'production';
    const callbackUrl = isProduction
      ? 'https://ddukddak.org/social-callback?provider=google'
      : 'http://localhost:5173/social-callback?provider=google';



    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl,
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      return {
        email: data.email,
        nickname: data.name || data.email.split('@')[0],
        provider_id: data.id,
        provider: AuthProvider.GOOGLE,
      };
    } catch (error) {
      console.error(
        'Google OAuth 에러:',
        {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            callbackUrl,
            environment: process.env.NODE_ENV
          }
        }
      );
      throw error;
    }
  }



  async findOrCreateUser(profile: {
    email: string;
    nickname: string;
    provider_id: string;
    provider: AuthProvider;
  }) {
    console.log('=== findOrCreateUser 시작 ===');
    console.log('입력 프로필:', profile);
    
    let user = await this.userRepository.findOne({
      where: { provider: profile.provider, provider_id: profile.provider_id },
    });
    
    if (user) {
      console.log('기존 사용자 발견 (provider + provider_id):', { id: user.id, email: user.email });
      return user;
    }

    user = await this.userRepository.findOne({
      where: { email: profile.email },
    });
    
    if (user) {
      console.log('기존 사용자 발견 (email), provider 업데이트:', { id: user.id, email: user.email });
      user.provider = profile.provider;
      user.provider_id = profile.provider_id;
      await this.userRepository.save(user);
      return user;
    }

    console.log('새 사용자 생성:', { email: profile.email, nickname: profile.nickname });
    user = this.userRepository.create({
      email: profile.email,
      nickname: profile.nickname,
      provider: profile.provider,
      provider_id: profile.provider_id,
    });
    await this.userRepository.save(user);
    console.log('새 사용자 생성 완료:', { id: user.id, email: user.email });
    return user;
  }
}
