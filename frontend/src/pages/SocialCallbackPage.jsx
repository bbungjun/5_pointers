import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';

function SocialCallbackPage({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const isGoogle = url.pathname.includes('google');
    const isKakao = url.pathname.includes('kakao');
    const provider = isGoogle ? 'google' : isKakao ? 'kakao' : undefined;

    if (code && provider) {
      fetch(`${API_BASE_URL}/auth/login/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, authorizationCode: code }),
      })
        .then(res => res.json())
        .then(data => {
          window.history.replaceState({}, document.title, url.pathname);
          if (data.access_token) {
            onLogin({ nickname: provider + 'User' });
            navigate('/dashboard');
          } else {
            alert(data.message || '소셜 로그인 실패');
            navigate('/login');
          }
        })
        .catch(() => {
          window.history.replaceState({}, document.title, url.pathname);
          alert('소셜 로그인 에러');
          navigate('/login');
        });
    } else {
      navigate('/');
    }
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fafbfc',
      }}
    >
      <div>소셜 로그인 처리 중...</div>
    </div>
  );
}

export default SocialCallbackPage;
