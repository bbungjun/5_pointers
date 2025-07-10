import React from 'react';
import { 
  TextEditor,
  NumberEditor,
  ImageSourceEditor,
  ObjectFitEditor,
  BorderRadiusEditor
} from '../PropertyEditors';

function ImageEditor({ selectedComp, onUpdate }) {
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


      {/* 이미지 소스 섹션 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Image Source
      </div>

      <ImageSourceEditor
        value={selectedComp.props?.src || ''}
        onChange={(value) => updateProperty('src', value)}
        label="이미지"
      />

      <TextEditor
        value={selectedComp.props?.alt || ''}
        onChange={(value) => updateProperty('alt', value)}
        label="대체 텍스트"
        placeholder="이미지 설명을 입력하세요"
      />

      {/* 크기 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Size
      </div>

      <NumberEditor
        value={selectedComp.props?.width || 200}
        onChange={(value) => updateProperty('width', value)}
        label="너비"
        min={10}
        max={1000}
        suffix="px"
      />

      <NumberEditor
        value={selectedComp.props?.height || 150}
        onChange={(value) => updateProperty('height', value)}
        label="높이"
        min={10}
        max={1000}
        suffix="px"
      />

      {/* 스타일 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Style
      </div>

      <ObjectFitEditor
        value={selectedComp.props?.objectFit || 'cover'}
        onChange={(value) => updateProperty('objectFit', value)}
        label="맞춤 방식"
      />

      <BorderRadiusEditor
        value={selectedComp.props?.borderRadius || 0}
        onChange={(value) => updateProperty('borderRadius', value)}
        label="모서리 둥글기"
        max={50}
      />
    </div>
  );
}

export default ImageEditor;
