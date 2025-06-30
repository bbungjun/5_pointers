import React from 'react';
import { TextEditor } from '../PropertyEditors';

function MapInfoEditor({ selectedComp, onUpdate }) {
  const sections = selectedComp.props.sections || [];

  const updateProperty = (propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propKey]: value,
      },
    };
    onUpdate(updatedComp);
  };

  const updateSection = (index, key, value) => {
    const newSections = sections.map((section, idx) =>
      idx === index ? { ...section, [key]: value } : section
    );
    updateProperty('sections', newSections);
  };

  const handleAddSection = () => {
    updateProperty('sections', [...sections, { header: '', content: '' }]);
  };

  const handleRemoveSection = (index) => {
    const newSections = sections.filter((_, idx) => idx !== index);
    updateProperty('sections', newSections);
  };

  return (
    <div>
      {/* 상단 카드 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '8px 12px',
        backgroundColor: '#f0f2f5',
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>📍</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            장소 안내
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>

      {/* 섹션 목록 */}
      {sections.map((section, idx) => (
        <div
          key={idx}
          style={{
            border: '1px solid #ddd',
            padding: '12px',
            borderRadius: 6,
            marginBottom: 16,
            position: 'relative'
          }}
        >
          {/* 삭제 버튼 */}
          <button
            style={{
              position: 'absolute',
              top: 6,
              right: 8,
              border: 'none',
              background: 'transparent',
              color: '#888',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
            onClick={() => handleRemoveSection(idx)}
          >
            ×
          </button>

          {/* 제목 */}
          <TextEditor
            value={section.header}
            onChange={(value) => updateSection(idx, 'header', value)}
            label="제목"
            placeholder="지하철 안내"
          />

          {/* 내용 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
            <label style={{ fontSize: 12, color: '#333' }}>내용</label>
            <textarea
              value={section.content}
              onChange={(e) => updateSection(idx, 'content', e.target.value)}
              placeholder="안내 내용을 입력하세요"
              style={{
                width: '100%',
                minHeight: 80,
                padding: '6px 10px',
                border: '1px solid #ccc',
                borderRadius: 4,
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      ))}

      {/* 구분선 */}
      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

      {/* 추가 버튼 */}
      <button
        onClick={handleAddSection}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 6,
          background: '#f5f5f5',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500
        }}
      >
        + 섹션 추가
      </button>
    </div>
  );
}

export default MapInfoEditor;
