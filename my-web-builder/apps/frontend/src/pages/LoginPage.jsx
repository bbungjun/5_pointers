import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID,
  getRedirectUrl,
} from '../config';
import googleLoginImg from '../assets/web_light_sq_ctn@1x.png';
import kakaoLoginImg from '../assets/kakao_login_medium_wide.png';
import ddukddakLogo from '/ddukddak-logo.png';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // 소셜 로그인 리다이렉트 URL
  const googleRedirectUrl = getRedirectUrl('google');
  console.log('Google OAuth 설정:', {
    clientId: GOOGLE_CLIENT_ID,
    redirectUrl: googleRedirectUrl
  });
  
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(googleRedirectUrl)}&response_type=code&scope=openid%20email%20profile`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${getRedirectUrl('kakao')}&response_type=code`;

  // 소셜 로그인은 SocialCallbackPage에서 처리됨

  // 로컬 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin({ nickname: email.split('@')[0] });

        // App.jsx에서 리다이렉션을 처리하므로 여기서는 제거
        // 기본 대시보드로 이동 (리다이렉션이 없는 경우)
        if (!localStorage.getItem('redirectUrl')) {
          navigate('/dashboard');
        }
      } else {
        setMsg(data.message || '로그인 실패');
      }
    } catch (err) {
      setMsg('로그인 에러');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-pink-200/30">
        {/* 로고 영역 - 네모 박스 위에 추가 */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/ddukddak-logo.png" 
              alt="DDUKDDAK"
              className="w-60 h-60 mx-auto mb-4 object-contain"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border-0 mt-6"
          >
            로그인하기
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/90 text-slate-500 font-medium">
                또는
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <a href={GOOGLE_AUTH_URL} className="w-full block flex justify-center">
              <button className="gsi-material-button w-80 h-12">
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Google 로그인</span>
                  <span style={{ display: 'none' }}>Google 로그인</span>
                </div>
              </button>
            </a>

            <a href={KAKAO_AUTH_URL} className="w-full block flex justify-center">
              <button className="kakao-material-button w-80 h-12">
                <div className="kakao-material-button-content-wrapper">
                  <div className="kakao-material-button-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="10" cy="10" r="10" fill="#FEE500"/>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 3C5.58133 3 2 5.7791 2 9.20745C2 11.3382 3.38489 13.2184 5.49511 14.3367L4.60711 17.5927C4.52889 17.8814 4.856 18.1105 5.10756 17.9435L8.99822 15.3643C9.32711 15.3963 9.66044 15.414 10 15.414C14.4178 15.414 18 12.6349 18 9.20745C18 5.7791 14.4178 3 10 3Z" fill="black"/>
                    </svg>
                  </div>
                  <span className="kakao-material-button-contents">카카오 로그인</span>
                </div>
              </button>
            </a>
          </div>
        </div>

        {msg && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center font-medium">
              {msg}
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="text-pink-600 hover:text-rose-600 font-semibold hover:underline transition-all duration-300"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
