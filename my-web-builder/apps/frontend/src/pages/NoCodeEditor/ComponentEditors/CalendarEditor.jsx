import React, { useState, useEffect } from 'react';
import * as PropertyEditors from '../PropertyEditors';

function CalendarEditor({ selectedComp, onUpdate }) {
  const {
    weddingDate = '',
    highlightColor = '#ff6b9d',
    noBorder = true,
    borderColor = '#e5e7eb',
    borderWidth = '1px',
    borderRadius = 8,
  } = selectedComp.props;

  const [localNoBorder, setLocalNoBorder] = useState(noBorder);

  useEffect(() => {
    setLocalNoBorder(selectedComp.props?.noBorder !== undefined ? !!selectedComp.props.noBorder : true);
  }, [selectedComp.props?.noBorder]);

  const handlePropChange = (propName, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propName]: value
      }
    });
    if (propName === 'noBorder') setLocalNoBorder(!!value);
  };

  return (
    <div>
      <PropertyEditors.DateEditor
        label="결혼식 날짜"
        value={weddingDate}
        onChange={(value) => handlePropChange('weddingDate', value)}
      />
      <PropertyEditors.ColorEditor
        label="Highlight Color"
        value={highlightColor}
        onChange={(value) => handlePropChange('highlightColor', value)}
      />

      {/* 테두리 옵션 */}
      <div style={{ margin: '16px 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          checked={localNoBorder}
          onChange={e => handlePropChange('noBorder', e.target.checked)}
          id="noBorderCheckbox"
          style={{ accentColor: '#007bff' }}
        />
        <label htmlFor="noBorderCheckbox" style={{ fontSize: 14 }}>테두리 제거</label>
      </div>
      {!localNoBorder && (
        <>
          <PropertyEditors.ColorEditor
            label="테두리 색상"
            value={borderColor}
            onChange={v => handlePropChange('borderColor', v)}
          />
          <PropertyEditors.SelectEditor
            label="테두리 두께"
            value={borderWidth}
            onChange={v => handlePropChange('borderWidth', v)}
            options={[
              { value: '1px', label: '1px' },
              { value: '2px', label: '2px' },
              { value: '3px', label: '3px' },
              { value: '4px', label: '4px' }
            ]}
          />
          <PropertyEditors.NumberEditor
            label="모서리 둥글기"
            value={parseInt(borderRadius) || 8}
            onChange={v => handlePropChange('borderRadius', v)}
            min={0}
            max={50}
            suffix="px"
          />
        </>
      )}
    </div>
  );
}

export default CalendarEditor;