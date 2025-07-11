import React from 'react';
import { TextEditor, NumberEditor, ColorEditor } from '../PropertyEditors';

function LinkEditor({ selectedComp, onUpdate }) {
  // 속성 업데이트 함수
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


      {/* 링크 전용 에디터들 */}
      <TextEditor
        value={selectedComp.props?.text || ''}
        onChange={(value) => updateProperty('text', value)}
        label="링크 텍스트"
        placeholder="링크 텍스트를 입력하세요"
      />

      <TextEditor
        value={selectedComp.props?.href || ''}
        onChange={(value) => updateProperty('href', value)}
        label="링크 URL"
        placeholder="https://example.com"
      />

      <NumberEditor
        value={selectedComp.props?.fontSize || 16}
        onChange={(value) => updateProperty('fontSize', value)}
        label="글자 크기"
        min={8}
        max={72}
        suffix="px"
      />

      {/* 색상 섹션 */}
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
        value={selectedComp.props?.color || '#D8BFD8'}
        onChange={(value) => updateProperty('color', value)}
        label="글자 색상"
      />
    </div>
  );
}

export default LinkEditor;
