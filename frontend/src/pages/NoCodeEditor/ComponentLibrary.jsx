import React from 'react';
import { ComponentList } from '../components/definitions';

function ComponentLibrary({ onDragStart }) {
  return (
    <div style={{
      width: 180, background: '#3B4EFF', color: '#fff', padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <h3 style={{ marginBottom: 24, fontWeight: 900, letterSpacing: 2 }}>Components</h3>
      {ComponentList.map(comp => (
        <div
          key={comp.type}
          draggable
          onDragStart={e => onDragStart(e, comp.type)}
          style={{
            width: '100%', marginBottom: 16, padding: 16,
            background: '#fff', color: '#3B4EFF', borderRadius: 8,
            fontWeight: 700, fontSize: 18, textAlign: 'center',
            cursor: 'grab', boxShadow: '0 1px 4px #0001'
          }}
        >
          {comp.label}
        </div>
      ))}
    </div>
  );
}

export default ComponentLibrary; 