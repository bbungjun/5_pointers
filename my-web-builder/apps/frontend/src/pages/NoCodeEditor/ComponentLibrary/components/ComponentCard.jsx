import React from 'react';
import { ThumbnailComponents } from '../thumbnails';

function ComponentCard({ component, onDragStart }) {
  const ThumbnailComponent = ThumbnailComponents[component.type] || ThumbnailComponents.default;

  return (
    <div
      key={component.type}
      draggable
      onDragStart={e => onDragStart(e, component.type)}
      style={{
        width: '100%', 
        marginBottom: 16, 
        padding: '12px 16px',
        cursor: 'grab', 
        transition: 'all 0.2s ease',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        backgroundColor: 'transparent'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = '#f8f9fa';
        e.currentTarget.style.borderColor = '#d1d5db';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* 컴포넌트 이름 */}
      <div style={{
        fontSize: 12, 
        fontWeight: 600, 
        color: '#374151',
        marginBottom: 12, 
        textAlign: 'center'
      }}>
        {component.label}
      </div>
      
      {/* 썸네일 - 고정된 크기 영역 */}
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 75,  // 고정 높이
        width: '100%'
      }}>
        <ThumbnailComponent label={component.label} />
      </div>
    </div>
  );
}

export default ComponentCard;
