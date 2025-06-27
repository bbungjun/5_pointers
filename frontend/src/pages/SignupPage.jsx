import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
        const res = await fetch('http://localhost:3000/auth/signup/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, nickname, password }),
        });
        const data = await res.json();
        if (res.ok) {
          onLogin({ nickname });
          navigate('/dashboard');
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
    <div style={{ maxWidth: 400, margin: '80px auto', textAlign: 'center' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        /><br />
        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        /><br />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        /><br />
        <button type="submit" style={{ width: '100%' }}>회원가입</button>
      </form>
      {msg && <div style={{ color: 'red' }}>{msg}</div>}
      <div style={{ marginTop: 16 }}>
        <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}

export default SignupPage;