import React from 'react';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      maxWidth: 400,
      margin: '80px auto',
      padding: 32,
      border: '1px solid #eee',
      borderRadius: 12,
      textAlign: 'center',
      background: '#fafbfc'
    }}>
      <h1 style={{ marginBottom: 24 }}>PageLego: Create your website in minutes.</h1>
      <button
        style={{ width: '100%', marginBottom: 12, padding: 12, fontSize: 16 }}
        onClick={() => navigate('/login')}
      >
        Login
      </button>
      <button
        style={{ width: '100%', marginBottom: 12, padding: 12, fontSize: 16 }}
        onClick={() => navigate('/signup')}
      >
        Sign Up
      </button>
      <button
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16,
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: 4
        }}
        onClick={() => navigate('/login')}
      >
        Get Started Now
      </button>
    </div>
  );
}

export default MainPage;