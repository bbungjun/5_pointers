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
      {/* 텍스트 섹션 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Content
      </div>

      <TextEditor
        value={selectedComp.props?.title || ''}
        onChange={(value) => updateProperty('title', value)}
        label="제목"
        placeholder="참석 여부 제목을 입력하세요"
      />

      <NumberEditor
        value={selectedComp.props?.titleFontSize || 24}
        onChange={(value) => updateProperty('titleFontSize', value)}
        label="제목 글자 크기"
        min={12}
        max={48}
        suffix="px"
      />

      <TextEditor
        value={selectedComp.props?.description || ''}
        onChange={(value) => updateProperty('description', value)}
        label="설명"
        placeholder="참석자에게 보여줄 설명을 입력하세요"
      />

      <NumberEditor
        value={selectedComp.props?.descriptionFontSize || 16}
        onChange={(value) => updateProperty('descriptionFontSize', value)}
        label="설명 글자 크기"
        min={12}
        max={32}
        suffix="px"
      />

      <TextEditor
        value={selectedComp.props?.buttonText || ''}
        onChange={(value) => updateProperty('buttonText', value)}
        label="버튼 텍스트"
        placeholder="참석 버튼에 표시될 텍스트"
      />

      <NumberEditor
        value={selectedComp.props?.buttonFontSize || 18}
        onChange={(value) => updateProperty('buttonFontSize', value)}
        label="버튼 글자 크기"
        min={12}
        max={32}
        suffix="px"
      />

      {/* 폰트 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Typography
      </div>

      <FontFamilyEditor
        value={selectedComp.props?.fontFamily || 'Playfair Display, serif'}
        onChange={(value) => updateProperty('fontFamily', value)}
        label="글꼴"
      />

      <NumberEditor
        value={selectedComp.props?.maxAttendees || 500}
        onChange={(value) => updateProperty('maxAttendees', value)}
        label="최대 참석자 수"
        min={1}
        max={1000}
        suffix="명"
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
        value={selectedComp.props?.backgroundColor || '#faf9f7'}
        onChange={(value) => updateProperty('backgroundColor', value)}
        label="배경색"
      />

      <ColorEditor
        value={selectedComp.props?.titleColor || '#8b7355'}
        onChange={(value) => updateProperty('titleColor', value)}
        label="제목 색상"
      />

      <ColorEditor
        value={selectedComp.props?.descriptionColor || '#4a5568'}
        onChange={(value) => updateProperty('descriptionColor', value)}
        label="설명 색상"
      />

      <ColorPaletteEditor
        value={selectedComp.props?.buttonColor || '#8b7355'}
        onChange={(value) => updateProperty('buttonColor', value)}
        label="버튼 배경색"
      />

      <ColorEditor
        value={selectedComp.props?.buttonTextColor || 'white'}
        onChange={(value) => updateProperty('buttonTextColor', value)}
        label="버튼 글자 색상"
      />
    </div>
  );
}

export default AttendEditor; 