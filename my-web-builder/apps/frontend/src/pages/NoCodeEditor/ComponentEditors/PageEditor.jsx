import React, { useState, useEffect } from 'react';
import TextEditor from '../PropertyEditors/TextEditor';
import ColorEditor from '../PropertyEditors/ColorEditor';
import NumberEditor from '../PropertyEditors/NumberEditor';

const PageEditor = ({ selectedComp, onUpdate }) => {
  const [pageName, setPageName] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  // 컴포넌트 props 초기화
  useEffect(() => {
    if (selectedComp && selectedComp.props) {
      setPageName(selectedComp.props.pageName || '새 페이지');
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

      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block',
          fontSize: 13, 
          color: '#333', 
          fontWeight: 500,
          marginBottom: 6
        }}>
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder="페이지 설명을 입력하세요"
          rows={2}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
      </div>

      {/* 썸네일 섹션 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block',
          fontSize: 13, 
          color: '#333', 
          fontWeight: 500,
          marginBottom: 6
        }}>
          썸네일 이미지
        </label>
        <input
          type="url"
          value={thumbnail}
          onChange={(e) => handleThumbnailChange(e.target.value)}
          placeholder="이미지 URL을 입력하세요 (예: https://example.com/image.jpg)"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        {thumbnail && (
          <div style={{ 
            marginTop: 8,
            padding: 8,
            border: '1px solid #eee',
            borderRadius: 6,
            backgroundColor: '#f9f9f9'
          }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>미리보기:</div>
            <div style={{
              width: '60px',
              height: '36px', // 6:4 비율 미리보기
              border: '1px solid #ddd',
              borderRadius: 4,
              overflow: 'hidden',
              backgroundColor: '#fff'
            }}>
              <img 
                src={thumbnail} 
                alt="썸네일 미리보기"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{
                display: 'none',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#999'
              }}>
                ❌ 로드 실패
              </div>
            </div>
          </div>
        )}
      </div>

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
        Appearance
      </div>

      <ColorEditor
        value={selectedComp.props?.backgroundColor || '#ffffff'}
        onChange={(value) => updateProperty('backgroundColor', value)}
        label="배경색"
      />

      <ColorEditor
        value={selectedComp.props?.textColor || '#333333'}
        onChange={(value) => updateProperty('textColor', value)}
        label="텍스트 색상"
      />

      <ColorEditor
        value={selectedComp.props?.borderColor || '#007bff'}
        onChange={(value) => updateProperty('borderColor', value)}
        label="테두리 색상"
      />

      <div style={{ marginBottom: 16 }}>
        <label style={{ 
          display: 'block',
          fontSize: 13, 
          color: '#333', 
          fontWeight: 500,
          marginBottom: 6
        }}>
          테두리 두께
        </label>
        <select
          value={selectedComp.props?.borderWidth || '2px'}
          onChange={(e) => updateProperty('borderWidth', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 6,
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#0066FF'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        >
          <option value="0px">없음</option>
          <option value="1px">1px</option>
          <option value="2px">2px</option>
          <option value="3px">3px</option>
          <option value="4px">4px</option>
        </select>
      </div>

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
