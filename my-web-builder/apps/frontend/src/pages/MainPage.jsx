import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const MainPage = () => {
  const navigate = useNavigate();

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;

      let base64 = tokenParts[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('토큰 파싱 오류:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom right, #FF969A, #9E9EE6)',
          overflow: 'hidden',
        }}
      >
        {/* Flowing Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal flowing lines */}
          <div
            className="absolute top-1/4 left-0 w-full h-px bg-white/30 animate-pulse"
            style={{ animation: 'flow 8s ease-in-out infinite' }}
          ></div>
          <div
            className="absolute top-3/4 left-0 w-full h-px bg-white/30 animate-pulse"
            style={{ animation: 'flow 8s ease-in-out infinite 2s' }}
          ></div>
          <div
            className="absolute top-1/2 left-0 w-full h-px bg-white/20 animate-pulse"
            style={{ animation: 'flow 10s ease-in-out infinite 1s' }}
          ></div>

          {/* Curved flowing lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ animation: 'flow 12s ease-in-out infinite' }}
          >
            <path
              d="M0,200 Q300,150 600,200 T1200,200"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M0,400 Q400,350 800,400 T1600,400"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        {/* Floating Circles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left side circles */}
          <div
            className="absolute top-1/4 left-1/4"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            {/* Main colored circle */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300/40 to-purple-300/40"></div>
            {/* White border circle */}
            <div className="absolute -top-2 -left-2 w-20 h-20 rounded-full border border-white/30"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border border-white/20"></div>
          </div>

          <div
            className="absolute top-2/3 left-1/6"
            style={{ animation: 'float 8s ease-in-out infinite 1s' }}
          >
            {/* Main colored circle */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30"></div>
            {/* White border circle */}
            <div className="absolute -top-1 -left-1 w-14 h-14 rounded-full border border-white/25"></div>
            <div className="absolute -top-3 -left-3 w-18 h-18 rounded-full border border-white/15"></div>
          </div>

          {/* Right side circles */}
          <div
            className="absolute top-1/3 right-1/4"
            style={{ animation: 'float 7s ease-in-out infinite 2s' }}
          >
            {/* Main colored circle */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-300/40 to-pink-300/40"></div>
            {/* White border circle */}
            <div className="absolute -top-3 -left-3 w-26 h-26 rounded-full border border-white/30"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full border border-white/20"></div>
          </div>

          <div
            className="absolute bottom-1/4 right-1/6"
            style={{ animation: 'float 9s ease-in-out infinite 0.5s' }}
          >
            {/* Main colored circle */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30"></div>
            {/* White border circle */}
            <div className="absolute -top-2 -left-2 w-18 h-18 rounded-full border border-white/25"></div>
            <div className="absolute -top-4 -left-4 w-22 h-22 rounded-full border border-white/15"></div>
          </div>

          {/* Additional small circles */}
          <div
            className="absolute top-1/2 left-1/3"
            style={{ animation: 'float 5s ease-in-out infinite 1.5s' }}
          >
            <div className="w-6 h-6 rounded-full bg-white/20"></div>
            <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full border border-white/20"></div>
          </div>

          <div
            className="absolute bottom-1/3 right-1/3"
            style={{ animation: 'float 6s ease-in-out infinite 2.5s' }}
          >
            <div className="w-4 h-4 rounded-full bg-white/15"></div>
            <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border border-white/15"></div>
          </div>
        </div>

        {/* Simple Header */}
        <div className="bg-transparent relative z-10">
          <div className="max-w-8xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src="/ddukddak-logo.png"
                  alt="DDUKDDAK"
                  style={{ height: '35px', objectFit: 'contain' }}
                />
              </div>

              {/* Login/Signup Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-300"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2 bg-white text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-all duration-300"
                >
                  회원가입
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex items-start justify-center h-screen">
          <div className="text-center text-white w-full mt-48">
            <h1 className="text-6xl font-bold mb-4 tracking-wide leading-tight">
              특별한 날을
              <br />더 특별하게
            </h1>

            <div className="mt-16">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-semibold rounded-full transition-all duration-300 text-lg"
              >
                시작하기
              </button>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
        @keyframes flow {
          0%,
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainPage;
