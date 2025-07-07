import React from 'react';

function TextAreaEditor({ label, value, onChange, placeholder, rows = 2 }) {
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
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: 14,
          border: '1px solid #ddd',
          borderRadius: 6,
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
          resize: 'vertical',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => e.target.style.borderColor = '#0066FF'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
    </div>
  );
}

export default TextAreaEditor;
