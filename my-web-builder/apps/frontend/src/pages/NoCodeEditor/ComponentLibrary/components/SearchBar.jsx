import React from 'react';

function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e1e5e9' }}>
      <input
        type="text"
        placeholder="원하는 기능을 검색하세요"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e1e5e9',
          borderRadius: 6,
          fontSize: 13,
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}

export default SearchBar;
