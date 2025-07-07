import React, { useState, useEffect } from 'react';
import {
  TextEditor,
  TextAreaEditor,
  ThumbnailEditor,
  ColorEditor,
  NumberEditor,
  SelectEditor
} from '../PropertyEditors';

const PageEditor = ({ selectedComp, onUpdate }) => {
  const [pageName, setPageName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  // 컴포넌트 props 초기화
  useEffect(() => {
    if (selectedComp && selectedComp.props) {
      setPageName(selectedComp.props.pageName !== undefined ? selectedComp.props.pageName : '새 페이지');
      setDescription(selectedComp.props.description || '');
      setThumbnail(selectedComp.props.thumbnail || '');
    }
  }, [selectedComp]);

  const updateProperty = (key, value) => {
    const updatedComponent = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [key]: value
      }
    };
    onUpdate(updatedComponent);
  };

  const handlePageNameChange = (value) => {
    setPageName(value);
    updateProperty('pageName', value);
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    updateProperty('description', value);
  };

  const handleThumbnailChange = (value) => {
    setThumbnail(value);
    updateProperty('thumbnail', value);
  };

  const createNewPage = async () => {
    const parentPageId = window.location.pathname.split('/').pop();
    
    try {
      const requestData = {
        parentPageId: parentPageId,
        componentId: selectedComp.id,
        pageName: pageName
      };
      
      const response = await fetch('http://localhost:3000/users/pages/create-from-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // 컴포넌트에 연결 정보 추가
        updateProperty('linkedPageId', result.page.id);
        updateProperty('deployedUrl', `http://localhost:5174/editor/${result.page.id}`);
        
        alert(`🎉 새 페이지 "${result.page.title}"가 생성되었습니다!`);
      } else {
        const errorText = await response.text();
        alert(`❌ 페이지 생성에 실패했습니다.\n상태: ${response.status}`);
      }
    } catch (error) {
      alert(`❌ 네트워크 오류가 발생했습니다.\n오류: ${error.message}`);
    }
  };

  const openLinkedPage = () => {
    const linkedPageId = selectedComp.props?.linkedPageId;
    
    if (linkedPageId) {
      const url = `http://localhost:5174/editor/${linkedPageId}`;
      window.open(url, '_blank');
    } else {
      alert('⚠️ 연결된 페이지가 없습니다. 먼저 "새 페이지 생성" 버튼을 클릭하세요.');
    }
  };

  // 현재 상태 확인
  const linkedPageId = selectedComp.props?.linkedPageId;
  const isConnected = !!linkedPageId;

  // 테두리 두께 옵션
  const borderWidthOptions = [
    { value: '0px', label: '없음' },
    { value: '1px', label: '1px' },
    { value: '2px', label: '2px' },
    { value: '3px', label: '3px' },
    { value: '4px', label: '4px' }
  ];

  return (
    <div>
      {/* 페이지 설정 섹션 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Page Content
      </div>

      <TextEditor
        value={pageName}
        onChange={handlePageNameChange}
        label="페이지 이름"
        placeholder="새 페이지"
      />

      <TextAreaEditor
        value={description}
        onChange={handleDescriptionChange}
        label="설명"
        placeholder="페이지 설명을 입력하세요"
        rows={2}
      />

      <ThumbnailEditor
        value={thumbnail}
        onChange={handleThumbnailChange}
        label="썸네일 이미지"
      />

      {/* 연결 상태 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Connection Status
      </div>

      <div style={{ 
        marginBottom: 16,
        padding: 12,
        backgroundColor: isConnected ? '#f0f9ff' : '#fef2f2',
        borderRadius: 6,
        border: `1px solid ${isConnected ? '#bfdbfe' : '#fecaca'}`
      }}>
        <div style={{ 
          fontSize: 13,
          fontWeight: 600,
          color: isConnected ? '#1e40af' : '#dc2626',
          marginBottom: 4
        }}>
          {isConnected ? '🔗 연결됨' : '❌ 미연결'}
        </div>
        {isConnected ? (
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            페이지 ID: {linkedPageId}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            아직 연결된 페이지가 없습니다.
          </div>
        )}
      </div>

      {/* 액션 버튼들 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={createNewPage}
          disabled={isConnected}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: isConnected ? '#f3f4f6' : '#10b981',
            color: isConnected ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: 6,
            cursor: isConnected ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isConnected) {
              e.target.style.backgroundColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (!isConnected) {
              e.target.style.backgroundColor = '#10b981';
            }
          }}
        >
          {isConnected ? '✅ 페이지 생성 완료' : '🆕 새 페이지 생성'}
        </button>
        
        <button
          onClick={openLinkedPage}
          disabled={!isConnected}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: isConnected ? '#3b82f6' : '#f3f4f6',
            color: isConnected ? 'white' : '#9ca3af',
            border: 'none',
            borderRadius: 6,
            cursor: isConnected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (isConnected) {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (isConnected) {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          🚀 연결된 페이지 열기
        </button>
      </div>

      {/* 스타일 설정 섹션 */}
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

      <NumberEditor
        value={parseInt(selectedComp.props?.titleFontSize?.replace('px', '')) || 10}
        onChange={(value) => updateProperty('titleFontSize', `${value}px`)}
        label="페이지 이름 크기"
        min={4}
        max={32}
        suffix="px"
      />

      <NumberEditor
        value={parseInt(selectedComp.props?.descriptionFontSize?.replace('px', '')) || 8}
        onChange={(value) => updateProperty('descriptionFontSize', `${value}px`)}
        label="설명 텍스트 크기"
        min={4}
        max={24}
        suffix="px"
      />

      {/* 색상 설정 섹션 */}
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
        value={selectedComp.props?.thumbnailBackgroundColor || '#f8f9fa'}
        onChange={(value) => updateProperty('thumbnailBackgroundColor', value)}
        label="썸네일 영역 배경색"
      />

      <ColorEditor
        value={selectedComp.props?.textBackgroundColor || '#ffffff'}
        onChange={(value) => updateProperty('textBackgroundColor', value)}
        label="텍스트 영역 배경색"
      />

      <ColorEditor
        value={selectedComp.props?.textColor || '#333333'}
        onChange={(value) => updateProperty('textColor', value)}
        label="텍스트 색상"
      />

      {/* 테두리 설정 섹션 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        Border
      </div>

      <ColorEditor
        value={selectedComp.props?.borderColor || '#007bff'}
        onChange={(value) => updateProperty('borderColor', value)}
        label="테두리 색상"
      />

      <SelectEditor
        value={selectedComp.props?.borderWidth || '2px'}
        onChange={(value) => updateProperty('borderWidth', value)}
        label="테두리 두께"
        options={borderWidthOptions}
      />

      <NumberEditor
        value={parseInt(selectedComp.props?.borderRadius?.replace('px', '')) || 8}
        onChange={(value) => updateProperty('borderRadius', `${value}px`)}
        label="모서리 둥글기"
        min={0}
        max={50}
        suffix="px"
      />
    </div>
  );
};

export default PageEditor;
