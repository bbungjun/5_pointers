import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SocialCallbackPage() {
  // Toast Context를 안전하게 사용
  let showError = null;
  try {
    const { useToastContext } = require('../contexts/ToastContext');
    const toastContext = useToastContext();
    showError = toastContext?.showError;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showError = (message) => alert(message);
  }

  const navigate = useNavigate();
  const location = useLocation();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const provider = url.searchParams.get('provider');

    console.log('SocialCallbackPage - provider:', provider, 'code:', code);

    if (code && provider) {
      hasFetched.current = true;
      fetch(`${API_BASE_URL}/auth/login/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, authorizationCode: code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('SocialCallbackPage - 백엔드 응답:', data);
          console.log(
            'SocialCallbackPage - 응답의 모든 키:',
            Object.keys(data)
          );
          console.log('SocialCallbackPage - data.user:', data.user);
          console.log('SocialCallbackPage - data.nickname:', data.nickname);
          console.log('SocialCallbackPage - data.name:', data.name);
          console.log(
            'SocialCallbackPage - 전체 응답 구조:',
            JSON.stringify(data, null, 2)
          );

          window.history.replaceState({}, document.title, url.pathname);
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
            
            // 토큰 변경 이벤트 발생 (App.tsx에서 감지)
            window.dispatchEvent(new Event('tokenChanged'));

            // JWT 토큰에서 사용자 정보 추출
            let nickname = `${provider}User`; // 기본값

            try {
              // JWT 토큰 디코딩 (payload 부분만 추출) - 더 안전한 방식
              const tokenParts = data.access_token.split('.');
              if (tokenParts.length === 3) {
                // Base64 URL Safe 디코딩
                const base64Payload = tokenParts[1]
                  .replace(/-/g, '+')
                  .replace(/_/g, '/');
                
                // 패딩 추가
                const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);
                
                try {
                  // 먼저 일반적인 방식으로 시도
                  const decodedPayload = atob(paddedPayload);
                  const payload = JSON.parse(decodedPayload);
                  console.log('JWT payload (일반 디코딩):', payload);
                  
                  nickname =
                    payload.nickname ||
                    payload.name ||
                    payload.email?.split('@')[0] ||
                    nickname;
                } catch (innerError) {
                  console.log('일반 디코딩 실패, UTF-8 디코딩 시도:', innerError);
                  
                  // UTF-8 디코딩 시도
                  const decodedPayload = decodeURIComponent(
                    atob(paddedPayload)
                      .split('')
                      .map(
                        (c) =>
                          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                      )
                      .join('')
                  );
                  const payload = JSON.parse(decodedPayload);
                  console.log('JWT payload (UTF-8 디코딩):', payload);
                  
                  nickname =
                    payload.nickname ||
                    payload.name ||
                    payload.email?.split('@')[0] ||
                    nickname;
                }
              }
            } catch (error) {
              console.error('JWT 디코딩 실패:', error);
              // 실패 시 기본값 사용
              nickname = `${provider}User`;
            }

            console.log('SocialCallbackPage - 최종 사용할 nickname:', nickname);

            // 초대 링크에서 왔는지 확인하고 리디렉션
            const redirectUrl = localStorage.getItem('redirectUrl');
            if (redirectUrl) {
              // 리디렉션 URL 정리
              localStorage.removeItem('redirectUrl');
              console.log('소셜 로그인 후 원래 목적지로 이동:', redirectUrl);
              // 전체 URL로 이동 (초대 링크 처리를 위해)
              window.location.href = redirectUrl;
            } else {
              // 기본 대시보드로 이동
              console.log('소셜 로그인 성공 - 대시보드로 이동');
              navigate('/dashboard', { replace: true });
            }
          } else {
            showError(data.message || '소셜 로그인 실패');
            navigate('/login');
          }
        })
        .catch((error) => {
          console.error('SocialCallbackPage - 에러:', error);
          window.history.replaceState({}, document.title, url.pathname);
          showError('소셜 로그인 에러');
          navigate('/login');
        });
    } else {
      navigate('/');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-200/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">소셜 로그인 처리 중...</p>
        </div>
      </div>
    </div>
  );
}

export default SocialCallbackPage;
