import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config.js';
import {
  TextEditor,
  TextAreaEditor,
  ThumbnailEditor,
  ColorEditor,
  NumberEditor,
  SelectEditor,
  FontFamilyEditor,
  BorderEditor
} from '../PropertyEditors';

const PageButtonEditor = ({ selectedComp, onUpdate }) => {
  const [localProps, setLocalProps] = useState(selectedComp.props || {});
  const [noBackground, setNoBackground] = useState(!!selectedComp.props?.noBackground);

  useEffect(() => {
    if (selectedComp && selectedComp.props) {
      setLocalProps(selectedComp.props);
      setNoBackground(!!selectedComp.props.noBackground);
    }
  }, [selectedComp]);

  const updateProperty = (key, value) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    const updatedComponent = {
      ...selectedComp,
      props: newProps
    };
    onUpdate(updatedComponent);
  };

  // 썸네일 업로드 (PageButton도 썸네일 지원하려면)
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

  // 스타일 섹션 내에 추가
  const handleNoBorderChange = (checked) => {
    updateProperty('noBorder', checked);
    if (checked) {
      updateProperty('borderWidth', '0px');
      updateProperty('borderColor', 'transparent');
      updateProperty('borderRadius', 0); // 테두리 제거 시 둥글기도 0
    } else {
      updateProperty('borderWidth', '2px'); // 기본값
      updateProperty('borderColor', '#007bff'); // 기본값
      updateProperty('borderRadius', 0); // 체크 해제 시에도 0으로 고정
    }
  };


  const regenerateAutoThumbnail = () => {
    updateProperty('thumbnailType', 'auto');
    updateProperty('thumbnail', '');
  };

  // 배경색 체크박스 핸들러
  const handleNoBackgroundChange = (e) => {
    const checked = e.target.checked;
    setNoBackground(checked);
    if (checked) {
      updateProperty('backgroundColor', 'transparent');
      updateProperty('noBackground', true);
    } else {
      updateProperty('backgroundColor', '#007bff'); // 기본값 또는 이전값 복원
      updateProperty('noBackground', false);
    }
  };

  // 연결 상태 확인
  const isConnected = !!(localProps.linkedPageId);

  return (
    <div className="page-button-editor">
      <h3>🔗 Page Button 컴포넌트 설정</h3>

      {/* 기본 정보 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: 0
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>기본 정보</h4>
        <TextEditor
          value={localProps.buttonText !== undefined ? localProps.buttonText : '페이지 이동'}
          onChange={value => updateProperty('buttonText', value)}
          label="버튼 이름"
          placeholder="버튼에 표시될 텍스트를 입력하세요"
        />
        <TextEditor
          value={localProps.icon !== undefined ? localProps.icon : '📄'}
          onChange={value => updateProperty('icon', value)}
          label="아이콘(이모지)"
          placeholder="예: 📄"
        />
        <TextAreaEditor
          value={localProps.description || ''}
          onChange={value => updateProperty('description', value)}
          label="버튼 설명"
          placeholder="버튼에 대한 설명을 입력하세요"
        />
      </div>

      {/* 썸네일 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: 0
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
        borderRadius: 0
      }}>
        <h4 style={{ marginBottom: '12px', color: '#495057' }}>스타일 설정</h4>
        {/* 배경색 체크박스 */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={noBackground}
              onChange={handleNoBackgroundChange}
              style={{ accentColor: '#007bff' }}
            />
            배경색 제거
          </label>
        </div>
        {/* 배경색 ColorEditor만 조건부로 */}
        {!noBackground && (
          <ColorEditor
            value={localProps.backgroundColor || '#007bff'}
            onChange={value => updateProperty('backgroundColor', value)}
            label="버튼 배경색"
          />
        )}
        <ColorEditor
          value={localProps.textColor || '#ffffff'}
          onChange={value => updateProperty('textColor', value)}
          label="텍스트 색상"
        />

        {/* 테두리 옵션 - BorderEditor로 통합 */}
        <BorderEditor
          noBorder={localProps.noBorder !== undefined ? localProps.noBorder : true}
          borderColor={localProps.borderColor || '#007bff'}
          borderWidth={localProps.borderWidth || '2px'}
          borderRadius={localProps.borderRadius !== undefined ? localProps.borderRadius : 0}
          onChange={updateProperty}
          onNoBorderChange={handleNoBorderChange}
        />

        <NumberEditor
          value={parseInt(localProps.fontSize) || 16}
          onChange={value => updateProperty('fontSize', value)}
          label="폰트 크기"
          min={8}
          max={32}
          suffix="px"
        />
        <FontFamilyEditor
          value={localProps.fontFamily || 'Pretendard, Noto Sans KR, sans-serif'}
          onChange={value => updateProperty('fontFamily', value)}
          label="폰트 스타일"
        />
        <SelectEditor
          value={localProps.fontWeight || '600'}
          onChange={value => updateProperty('fontWeight', value)}
          label="폰트 굵기"
          options={[
            { value: '400', label: '400' },
            { value: '500', label: '500' },
            { value: '600', label: '600' },
            { value: '700', label: '700' }
          ]}
        />
      </div>

      {/* 연결 정보 섹션 */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
        borderRadius: 0
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
            Page Button 컴포넌트를 드래그 앤 드롭하면 자동으로 새 페이지가 생성됩니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default PageButtonEditor;