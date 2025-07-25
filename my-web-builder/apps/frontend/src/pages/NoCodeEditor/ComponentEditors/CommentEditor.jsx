import React, { useState, useEffect } from 'react';
import {
  FontFamilyEditor,
  TextAlignEditor,
  LineHeightEditor,
  LetterSpacingEditor,
  TextStyleEditor,
  ColorEditor,
  SelectEditor,
  NumberEditor,
  BorderEditor,
  TextEditor,
} from '../PropertyEditors';

function CommentEditor({ selectedComp, onUpdate }) {
  const {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          제목
        </label>
        <TextEditor
          value={selectedComp.props.title || ''}
          onChange={(value) => handlePropChange('title', value)}
          placeholder="제목을 입력하세요"
        />
      </div>

      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          댓글 입력 안내 문구
        </label>
        <TextEditor
          value={selectedComp.props.placeholder || ''}
          onChange={(value) => handlePropChange('placeholder', value)}
          placeholder="안내 문구를 입력하세요"
        />
      </div>

      {/* 폰트 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{
        fontSize: 12,
        color: '#65676b',
        fontWeight: 600,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
      </div>

      <FontFamilyEditor
        value={selectedComp.props?.fontFamily || 'Playfair Display'}
        onChange={(value) => handlePropChange('fontFamily', value)}
        label="글꼴"
      />

      <TextAlignEditor
        value={selectedComp.props?.textAlign || 'left'}
        onChange={(value) => handlePropChange('textAlign', value)}
        label="텍스트 정렬"
      />

      <LineHeightEditor
        value={selectedComp.props?.lineHeight || 1.2}
        onChange={(value) => handlePropChange('lineHeight', value)}
        label="줄 간격"
      />

      <LetterSpacingEditor
        value={selectedComp.props?.letterSpacing || 0}
        onChange={(value) => handlePropChange('letterSpacing', value)}
        label="글자 간격"
      />

      <TextStyleEditor
        label="스타일"
        boldValue={!!selectedComp.props?.fontWeight}
        italicValue={!!selectedComp.props?.fontStyle}
        underlineValue={!!selectedComp.props?.textDecoration}
        onBoldChange={(v) => handlePropChange('fontWeight', v)}
        onItalicChange={(v) => handlePropChange('fontStyle', v)}
        onUnderlineChange={(v) => handlePropChange('textDecoration', v)}
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
        value={selectedComp.props?.color || '#1f2937'}
        onChange={(value) => handlePropChange('color', value)}
        label="텍스트 색상"
      />

      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          배경색
        </label>
        <input
          type="color"
          value={selectedComp.props.backgroundColor || '#ffffff'}
          onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
          style={{
            width: '100%', height: 40, border: '1px solid #ddd',
            borderRadius: 6, cursor: 'pointer'
          }}
        />
      </div>

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

export default CommentEditor;