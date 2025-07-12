import React from 'react';

export default function WeddingContentRenderer({ comp }) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: comp.props?.backgroundColor || '#fff',
      color: comp.props?.color || '#333',
      padding: 16,
      borderRadius: 8,
      boxSizing: 'border-box'
    }}>
      <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>
        {comp.props?.title || '제목 없음'}
      </h3>
      <div style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>
        {comp.props?.content || '내용 없음'}
      </div>
    </div>
  );
} 