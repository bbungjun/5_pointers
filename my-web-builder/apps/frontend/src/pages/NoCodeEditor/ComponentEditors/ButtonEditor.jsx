import React from 'react';
import { 
  TextEditor, 
  NumberEditor, 
  ColorEditor, 
  ColorPaletteEditor,
  FontFamilyEditor, 
  TextAlignEditor,
  LineHeightEditor,
  LetterSpacingEditor,
  TextStyleEditor
} from '../PropertyEditors';

function ButtonEditor({ selectedComp, onUpdate }) {
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


      {/* 텍스트 섹션 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Text
      </div>

      <TextEditor
        value={selectedComp.props?.text || ''}
        onChange={(value) => updateProperty('text', value)}
        label="버튼명"
        placeholder="버튼 텍스트를 입력하세요"
      />

      <NumberEditor
        value={selectedComp.props?.fontSize || 18}
        onChange={(value) => updateProperty('fontSize', value)}
        label="글자 크기"
        min={8}
        max={72}
        suffix="px"
      />

      <FontFamilyEditor
        value={selectedComp.props?.fontFamily || 'Arial, sans-serif'}
        onChange={(value) => updateProperty('fontFamily', value)}
        label="폰트"
      />

      <TextStyleEditor
        label="텍스트 스타일"
        boldValue={selectedComp.props?.fontWeight || false}
        italicValue={selectedComp.props?.fontStyle || false}
        underlineValue={selectedComp.props?.textDecoration || false}
        onBoldChange={(value) => updateProperty('fontWeight', value)}
        onItalicChange={(value) => updateProperty('fontStyle', value)}
        onUnderlineChange={(value) => updateProperty('textDecoration', value)}
        currentFont={selectedComp.props?.fontFamily || 'Arial, sans-serif'}
      />

      <LineHeightEditor
        value={selectedComp.props?.lineHeight || 1.2}
        onChange={(value) => updateProperty('lineHeight', value)}
        label="줄간격"
      />

      <LetterSpacingEditor
        value={selectedComp.props?.letterSpacing || 0}
        onChange={(value) => updateProperty('letterSpacing', value)}
        label="글자간격"
      />

      <TextAlignEditor
        value={selectedComp.props?.textAlign || 'center'}
        onChange={(value) => updateProperty('textAlign', value)}
        label="텍스트 정렬"
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
        value={selectedComp.props?.color || '#fff'}
        onChange={(value) => updateProperty('color', value)}
        label="글자 색상"
      />

      <ColorPaletteEditor
        value={selectedComp.props?.bg || '#D8BFD8'}
        onChange={(value) => updateProperty('bg', value)}
        label="배경색"
      />
    </div>
  );
}

export default ButtonEditor;
