import React from 'react';
import { ComponentDefinitions } from '../components/definitions';
import * as PropertyEditors from './PropertyEditors';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
  // 속성 업데이트 함수
  const updateProperty = (propKey, value) => {
    if (!selectedComp) return;
    
    const updatedComp = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
  };

  // JSON 정의에서 에디터 타입 매핑
  const getEditorComponent = (fieldType) => {
    switch (fieldType) {
      case 'text':
        return PropertyEditors.TextEditor;
      case 'number':
        return PropertyEditors.NumberEditor;
      case 'color':
        return PropertyEditors.ColorEditor;
      default:
        console.warn(`Unknown field type: ${fieldType}`);
        return null;
    }
  };

  return (
    <div style={{
      width: 280,
      background: '#fff',
      borderLeft: '1px solid #e1e5e9',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 14,
          fontWeight: 600,
          color: '#1d2129',
          letterSpacing: '0.5px'
        }}>
          Properties
        </h3>
      </div>

      {/* 속성 영역 */}
      <div style={{ 
        flex: 1, 
        padding: '20px',
        overflowY: 'auto'
      }}>
        {selectedComp ? (
          <div>
            {/* 컴포넌트 정보 */}
            {(() => {
              const componentDef = ComponentDefinitions[selectedComp.type];
              if (!componentDef) {
                return (
                  <div style={{ color: 'red', marginBottom: 20 }}>
                    Unknown component type: {selectedComp.type}
                  </div>
                );
              }

              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 20,
                  padding: '8px 12px',
                  backgroundColor: '#f0f2f5',
                  borderRadius: 6
                }}>
                  <span style={{ fontSize: 16 }}>
                    {selectedComp.type === 'button' ? '🔘' : 
                     selectedComp.type === 'text' ? '📝' : 
                     selectedComp.type === 'link' ? '🔗' : '❓'}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
                      {componentDef.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#65676b' }}>
                      {selectedComp.id}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 동적 에디터 렌더링 */}
            {(() => {
              const componentDef = ComponentDefinitions[selectedComp.type];
              if (!componentDef || !componentDef.edit) {
                return (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#65676b',
                    fontSize: 14
                  }}>
                    No editors available for this component
                  </div>
                );
              }

              const editFields = Object.entries(componentDef.edit);
              let colorSectionAdded = false;

              return editFields.map(([propKey, fieldDef], index) => {
                const EditorComponent = getEditorComponent(fieldDef.type);
                
                if (!EditorComponent) {
                  return (
                    <div key={propKey} style={{ color: 'red', marginBottom: 8 }}>
                      Unknown editor type: {fieldDef.type}
                    </div>
                  );
                }

                // 색상 섹션 구분선 추가 (첫 번째 color 타입 전에)
                const showColorSection = fieldDef.type === 'color' && !colorSectionAdded;
                if (showColorSection) {
                  colorSectionAdded = true;
                }

                return (
                  <div key={propKey}>
                    {/* 색상 섹션 헤더 */}
                    {showColorSection && (
                      <>
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
                      </>
                    )}

                    <EditorComponent
                      value={selectedComp.props[propKey]}
                      onChange={(value) => updateProperty(propKey, value)}
                      label={fieldDef.label}
                      min={fieldDef.min}
                      max={fieldDef.max}
                      suffix={fieldDef.type === 'number' && propKey === 'fontSize' ? 'px' : ''}
                    />
                  </div>
                );
              });
            })()}

            {/* 구분선 */}
            <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

            {/* 도움말 */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f2f5',
              borderRadius: 6,
              fontSize: 12,
              color: '#65676b'
            }}>
              💡 Press <strong>Delete</strong> key to remove component
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#65676b'
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>👆</div>
            <div style={{ fontSize: 14, marginBottom: 8 }}>Select a component</div>
            <div style={{ fontSize: 12 }}>
              Click on any component to edit its properties
            </div>
          </div>
        )}
      </div>

      {/* 하단 사용자 정보 */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ fontSize: 12, color: '#65676b', marginBottom: 4 }}>
          <span style={{ color: color, fontWeight: 600 }}>{nickname}</span>
        </div>
        <div style={{ fontSize: 11, color: '#8a8d91' }}>
          Room: <strong>{roomId}</strong>
        </div>
      </div>
    </div>
  );
}

export default Inspector;
