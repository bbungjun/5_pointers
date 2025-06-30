import React from 'react';

export default function MapInfoRenderer({ comp }) {
  const sections = Array.isArray(comp.props.sections)
    ? comp.props.sections
    : [];

  return (
    <div style={{ padding: 8 }}>
      {sections.map((sec, idx) => (
        <div
          key={idx}
          style={{
            padding: '6px 0',
            borderBottom: idx < sections.length - 1 ? '1px solid #eee' : 'none',
          }}
        >
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 2,
            color: '#333'
          }}>
            {sec.header || '제목 없음'}
          </div>

          <div style={{
            fontSize: 12,
            color: '#666',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.4,
          }}>
            {sec.content || '내용 없음'}
          </div>
        </div>
      ))}
    </div>
  );
}
