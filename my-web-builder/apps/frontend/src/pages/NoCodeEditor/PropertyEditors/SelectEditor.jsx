import React from 'react';

function SelectEditor({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ 
        display: 'block',
        fontSize: 13, 
        color: '#333', 
        fontWeight: 500,
        marginBottom: 6
      }}>
        {label}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid #ddd',
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          backgroundColor: 'white',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#0066FF'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectEditor;
