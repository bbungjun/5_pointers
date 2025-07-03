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
        marginBottom: 8, 
        padding: 12,
        background: '#fff', 
        borderRadius: 8,
        cursor: 'grab', 
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        border: '1px solid #eee',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{
        fontSize: 9, 
        fontWeight: 600, 
        color: '#888',
        marginBottom: 8, 
        textAlign: 'center', 
        textTransform: 'uppercase',
        letterSpacing: 0.5
      }}>
        {component.label}
      </div>
      <div style={{
        height: 60, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa', 
        borderRadius: 4
      }}>
        <ThumbnailComponent label={component.label} />
      </div>
    </div>
  );
}

export default ComponentCard;
