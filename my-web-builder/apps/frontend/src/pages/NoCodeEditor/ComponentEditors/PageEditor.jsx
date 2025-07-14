import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config.js';
import {
  TextEditor,
  TextAreaEditor,
  ThumbnailEditor,
  ColorEditor,
  NumberEditor,
  SelectEditor
} from '../PropertyEditors';
import BorderEditor from '../PropertyEditors/BorderEditor';

const PageEditor = ({ selectedComp, onUpdate }) => {
  const [localProps, setLocalProps] = useState(selectedComp.props || {});
  const [noBorder, setNoBorder] = useState(
    selectedComp.props?.noBorder !== undefined ? !!selectedComp.props.noBorder : true
  );

  useEffect(() => {
    if (selectedComp && selectedComp.props) {
      setLocalProps(selectedComp.props);
      setNoBorder(selectedComp.props.noBorder !== undefined ? !!selectedComp.props.noBorder : true);
    }
  }, [selectedComp]);

  const updateProperty = (key, value) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    if (key === 'noBorder') setNoBorder(!!value);
    const updatedComponent = {
      ...selectedComp,
      props: newProps
    };
    onUpdate(updatedComponent);
  };

  // 테두리 제거 체크박스 핸들러 (BorderEditor에서 직접 처리 가능)
  const handleNoBorderChange = (checked) => {
    setNoBorder(checked);
    updateProperty('noBorder', checked);
    if (checked) {
      updateProperty('borderWidth', '0px');
      updateProperty('borderColor', 'transparent');
      updateProperty('borderRadius', 0);
    } else {
      updateProperty('borderWidth', localProps.borderWidth || '2px');
      updateProperty('borderColor', localProps.borderColor || '#007bff');
      updateProperty('borderRadius', localProps.borderRadius !== undefined ? localProps.borderRadius : 8);
    }
  };

  const handleThumbnailUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        updateProperty('thumbnail', result.url);
        updateProperty('thumbnailType', 'upload');
      }
    } catch (error) {
      console.error('썸네일 업로드 실패:', error);
    }
  };

  const regenerateAutoThumbnail = () => {
    updateProperty('thumbnailType', 'auto');
    updateProperty('thumbnail', '');
  };

  const isConnected = !!(localProps.linkedPageId);

  return (
    <div className="page-editor">
      <h3>📄 Page 컴포넌트 설정</h3>
      {/* 기본 정보 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: 0
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>기본 정보</h4>
        <TextEditor
          value={localProps.pageName || '새 페이지'}
          onChange={value => updateProperty('pageName', value)}
          label="페이지 이름"
          placeholder="페이지 이름을 입력하세요"
        />
        <TextAreaEditor
          value={localProps.description || ''}
          onChange={value => updateProperty('description', value)}
          label="페이지 설명"
          placeholder="페이지에 대한 간단한 설명을 입력하세요"
        />
      </div>
      {/* 썸네일 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>썸네일 설정</h4>
        <SelectEditor
          value={localProps.thumbnailType || 'auto'}
          onChange={value => updateProperty('thumbnailType', value)}
          label="썸네일 타입"
          options={[
            { value: 'auto', label: '자동 생성' },
            { value: 'upload', label: '직접 업로드' },
            { value: 'none', label: '썸네일 없음' }
          ]}
        />
        {localProps.thumbnailType === 'upload' && (
          <ThumbnailEditor
            currentThumbnail={localProps.thumbnail}
            onThumbnailChange={handleThumbnailUpload}
            label="썸네일 이미지"
          />
        )}
        {localProps.thumbnailType === 'auto' && (
          <button
            onClick={regenerateAutoThumbnail}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 자동 썸네일 재생성
          </button>
        )}
      </div>
      {/* 스타일 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>스타일 설정</h4>
        {/* BorderEditor로 테두리 옵션 통합 */}
        <BorderEditor
          noBorder={localProps.noBorder !== undefined ? localProps.noBorder : true}
          borderColor={localProps.borderColor || '#007bff'}
          borderWidth={localProps.borderWidth || '2px'}
          borderRadius={localProps.borderRadius !== undefined ? localProps.borderRadius : 8}
          onChange={updateProperty}
          onNoBorderChange={handleNoBorderChange}
        />
        <ColorEditor
          value={localProps.backgroundColor || '#ffffff'}
          onChange={value => updateProperty('backgroundColor', value)}
          label="배경색"
        />
        <ColorEditor
          value={localProps.textColor || '#333333'}
          onChange={value => updateProperty('textColor', value)}
          label="텍스트 색상"
        />
        <NumberEditor
          value={parseInt(localProps.fontSize) || 14}
          onChange={value => updateProperty('fontSize', value)}
          label="폰트 크기"
          min={8}
          max={32}
          suffix="px"
        />
        <SelectEditor
          value={localProps.fontWeight || '500'}
          onChange={value => updateProperty('fontWeight', value)}
          label="폰트 굵기"
          options={[
            { value: '400', label: 'Normal' },
            { value: '500', label: 'Medium' },
            { value: '600', label: 'Semi Bold' },
            { value: '700', label: 'Bold' }
          ]}
        />
      </div>
      {/* 연결 정보 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        borderRadius: '8px'
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>연결 정보</h4>
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            padding: '8px 12px',
            borderRadius: '4px',
            backgroundColor: isConnected ? '#155724' : '#721c24',
            color: 'white',
            marginBottom: '8px'
          }}>
            {isConnected ? '✅ 페이지 연결됨' : '⚠️ 페이지가 연결되지 않음'}
          </div>
          {isConnected && (
            <button
              onClick={() => {
                const url = localProps.deployedUrl || `/editor/${localProps.linkedPageId}`;
                window.open(url, '_blank');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔗 연결된 페이지 열기
            </button>
          )}
        </div>
        {!isConnected && (
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            Page 컴포넌트를 드래그 앤 드롭하면 자동으로 새 페이지가 생성됩니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default PageEditor;