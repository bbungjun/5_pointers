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
        borderRadius: 8
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = '#f8f9fa';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'transparent';
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
      
      {/* 썸네일 - 배경 사각형 제거 */}
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 60
      }}>
        <ThumbnailComponent label={component.label} />
      </div>
    </div>
  );
}

export default ComponentCard;
