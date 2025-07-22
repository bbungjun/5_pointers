import React, { useCallback, useMemo } from 'react';
import {
  TextEditor,
  NumberEditor,
  ColorEditor,
  FontFamilyEditor,
  TextAlignEditor,
  LineHeightEditor,
  LetterSpacingEditor,
  TextStyleEditor,
} from '../PropertyEditors';
import { debounceKorean } from '../../../utils/debounce';

function TextComponentEditor({ selectedComp, onUpdate }) {
  // 속성 업데이트 함수
  const updateProperty = useCallback(
    (propKey, value) => {
      console.log('📝 TextComponentEditor - 속성 업데이트:', {
        propKey,
        oldValue: selectedComp.props?.[propKey],
        newValue: value,
        componentId: selectedComp.id,
      });

      const updatedComp = {
        ...selectedComp,
        props: {
          ...(selectedComp.props || {}),
          [propKey]: value,
        },
      };
      onUpdate(updatedComp);
    },
    [selectedComp, onUpdate]
  );

  // 텍스트 업데이트를 위한 함수 (디바운스 제거)
  const updateTextProperty = useCallback(
    (value) => updateProperty('text', value),
    [updateProperty]
  );

  return (
    <div>
      {/* 텍스트 전용 에디터들 */}
      <TextEditor
        value={selectedComp.props?.text || ''}
        onChange={updateTextProperty}
        label="내용"
        placeholder="텍스트 내용을 입력하세요"
      />

      <NumberEditor
        value={selectedComp.props?.fontSize || 20}
        onChange={(value) => updateProperty('fontSize', value)}
        label="글자 크기"
        min={8}
        max={300}
        suffix="px"
      />

      {/* 폰트 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div
        style={{
          fontSize: 12,
          color: '#65676b',
          fontWeight: 600,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Typography
      </div>

      <FontFamilyEditor
        value={selectedComp.props?.fontFamily || 'Playfair Display'}
        onChange={(value) => updateProperty('fontFamily', value)}
        label="글꼴"
      />

      <TextAlignEditor
        value={selectedComp.props?.textAlign || 'center'}
        onChange={(value) => updateProperty('textAlign', value)}
        label="텍스트 정렬"
      />

      <LineHeightEditor
        value={selectedComp.props?.lineHeight || 1.2}
        onChange={(value) => updateProperty('lineHeight', value)}
        label="줄 간격"
      />

      <LetterSpacingEditor
        value={selectedComp.props?.letterSpacing || 0}
        onChange={(value) => updateProperty('letterSpacing', value)}
        label="글자 간격"
      />

      <TextStyleEditor
        label="스타일"
        boldValue={selectedComp.props?.fontWeight || false}
        italicValue={selectedComp.props?.fontStyle || false}
        underlineValue={selectedComp.props?.textDecoration || false}
        onBoldChange={(value) => updateProperty('fontWeight', value)}
        onItalicChange={(value) => updateProperty('fontStyle', value)}
        onUnderlineChange={(value) => updateProperty('textDecoration', value)}
      />

      {/* 색상 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div
        style={{
          fontSize: 12,
          color: '#65676b',
          fontWeight: 600,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Colors
      </div>

      <ColorEditor
        value={selectedComp.props?.color || '#222'}
        onChange={(value) => updateProperty('color', value)}
        label="글자 색상"
      />
    </div>
  );
}

export default TextComponentEditor;
