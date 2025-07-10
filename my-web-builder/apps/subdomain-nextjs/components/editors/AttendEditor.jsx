import React from 'react';
import { TextEditor, NumberEditor, ColorEditor } from '../PropertyEditors';

function AttendEditor({ selectedComp, onUpdate }) {
  const updateProperty = (propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...(selectedComp.props || {}),
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
  };

  return (
    <div>


      <TextEditor
        value={selectedComp.props?.title || ''}
        onChange={(value) => updateProperty('title', value)}
        label="제목"
        placeholder="참석 여부 제목을 입력하세요"
      />

      <TextEditor
        value={selectedComp.props?.description || ''}
        onChange={(value) => updateProperty('description', value)}
        label="설명"
        placeholder="참석자에게 보여줄 설명을 입력하세요"
      />

      <TextEditor
        value={selectedComp.props?.buttonText || ''}
        onChange={(value) => updateProperty('buttonText', value)}
        label="버튼 텍스트"
        placeholder="참석 버튼에 표시될 텍스트"
      />

      <NumberEditor
        value={selectedComp.props?.maxAttendees || 500}
        onChange={(value) => updateProperty('maxAttendees', value)}
        label="최대 참석자 수"
        min={1}
        max={1000}
        suffix="명"
      />

      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Colors
      </div>

      <ColorEditor
        value={selectedComp.props?.backgroundColor || '#f8f9fa'}
        onChange={(value) => updateProperty('backgroundColor', value)}
        label="배경색"
      />

      <ColorEditor
        value={selectedComp.props?.buttonColor || '#28a745'}
        onChange={(value) => updateProperty('buttonColor', value)}
        label="버튼 색상"
      />
    </div>
  );
}

export default AttendEditor; 