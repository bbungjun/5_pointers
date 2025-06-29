import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  // 소셜 로그인 리다이렉트 URL
  const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:5173/google&response_type=code&scope=openid%20email%20profile`;
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=http://localhost:5173/kakao&response_type=code`;

  // 소셜 로그인 인가 코드 처리
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      const isGoogle = url.pathname.includes('google');
      const isKakao = url.pathname.includes('kakao');
      const provider = isGoogle ? 'google' : isKakao ? 'kakao' : undefined;
      if (provider) {
        fetch('http://localhost:3000/auth/login/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, authorizationCode: code }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.access_token) {
              localStorage.setItem('token', data.access_token);
              onLogin({ nickname: provider + 'User' });
              navigate('/dashboard');
              // URL에서 code 파라미터 제거
              window.history.replaceState({}, document.title, url.pathname);
            } else {
              setMsg(data.message || '소셜 로그인 실패');
            }
          })
          .catch(() => setMsg('소셜 로그인 에러'));
      }
    }
    // eslint-disable-next-line
  }, []);

  // 로컬 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await fetch('http://localhost:3000/auth/login/local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        onLogin({ nickname: email.split('@')[0] });
        navigate('/dashboard');
      } else {
        setMsg(data.message || '로그인 실패');
      }
    } catch (err) {
      setMsg('로그인 에러');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">로그인</h2>
          <p className="text-gray-600">계정에 로그인하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            로그인
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <a href={GOOGLE_AUTH_URL} className="w-full">
              <button 
                type="button"
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                구글 로그인
              </button>
            </a>
            
            <a href={KAKAO_AUTH_URL} className="w-full">
              <button 
                type="button"
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
              >
                카카오 로그인
              </button>
            </a>
          </div>
        </div>
        
        {msg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{msg}</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{' '}
            <Link 
              to="/signup" 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
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