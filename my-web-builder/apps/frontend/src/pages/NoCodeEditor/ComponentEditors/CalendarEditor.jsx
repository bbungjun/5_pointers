import React, { useState, useEffect } from 'react';
import * as PropertyEditors from '../PropertyEditors';

function CalendarEditor({ selectedComp, onUpdate }) {
  const {
    weddingDate = '',
    title = '',
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
      <PropertyEditors.TextEditor
        label="달력 제목"
        value={title}
        onChange={(value) => handlePropChange('title', value)}
        placeholder="우리의 결혼식"
      />
      <PropertyEditors.DateEditor
        label="결혼식 날짜"
        value={weddingDate}
        onChange={(value) => handlePropChange('weddingDate', value)}
      />
      <PropertyEditors.ColorPaletteEditor
        label="Highlight Color"
        value={highlightColor}
        onChange={(value) => handlePropChange('highlightColor', value)}
      />
      <PropertyEditors.BorderEditor
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