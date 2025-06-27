import React from 'react';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
  return (
    <div style={{
      width: 260, background: '#fff', borderLeft: '1px solid #eee', padding: 24,
      display: 'flex', flexDirection: 'column', minHeight: '100vh'
    }}>
      <h3 style={{ marginBottom: 24, fontWeight: 900, letterSpacing: 2 }}>Inspector</h3>
      {selectedComp ? (
        <div>
          <div style={{ marginBottom: 12, fontWeight: 700 }}>Type: {selectedComp.type}</div>
          <div style={{ marginBottom: 8 }}>
            <label>Text: </label>
            <input
              value={selectedComp.props.text}
              onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, text: e.target.value } })}
              style={{ width: '100%', padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #bbb' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Font Size: </label>
            <input
              type="number"
              value={selectedComp.props.fontSize}
              onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, fontSize: Number(e.target.value) } })}
              style={{ width: 80, padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #bbb' }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>Color: </label>
            <input
              type="color"
              value={selectedComp.props.color}
              onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, color: e.target.value } })}
              style={{ width: 40, height: 32, border: 'none', background: 'none' }}
            />
          </div>
          {selectedComp.type === 'button' && (
            <div style={{ marginBottom: 8 }}>
              <label>Background: </label>
              <input
                type="color"
                value={selectedComp.props.bg}
                onChange={e => onUpdate({ ...selectedComp, props: { ...selectedComp.props, bg: e.target.value } })}
                style={{ width: 40, height: 32, border: 'none', background: 'none' }}
              />
            </div>
          )}
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