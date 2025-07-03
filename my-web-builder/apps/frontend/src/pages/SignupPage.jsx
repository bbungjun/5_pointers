import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SignupPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (email && nickname && password) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/signup/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nickname, password }),
        });
        const data = await res.json();
        if (res.ok) {
          // 회원가입 성공 후 자동 로그인
          try {
            const loginRes = await fetch(`${API_BASE_URL}/auth/login/local`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            const loginData = await loginRes.json();
            
            if (loginRes.ok && loginData.access_token) {
              localStorage.setItem('token', loginData.access_token);
              onLogin({ nickname });
              
              // 초대 링크에서 왔는지 확인하고 리디렉션
              const redirectUrl = localStorage.getItem('redirectUrl');
              if (redirectUrl) {
                localStorage.removeItem('redirectUrl');
                console.log('회원가입 후 원래 목적지로 이동:', redirectUrl);
                window.location.href = redirectUrl;
              } else {
                navigate('/dashboard');
              }
            } else {
              // 자동 로그인 실패 시 일반 회원가입 완료 처리
              onLogin({ nickname });
              navigate('/dashboard');
            }
          } catch (loginErr) {
            console.error('자동 로그인 실패:', loginErr);
            // 자동 로그인 실패 시 일반 회원가입 완료 처리
            onLogin({ nickname });
            navigate('/dashboard');
          }
        } else {
          setMsg(data.message || '회원가입 실패');
        }
      } catch (err) {
        setMsg('회원가입 에러');
      }
    } else {
      setMsg('모든 항목을 입력하세요.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-blue-200/30">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            회원가입
          </h2>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            새로운 여정을<br/>
            <span className="text-blue-600 font-semibold">함께</span> 시작해보세요
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium"
              required
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-slate-400 font-medium"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border-0 mt-6"
          >
            가입하기
          </button>
        </form>
        
        {msg && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center font-medium">{msg}</p>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            이미 계정이 있으신가요?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-indigo-600 font-semibold hover:underline transition-all duration-300"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;