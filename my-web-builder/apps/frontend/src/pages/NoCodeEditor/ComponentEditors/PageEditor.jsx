import React, { useState, useEffect } from 'react';
import TextEditor from '../PropertyEditors/TextEditor';
import ColorEditor from '../PropertyEditors/ColorEditor';
import TextStyleEditor from '../PropertyEditors/TextStyleEditor';
import BorderRadiusEditor from '../PropertyEditors/BorderRadiusEditor';
import ImageSourceEditor from '../PropertyEditors/ImageSourceEditor';
import { usePageNavigation } from '../hooks/usePageNavigation';

const PageEditor = ({ component, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('content');
  const { pages } = usePageNavigation();

  const handleChange = (key, value) => {
    onUpdate({
      ...component,
      props: {
        ...component.props,
        [key]: value
      }
    });
  };

  const handleTargetPageChange = (pageId) => {
    const targetPage = pages.find(page => page.id === pageId);
    if (targetPage) {
      onUpdate({
        ...component,
        props: {
          ...component.props,
          targetPageId: pageId,
          pageName: targetPage.name || component.props.pageName,
          deployedUrl: targetPage.deployUrl || component.props.deployedUrl
        }
      });
    }
  };

  const tabs = [
    { id: 'content', label: '내용', icon: '📝' },
    { id: 'style', label: '스타일', icon: '🎨' },
    { id: 'border', label: '테두리', icon: '🔲' },
    { id: 'advanced', label: '고급', icon: '⚙️' }
  ];

  return (
    <div className="page-editor">
      {/* 탭 네비게이션 */}
      <div className="editor-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {activeTab === 'content' && (
          <div className="content-tab">
            <div className="editor-section">
              <h4>📄 페이지 정보</h4>
              
              <TextEditor
                label="페이지 이름"
                value={component.props.pageName || '새 페이지'}
                onChange={(value) => handleChange('pageName', value)}
                placeholder="페이지 이름을 입력하세요"
              />
              
              <ImageSourceEditor
                label="썸네일 이미지"
                value={component.props.thumbnail || ''}
                onChange={(value) => handleChange('thumbnail', value)}
                placeholder="이미지 URL을 입력하세요"
                description="페이지를 대표하는 썸네일 이미지"
              />
            </div>
          </div>
        )}

        {activeTab === 'style' && (
          <div className="style-tab">
            <div className="editor-section">
              <h4>🎨 기본 스타일</h4>
              
              <ColorEditor
                label="배경색"
                value={component.props.backgroundColor || '#ffffff'}
                onChange={(value) => handleChange('backgroundColor', value)}
              />
              
              <ColorEditor
                label="텍스트 색상"
                value={component.props.textColor || '#333333'}
                onChange={(value) => handleChange('textColor', value)}
              />
              
              <TextStyleEditor
                label="글자 크기"
                value={component.props.fontSize || '16px'}
                onChange={(value) => handleChange('fontSize', value)}
                min="12px"
                max="32px"
                step="1px"
              />
              
              <TextStyleEditor
                label="글자 굵기"
                value={component.props.fontWeight || '500'}
                onChange={(value) => handleChange('fontWeight', value)}
                type="select"
                options={[
                  { value: '300', label: '얇게' },
                  { value: '400', label: '보통' },
                  { value: '500', label: '중간' },
                  { value: '600', label: '굵게' },
                  { value: '700', label: '매우 굵게' }
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'border' && (
          <div className="border-tab">
            <div className="editor-section">
              <h4>🔲 테두리 설정</h4>
              
              <div className="editor-row">
                <label>테두리 스타일</label>
                <select
                  value={component.props.borderStyle || 'solid'}
                  onChange={(e) => handleChange('borderStyle', e.target.value)}
                >
                  <option value="none">없음</option>
                  <option value="solid">실선</option>
                  <option value="dashed">점선</option>
                  <option value="dotted">점</option>
                </select>
              </div>
              
              <TextStyleEditor
                label="테두리 두께"
                value={component.props.borderWidth || '2px'}
                onChange={(value) => handleChange('borderWidth', value)}
                min="0px"
                max="10px"
                step="1px"
              />
              
              <ColorEditor
                label="테두리 색상"
                value={component.props.borderColor || '#007bff'}
                onChange={(value) => handleChange('borderColor', value)}
              />
              
              <BorderRadiusEditor
                label="모서리 둥글기"
                value={component.props.borderRadius || '8px'}
                onChange={(value) => handleChange('borderRadius', value)}
              />
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="advanced-tab">
            <div className="editor-section">
              <h4>⚙️ 고급 설정</h4>
              
              <div className="editor-row">
                <label>대상 페이지</label>
                <select
                  value={component.props.targetPageId || ''}
                  onChange={(e) => handleTargetPageChange(e.target.value)}
                >
                  <option value="">페이지를 선택하세요</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.name || `페이지 ${page.id.slice(-4)}`}
                    </option>
                  ))}
                </select>
              </div>
              
              {component.props.deployedUrl && (
                <div className="editor-row">
                  <label>배포 URL</label>
                  <div className="url-display">
                    <span className="url-text">{component.props.deployedUrl}</span>
                    <button
                      className="url-copy-btn"
                      onClick={() => navigator.clipboard.writeText(component.props.deployedUrl)}
                      title="URL 복사"
                    >
                      📋
                    </button>
                  </div>
                </div>
              )}
              
              <div className="editor-row">
                <label>컴포넌트 ID</label>
                <input
                  type="text"
                  value={component.id}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page-editor {
          padding: 16px;
        }
        
        .editor-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 16px;
        }
        
        .tab-button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          background-color: #f5f5f5;
        }
        
        .tab-button.active {
          background-color: #e3f2fd;
          border-bottom: 2px solid #2196f3;
        }
        
        .tab-icon {
          font-size: 16px;
        }
        
        .tab-label {
          font-size: 12px;
          font-weight: 500;
        }
        
        .tab-content {
          min-height: 300px;
        }
        
        .editor-section {
          margin-bottom: 24px;
        }
        
        .editor-section h4 {
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .editor-row {
          margin-bottom: 16px;
        }
        
        .editor-row label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }
        
        .editor-row select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .url-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .url-text {
          flex: 1;
          font-size: 12px;
          color: #666;
          word-break: break-all;
        }
        
        .url-copy-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .url-copy-btn:hover {
          background-color: #e9ecef;
        }
        
        .readonly-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background-color: #f8f9fa;
          color: #666;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PageEditor; 