import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DraftsPage from './pages/DraftsPage';
import DeployedPage from './pages/DeployedPage';
import SocialCallbackPage from './pages/SocialCallbackPage';
import Dashboard from './pages/Dashboard';
import AppEditor from './pages/AppEditor';
import NoCodeEditor from './pages/NoCodeEditorWithRecovery';
import InvitationHandler from './pages/InvitationHandler';
import RecoveryTest from './pages/RecoveryTest';
import SecretPage from './pages/SecretPage';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  // JWT 토큰 기반으로 로그인 상태 확인
  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    try {
      // JWT 토큰 구조 확인
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error(
          'App.jsx - JWT 토큰 구조가 올바르지 않음:',
          tokenParts.length,
          'parts'
        );
        return false;
      }

      // Base64URL을 Base64로 변환
      let base64 = tokenParts[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;



      return isValid;
    } catch (error) {
      console.error('App.jsx - JWT 파싱 오류:', error);
      console.error('App.jsx - 문제가 있는 토큰:', token);
      return false;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(checkLoginStatus);
  const [user, setUser] = useState(() => {
    // 로그인 상태에 따라 사용자 정보 설정
    const token = localStorage.getItem('token');
    if (!token) return { nickname: 'Guest' };

    try {
      // JWT 토큰 구조 확인
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return { nickname: 'Guest' };
      }

      // Base64URL을 Base64로 변환
      let base64 = tokenParts[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      return {
        nickname:
          payload.nickname ||
          payload.name ||
          payload.email?.split('@')[0] ||
          'User',
      };
    } catch (error) {
      console.error('App.jsx - 사용자 정보 파싱 오류:', error);
      return { nickname: 'Guest' };
    }
  });

  // 토큰 변경 감지 및 로그인 상태 업데이트
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        const newLoginStatus = checkLoginStatus();
        setIsLoggedIn(newLoginStatus);
        
        if (newLoginStatus) {
          // 새로운 사용자 정보 설정
          const token = localStorage.getItem('token');
          if (token) {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
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
                
                setUser({
                  nickname:
                    payload.nickname ||
                    payload.name ||
                    payload.email?.split('@')[0] ||
                    'User',
                });
              }
            } catch (error) {
              console.error('App.jsx - 새 토큰 파싱 오류:', error);
            }
          }
        } else {
          setUser({ nickname: 'Guest' });
        }
      }
    };

    // storage 이벤트 리스너 등록
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 토큰 변경도 감지하기 위한 커스텀 이벤트
    const handleTokenChange = () => {
      const newLoginStatus = checkLoginStatus();
      setIsLoggedIn(newLoginStatus);
      
      if (newLoginStatus) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
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
              
              setUser({
                nickname:
                  payload.nickname ||
                  payload.name ||
                  payload.email?.split('@')[0] ||
                  'User',
              });
            }
          } catch (error) {
            console.error('App.jsx - 새 토큰 파싱 오류:', error);
          }
        }
      } else {
        setUser({ nickname: 'Guest' });
      }
    };

    window.addEventListener('tokenChanged', handleTokenChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleTokenChange);
    };
  }, []);

  // 로그인 성공 시 호출
  const handleLogin = (userInfo) => {
    setIsLoggedIn(true);
    setUser(userInfo);

    // 초대 링크에서 왔는지 확인하고 리디렉션
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      // 리디렉션 URL 정리
      localStorage.removeItem('redirectUrl');

      // URL 파라미터가 저장되어 있는지 확인
      const savedParams = localStorage.getItem('invitationParams');
      if (savedParams) {
        // 파라미터는 InvitationHandler에서 처리하도록 그대로 두고
        // 초대 링크로 이동
        window.location.href = redirectUrl;
      } else {
        // 일반적인 리디렉션의 경우
        window.location.href = redirectUrl;
      }
    }
  };

  // 로그아웃
  const handleLogout = () => {
    // 먼저 상태를 업데이트
    setIsLoggedIn(false);
    setUser({ nickname: 'Guest' });
    // 토큰 제거
    localStorage.removeItem('token');
    // 브라우저 히스토리를 완전히 교체하여 메인페이지로 이동
    window.history.replaceState(null, '', '/');
    window.location.reload();
  };

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <MainPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isLoggedIn ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignupPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? (
                <DashboardPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/dashboard/drafts"
            element={
              isLoggedIn ? (
                <DraftsPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/dashboard/deployed"
            element={
              isLoggedIn ? (
                <DeployedPage user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/editor/:pageId"
            element={
              isLoggedIn ? <AppEditor /> : <Navigate to="/login" replace />
            }
          />
          <Route
            path="/social-callback"
            element={<SocialCallbackPage onLogin={handleLogin} />}
          />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="/no-code-editor" element={<NoCodeEditor />} />
          <Route
            path="/invitation/:inviteCode"
            element={<InvitationHandler />}
          />
          <Route path="/recovery-test" element={<RecoveryTest />} />
          <Route path="/secret" element={<SecretPage />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
