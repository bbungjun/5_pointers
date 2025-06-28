import React from 'react';
import { ComponentDefinitions } from '../components/definitions';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
  const componentDef = selectedComp ? ComponentDefinitions[selectedComp.type] : null;

  const renderInput = (key, fieldDef) => {
    const value = selectedComp.props[key];
    
    switch (fieldDef.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={e => onUpdate({ 
              ...selectedComp, 
              props: { ...selectedComp.props, [key]: e.target.value } 
            })}
            style={{ width: '100%', padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #bbb' }}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e => onUpdate({ 
              ...selectedComp, 
              props: { ...selectedComp.props, [key]: Number(e.target.value) } 
            })}
            style={{ width: 80, padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #bbb' }}
          />
        );
      case 'color':
        return (
          <input
            type="color"
            value={value}
            onChange={e => onUpdate({ 
              ...selectedComp, 
              props: { ...selectedComp.props, [key]: e.target.value } 
            })}
            style={{ width: 40, height: 32, border: 'none', background: 'none' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      width: 260, background: '#fff', borderLeft: '1px solid #eee', padding: 24,
      display: 'flex', flexDirection: 'column', minHeight: '100vh'
    }}>
      <h3 style={{ marginBottom: 24, fontWeight: 900, letterSpacing: 2 }}>Inspector</h3>
      {selectedComp && componentDef ? (
        <div>
          <div style={{ marginBottom: 12, fontWeight: 700 }}>Type: {componentDef.label}</div>
          {Object.entries(componentDef.edit).map(([key, fieldDef]) => (
            <div key={key} style={{ marginBottom: 8 }}>
              <label>{fieldDef.label}: </label>
              {renderInput(key, fieldDef)}
            </div>
          ))}
          <div style={{ marginTop: 16, color: '#888', fontSize: 13 }}>
            <b>Delete</b> key to remove
          </div>
        </div>
      ) : (
        <div style={{ color: '#bbb', fontSize: 16 }}>Select a component</div>
      )}
      <div style={{ marginTop: 40, fontSize: 13, color: '#888' }}>
        <div>Nickname: <span style={{ color }}>{nickname}</span></div>
        <div style={{ marginTop: 4 }}>Room: <b>{roomId}</b></div>
      </div>
    </div>
  );
}

export default Inspector; 