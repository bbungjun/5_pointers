import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  API_BASE_URL,
  GOOGLE_CLIENT_ID,
  KAKAO_CLIENT_ID,
  getRedirectUrl,
} from '../config';
import googleLoginImg from '../assets/web_light_sq_ctn@1x.png';
import kakaoLoginImg from '../assets/kakao_login_medium_narrow.png';
import ddukddakLogo from '/ddukddak-logo.png';

function MainPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // 소셜 로그인 리다이렉트 URL
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${getRedirectUrl('google')}&response_type=code&scope=openid%20email%20profile`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${getRedirectUrl('kakao')}&response_type=code`;

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
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-pink-200/30">
        <div className="mb-8">
          {/* 로고 영역 */}
          <div className="mb-6">
            <img
              src={ddukddakLogo}
              alt="DdukDdak"
              className="w-60 h-60 mx-auto mb-4 object-contain"
            />
          </div>

          <div className="flex justify-center mb-6">
            <img 
              src="/ddukddak-logo.png" 
              alt="DDUKDDAK" 
              className="h-8 object-contain" 
            />
          </div>          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            특별한 순간을 위한 이벤트 페이지 
          </p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
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

        {/* 소셜 로그인 */}
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

          <div className="mt-6 grid grid-cols-2 gap-4">
            <a href={GOOGLE_AUTH_URL} className="w-full">
              <img
                src={googleLoginImg}
                alt="구글 로그인"
                className="w-full h-12 object-contain cursor-pointer transition-all duration-300"
              />
            </a>

            <a href={KAKAO_AUTH_URL} className="w-full">
              <img
                src={kakaoLoginImg}
                alt="카카오 로그인"
                className="w-full h-12 object-contain cursor-pointer transition-all duration-300"
              />
            </a>
          </div>
        </div>

        {/* 에러 메시지 */}
        {msg && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center font-medium">
              {msg}
            </p>
          </div>
        )}

        {/* 회원가입 링크 */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            계정이 없으신가요?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-pink-600 hover:text-rose-600 font-semibold hover:underline transition-all duration-300"
            >
              지금 시작하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
