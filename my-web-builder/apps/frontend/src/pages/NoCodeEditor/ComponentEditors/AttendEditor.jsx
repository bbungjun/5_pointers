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

  const formType = selectedComp.props?.formType || 'wedding-attendance';
  
  // 폼 타입별 설정
  const formTypeConfig = {
    'wedding-attendance': {
      titlePlaceholder: '결혼식 참석 여부 확인',
      descriptionPlaceholder: '소중한 분들의 참석을 기다립니다',
      buttonPlaceholder: '참석 의사 전달',
      fields: '참석자 구분, 성함, 참석 인원, 연락처, 동행인 수, 식사여부'
    },
    'birthday-party': {
      titlePlaceholder: '생일파티 참석 여부 확인',
      descriptionPlaceholder: '즐거운 생일파티에 참석해주세요',
      buttonPlaceholder: '참석 의사 전달',
      fields: '참석자 성함, 연락처, 도착 예정시간'
    }
  };

  const currentConfig = formTypeConfig[formType];

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

      {/* 폼 타입 선택 */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontWeight: '500',
          fontSize: '14px',
          color: '#374151'
        }}>
          폼 타입
        </label>
        <select
          value={selectedComp.props?.formType || 'wedding-attendance'}
          onChange={(e) => updateProperty('formType', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            backgroundColor: 'white',
            color: '#374151'
          }}
        >
          <option value="wedding-attendance">결혼식 참석여부</option>
          <option value="birthday-party">생일파티 참석여부</option>
        </select>
        
        {/* 선택된 폼 타입 정보 */}
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <strong>수집 정보:</strong> {currentConfig.fields}
        </div>
      </div>

      <TextEditor
        value={selectedComp.props?.title || ''}
        onChange={(value) => updateProperty('title', value)}
        label="제목"
        placeholder={currentConfig.titlePlaceholder}
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
        placeholder={currentConfig.descriptionPlaceholder}
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
        placeholder={currentConfig.buttonPlaceholder}
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
        value={selectedComp.props?.buttonColor || '#9CAF88'}
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