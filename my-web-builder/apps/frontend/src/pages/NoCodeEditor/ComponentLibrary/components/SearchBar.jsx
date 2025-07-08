import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{ 
      padding: '16px 24px', 
      borderBottom: '1px solid #e1e5e9',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* 검색 아이콘과 X 아이콘을 담는 컨테이너 */}
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1
        }}>
          <span style={{ color: '#6b7280', fontSize: '16px' }}>
            🔍
          </span>
          
          {/* 검색어가 있을 때 지우기 버튼 */}
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#6b7280';
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#9ca3af';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          )}
        </div>
        
        <input
          type="text"
          placeholder="컴포넌트 검색..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3B4EFF';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 78, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;
