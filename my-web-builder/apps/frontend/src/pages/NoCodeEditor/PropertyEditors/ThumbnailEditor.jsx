import React, { useState, useRef } from 'react';

function ThumbnailEditor({ label, value, onChange }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  // 파일 업로드 처리
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/users/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`업로드 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        onChange(result.imageUrl);
        setUrlInput(result.imageUrl);
        console.log('썸네일 업로드 성공:', result);
      } else {
        throw new Error('서버에서 업로드 실패 응답');
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ 
        display: 'block',
        fontSize: 13, 
        color: '#333', 
        fontWeight: 500,
        marginBottom: 8
      }}>
        {label}
      </label>

      {/* 탭 버튼 */}
      <div style={{ display: 'flex', marginBottom: 12, borderBottom: '1px solid #e5e7eb' }}>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'upload' ? '#3b82f6' : 'transparent',
            color: activeTab === 'upload' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
            fontSize: '12px',
          }}
        >
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeTab === 'url' ? '#3b82f6' : 'transparent',
            color: activeTab === 'url' ? 'white' : '#6b7280',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0',
            fontSize: '12px',
          }}
        >
          URL 입력
        </button>
      </div>

      {/* 파일 업로드 탭 */}
      {activeTab === 'upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px dashed #d1d5db',
              borderRadius: '6px',
              background: isUploading ? '#f9fafb' : '#ffffff',
              color: isUploading ? '#6b7280' : '#374151',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#f8fafc';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.background = '#ffffff';
              }
            }}
          >
            {isUploading ? '업로드 중...' : '📁 파일 선택 (최대 5MB)'}
          </button>
        </div>
      )}

      {/* URL 입력 탭 */}
      {activeTab === 'url' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleUrlKeyPress}
            placeholder="이미지 URL을 입력하세요"
            style={{
              flex: 1,
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
          <button
            type="button"
            onClick={handleUrlSubmit}
            style={{
              padding: '8px 16px',
              fontSize: 14,
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            적용
          </button>
        </div>
      )}

      {/* 썸네일 미리보기 */}
      {value && (
        <div style={{ 
          marginTop: 12,
          padding: 8,
          border: '1px solid #eee',
          borderRadius: 6,
          backgroundColor: '#f9f9f9'
        }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>미리보기:</div>
          <div style={{
            width: '60px',
            height: '36px',
            border: '1px solid #ddd',
            borderRadius: 4,
            overflow: 'hidden',
            backgroundColor: '#fff',
            position: 'relative'
          }}>
            <img 
              src={value} 
              alt="썸네일 미리보기"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
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
  );
}

export default ThumbnailEditor;
