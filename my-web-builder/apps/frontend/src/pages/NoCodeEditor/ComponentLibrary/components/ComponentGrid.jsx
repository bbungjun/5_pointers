import React from 'react';
import ComponentCard from './ComponentCard';

function ComponentGrid({ components, searchTerm, onDragStart }) {
  const filteredComponents = components.filter(comp => 
    (comp.label && comp.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (comp.type && comp.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredComponents.length === 0 && searchTerm) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#65676b',
        fontSize: 14
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px 12px', 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, 120px)',
      gap: '6px',
      alignItems: 'start',
      justifyContent: 'center'
    }}>
      {filteredComponents.map(comp => (
        <ComponentCard
          key={comp.type}
          component={comp}
          onDragStart={onDragStart}
        />
      ))}
    </div>
  );
}

export default ComponentGrid;
