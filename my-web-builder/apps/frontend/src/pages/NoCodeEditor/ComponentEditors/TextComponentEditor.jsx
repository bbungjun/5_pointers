import React, { useCallback, useMemo } from 'react';
import { TextEditor, NumberEditor, ColorEditor, FontFamilyEditor, TextAlignEditor, LineHeightEditor, LetterSpacingEditor, TextStyleEditor } from '../PropertyEditors';
import { debounceKorean } from '../../../utils/debounce';

function TextComponentEditor({ selectedComp, onUpdate }) {
  // 속성 업데이트 함수
  const updateProperty = useCallback((propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...(selectedComp.props || {}),
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
  }, [selectedComp, onUpdate]);

  // 텍스트 업데이트를 위한 최적화된 함수 (한글 입력 고려)
  const updateTextProperty = useMemo(() => {
    return debounceKorean((value) => updateProperty('text', value), 150);
  }, [updateProperty]);

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
        max={72}
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
        value={selectedComp.props?.fontFamily || 'Playfair Display'}
        onChange={(value) => updateProperty('fontFamily', value)}
        label="글꼴"
      />

      <TextAlignEditor
        value={selectedComp.props?.textAlign || 'left'}
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
        onBoldChange={value => updateProperty('fontWeight', value)}
        onItalicChange={value => updateProperty('fontStyle', value)}
        onUnderlineChange={value => updateProperty('textDecoration', value)}
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
        value={selectedComp.props?.color || '#222'}
        onChange={(value) => updateProperty('color', value)}
        label="글자 색상"
      />

      {/* 레이어 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{
        fontSize: 12,
        color: '#65676b',
        fontWeight: 600,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Layer
      </div>

      <NumberEditor
        value={selectedComp.props?.zIndex || 1000}
        onChange={(value) => updateProperty('zIndex', value)}
        label="레이어 순서"
        min={1}
        max={2000}
        suffix=""
        description="높은 숫자가 위에 표시됩니다 (텍스트는 기본 1000)"
      />
    </div>
  );
}

export default TextComponentEditor;
