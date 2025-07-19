import React from 'react';
import { useNavigate } from 'react-router-dom';

const SecretPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center text-white p-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-2xl">
          <h1 className="text-6xl font-bold mb-6 animate-bounce">
            🎉 축하합니다! 🎉
          </h1>
          
          <p className="text-2xl mb-8 leading-relaxed">
            비밀 페이지를 발견하셨네요!<br />
            당신은 정말 관찰력이 뛰어나세요! 👀
          </p>
          
          <div className="text-lg mb-8 space-y-2">
            <p>✨ 숨겨진 기능을 찾아내다니 대단해요!</p>
            <p>🎨 이 페이지는 특별히 당신을 위해 준비했어요</p>
            <p>🌟 앞으로도 더 많은 비밀을 찾아보세요!</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-semibold rounded-full transition-all duration-300 text-lg hover:scale-105"
            >
              🏠 메인으로 돌아가기
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white text-purple-600 hover:bg-purple-50 font-semibold rounded-full transition-all duration-300 text-lg hover:scale-105"
            >
              🚀 대시보드로 가기
            </button>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default SecretPage; 