import React from 'react';

function LibraryHeader({ componentCount, onToggle }) {
  return (
    <div style={{
      padding: '20px 24px',
      borderBottom: '1px solid #e1e5e9',
      backgroundColor: '#fafbfc'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#3B4EFF',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff'
          }}>
            📦
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#1d2129',
              letterSpacing: '0.3px'
            }}>
              Components
            </h3>
            <div style={{
              fontSize: 12,
              color: '#65676b',
              marginTop: 2
            }}>
              {componentCount} components available
            </div>
          </div>
        </div>
        
        {onToggle && (
          <button
            onClick={onToggle}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              borderRadius: 6,
              background: '#f0f2f5',
              color: '#65676b',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e4e6ea';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f0f2f5';
            }}
            title="컴포넌트 라이브러리 닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default LibraryHeader;
