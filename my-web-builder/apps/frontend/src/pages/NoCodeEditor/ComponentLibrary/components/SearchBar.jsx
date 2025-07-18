import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div
      style={{
        padding: '12px 24px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* 검색 아이콘 */}

        {/* 검색어가 있을 때 지우기 버튼 (오른쪽) */}
        {searchTerm && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
            }}
          >
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
                height: '16px',
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
          </div>
        )}

        <input
          type="text"
          placeholder="컴포넌트 검색"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 20px 6px 12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0ea5e9';
            e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
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
