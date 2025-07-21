import React, { useCallback, useState, useEffect } from 'react';
import { ColorEditor, BorderEditor } from '../PropertyEditors';

/**
 * RectangleLayerEditor - 사각형 레이어 컴포넌트 속성 에디터
 * 
 * 기능:
 * - 배경색 설정
 * - 테두리 표시 여부 및 색상 설정
 * - 모서리 둥글기 설정
 */
function RectangleLayerEditor({ selectedComp, onUpdate }) {
  // 테두리 상태 관리
  const [localNoBorder, setLocalNoBorder] = useState(selectedComp.props?.noBorder !== false);
  
  // 테두리 상태 동기화
  useEffect(() => {
    setLocalNoBorder(selectedComp.props?.noBorder !== false);
  }, [selectedComp.props?.noBorder]);
  
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
    
    // noBorder가 변경되면 그냥 업데이트
    if (propKey === 'noBorder') {
      setLocalNoBorder(value);
    }
  }, [selectedComp, onUpdate]);

  return (
    <div>
      <ColorEditor
        value={selectedComp.props?.backgroundColor || '#f0f0f0'}
        onChange={(value) => updateProperty('backgroundColor', value)}
        label="배경색"
      />
      
      <BorderEditor
        noBorder={localNoBorder}
        borderColor={selectedComp.props?.borderColor || '#d1d5db'}
        borderWidth={selectedComp.props?.borderWidth || '1px'}
        borderRadius={selectedComp.props?.borderRadius || 0}
        onChange={updateProperty}
      />
    </div>
  );
}

export default RectangleLayerEditor;