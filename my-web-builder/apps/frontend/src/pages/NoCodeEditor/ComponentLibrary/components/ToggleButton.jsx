import React from 'react';

function ToggleButton({ onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        top: 84,
        left: 20,
        width: 50,
        height: 50,
        border: 'none',
        borderRadius: 12,
        background: '#3B4EFF',
        color: '#fff',
        cursor: 'pointer',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        zIndex: 1000,
        boxShadow: '0 4px 16px rgba(59, 78, 255, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#2c39d4';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#3B4EFF';
        e.target.style.transform = 'scale(1)';
      }}
      title="컴포넌트 라이브러리 열기"
    >
      📦
    </button>
  );
}

export default ToggleButton;
