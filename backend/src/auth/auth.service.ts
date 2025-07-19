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
    provider: 'google' | 'kakao';
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
      case 'kakao':
        profile = await this.getKakaoProfile(dto.authorizationCode);
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

    console.log('Google OAuth 설정 (백엔드):', {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '***설정됨***' : '❌ 설정되지 않음',
      callbackUrl,
      environment: process.env.NODE_ENV || 'development',
      isProduction,
      authCode: code?.substring(0, 10) + '...', // 보안을 위해 코드 일부만 출력
    });

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

  private async getKakaoProfile(code: string) {
    // 환경에 따른 콜백 URL 설정
    const isProduction = process.env.NODE_ENV === 'production';
    const callbackUrl = isProduction
      ? 'https://ddukddak.org/social-callback?provider=kakao'
      : 'http://localhost:5173/social-callback?provider=kakao';

    console.log('=== 카카오 프로필 요청 시작 ===');
    console.log('getKakaoProfile called!');
    console.log('환경 변수 확인:', {
      client_id: process.env.KAKAO_CLIENT_ID ? '설정됨' : '❌ 설정되지 않음',
      client_secret: process.env.KAKAO_CLIENT_SECRET ? '***설정됨***' : '❌ 설정되지 않음',
      redirect_uri: callbackUrl,
      code: code?.substring(0, 10) + '...',
      environment: process.env.NODE_ENV || 'development',
      isProduction
    });

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID,
      redirect_uri: callbackUrl,
      code,
    });

    if (process.env.KAKAO_CLIENT_SECRET) {
      params.append('client_secret', process.env.KAKAO_CLIENT_SECRET);
    }

    console.log('=== 카카오 토큰 요청 파라미터 ===');
    console.log('요청 URL:', 'https://kauth.kakao.com/oauth/token');
    console.log('요청 파라미터:', {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_CLIENT_ID ? '설정됨' : '❌ 설정되지 않음',
      client_secret: process.env.KAKAO_CLIENT_SECRET ? '설정됨' : '❌ 설정되지 않음',
      redirect_uri: callbackUrl,
      code: code?.substring(0, 10) + '...'
    });

    let tokenRes;
    try {
      tokenRes = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    } catch (error) {
      console.error('=== 카카오 OAuth 토큰 요청 에러 ===');
      console.error('에러 메시지:', error.message);
      console.error('응답 상태:', error.response?.status);
      console.error('응답 데이터:', error.response?.data);
      console.error('요청 설정:', {
        clientId: process.env.KAKAO_CLIENT_ID ? '설정됨' : '❌ 설정되지 않음',
        clientSecret: process.env.KAKAO_CLIENT_SECRET ? '설정됨' : '❌ 설정되지 않음',
        callbackUrl,
        environment: process.env.NODE_ENV || 'development'
      });
      throw error;
    }
    console.log('=== 카카오 토큰 요청 성공 ===');
    console.log('토큰 응답:', {
      hasAccessToken: !!tokenRes.data.access_token,
      tokenType: tokenRes.data.token_type,
      expiresIn: tokenRes.data.expires_in
    });

    const accessToken = (tokenRes.data as { access_token: string })
      .access_token;

    console.log('=== 카카오 프로필 요청 시작 ===');
    const profileRes = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('=== 카카오 프로필 요청 성공 ===');
    const profileData = profileRes.data as any;
    console.log('프로필 데이터:', {
      id: profileData.id,
      hasKakaoAccount: !!profileData.kakao_account,
      hasEmail: !!profileData.kakao_account?.email,
      hasProfile: !!profileData.kakao_account?.profile
    });
    
    const kakaoAccount = (profileRes.data as any).kakao_account;

    const result = {
      email: kakaoAccount.email,
      nickname: kakaoAccount.profile.nickname,
      provider_id: String((profileRes.data as any).id),
      provider: AuthProvider.KAKAO,
    };
    
    console.log('=== 카카오 프로필 파싱 완료 ===');
    console.log('최종 프로필:', {
      email: result.email,
      nickname: result.nickname,
      provider_id: result.provider_id,
      provider: result.provider
    });
    
    return result;
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
