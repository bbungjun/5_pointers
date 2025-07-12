import React from 'react';
import { 
  TextEditor,
  NumberEditor,
  ImageSourceEditor,
  ObjectFitEditor,
  BorderRadiusEditor,
  SelectEditor
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

      {/* 특수효과 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Wedding Effects
      </div>

      <SelectEditor
        value={selectedComp.props?.weddingEffect || 'none'}
        onChange={(value) => updateProperty('weddingEffect', value)}
        label="웨딩 특수효과"
        options={[
          { value: 'none', label: '없음' },
          { value: 'falling-snow', label: '눈내리기 ❄️' },
          { value: 'falling-petals', label: '꽃잎 떨어지기 🌸' },
          { value: 'floating-hearts', label: '떠다니는 하트 ❤️' },
          { value: 'sparkle-stars', label: '반짝이는 별 ✨' },
          { value: 'golden-particles', label: '골든 파티클 ✨' },
          { value: 'butterfly-dance', label: '나비 노래 🦋' },
          { value: 'romantic-bubbles', label: '로맨틱 버블 🥰' },
          { value: 'light-rays', label: '빛 줄기 ✨' }
        ]}
      />

      <NumberEditor
        value={selectedComp.props?.effectIntensity || 50}
        onChange={(value) => updateProperty('effectIntensity', value)}
        label="효과 강도"
        min={0}
        max={100}
        suffix="%"
      />
    </div>
  );
}

export default ImageEditor;
