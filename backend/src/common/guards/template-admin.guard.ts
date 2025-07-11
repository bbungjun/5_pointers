import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TemplateAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 임시로 모든 인증된 사용자에게 템플릿 저장 권한 부여
    if (!user) {
      throw new ForbiddenException('로그인이 필요합니다.');
    }

    // TODO: 실제 운영 환경에서는 관리자 권한 체크 필요
    // if (!user || user.role !== 'ADMIN') {
    //   throw new ForbiddenException('템플릿 관리 권한이 없습니다.');
    // }

    return true;
  }
}
