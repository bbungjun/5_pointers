import React from 'react';
import * as PropertyEditors from '../PropertyEditors';

function CalendarEditor({ selectedComp, onUpdate }) {
  const handlePropChange = (propName, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propName]: value
      }
    });
  };

  return (
    <div>


      <PropertyEditors.DateEditor
        label="결혼식 날짜"
        value={selectedComp.props.weddingDate || ''}
        onChange={(value) => handlePropChange('weddingDate', value)}
      />
      
      <PropertyEditors.ColorEditor
        label="Highlight Color"
        value={selectedComp.props.highlightColor || '#ff6b9d'}
        onChange={(value) => handlePropChange('highlightColor', value)}
      />
    </div>
  );
}

export default CalendarEditor;