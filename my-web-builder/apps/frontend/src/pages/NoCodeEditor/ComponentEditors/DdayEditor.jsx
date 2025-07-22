import React from 'react';
import { DateEditor, ColorPaletteEditor } from '../PropertyEditors';

function DdayEditor({ selectedComp, onUpdate }) {
  const { defaultProps = {} } = selectedComp;
  const targetDate = selectedComp.props.targetDate ?? defaultProps.targetDate ?? '2025-07-26';
  const targetTime = selectedComp.props.targetTime ?? defaultProps.targetTime ?? '14:00';
  const backgroundColor = selectedComp.props.backgroundColor ?? defaultProps.backgroundColor ?? '#ffffff';



  return (
    <div>

      
      <DateEditor
        value={targetDate}
        onChange={value => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, targetDate: value }
        })}
        label="날짜"
      />

      {/* 목표 시간 입력 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 6
        }}>
          결혼식 시간
        </label>
        <input
          type="time"
          value={targetTime}
          onChange={(e) => onUpdate({
            ...selectedComp,
            props: { ...selectedComp.props, targetTime: e.target.value }
          })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: '#fff'
          }}
        />
      </div>

      {/* 배경색 선택 */}
      <ColorPaletteEditor
        label="배경색"
        value={backgroundColor}
        onChange={(color) => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, backgroundColor: color }
        })}
      />
    </div>
  );
}

export default DdayEditor;
