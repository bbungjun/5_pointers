import React, { useState, useEffect } from 'react';
import * as PropertyEditors from '../PropertyEditors';

function CalendarEditor({ selectedComp, onUpdate }) {
  const {
    weddingDate = '',
    highlightColor = '#ff6b9d',
    noBorder = true,
    borderColor = '#e5e7eb',
    borderWidth = '1px',
    borderRadius = 0,
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

      {/* 테두리 옵션 - BorderEditor로 통합 */}
      <BorderEditor
        noBorder={localNoBorder}
        borderColor={borderColor}
        borderWidth={borderWidth}
        borderRadius={borderRadius}
        onChange={handlePropChange}
      />
    </div>
  );
}

export default CalendarEditor;