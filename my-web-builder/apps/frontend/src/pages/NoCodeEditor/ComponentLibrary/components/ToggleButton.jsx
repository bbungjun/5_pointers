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
        border: '2px solid #f9a8d4',
        borderRadius: 12,
        background: '#ffffff',
        color: '#ec4899',
        cursor: 'pointer',
        fontSize: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        zIndex: 1000,
        boxShadow: '0 4px 16px rgba(236, 72, 153, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#fdf2f8';
        e.target.style.borderColor = '#ec4899';
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = '#ffffff';
        e.target.style.borderColor = '#f9a8d4';
        e.target.style.transform = 'scale(1)';
      }}
      title="컴포넌트 라이브러리 열기"
    >
      📦
    </button>
  );
}

export default ToggleButton;
