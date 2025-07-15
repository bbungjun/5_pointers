import React from 'react';
import ColorEditor from './ColorEditor';
import SelectEditor from './SelectEditor';
import BorderRadiusEditor from './BorderRadiusEditor';

export default function BorderEditor({
  noBorder = true,
  borderColor = '#e5e7eb',
  borderWidth = '1px',
  borderRadius = 0,
  onChange
}) {
  return (
    <div>
      <div style={{ margin: '16px 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={noBorder}
          onChange={e => onChange('noBorder', e.target.checked)}
          id="noBorderCheckbox"
          style={{ accentColor: '#007bff' }}
        />
        <label htmlFor="noBorderCheckbox" style={{ fontSize: 14 }}>테두리 제거</label>
      </div>
      {!noBorder && (
        <>
          <ColorEditor
            label="테두리 색상"
            value={borderColor}
            onChange={v => onChange('borderColor', v)}
          />
          <SelectEditor
            label="테두리 두께"
            value={borderWidth}
            onChange={v => onChange('borderWidth', v)}
            options={[
              { value: '1px', label: '1px' },
              { value: '2px', label: '2px' },
              { value: '3px', label: '3px' },
              { value: '4px', label: '4px' }
            ]}
          />
          <BorderRadiusEditor
            label="모서리 둥글기"
            value={parseInt(borderRadius) || 0}
            onChange={v => onChange('borderRadius', v)}
            min={0}
            max={50}
            suffix="px"
          />
        </>
      )}
    </div>
  );
}