import React from 'react';
import * as ComponentEditors from './ComponentEditors';

function Inspector({ selectedComp, onUpdate, color, nickname, roomId }) {
  // 컴포넌트 타입별 에디터 매핑
  const getComponentEditor = (componentType) => {
    switch (componentType) {
      case 'button':
        return ComponentEditors.ButtonEditor;
      case 'text':
        return ComponentEditors.TextComponentEditor;
      case 'link':
        return ComponentEditors.LinkEditor;
      case 'map':
        return ComponentEditors.MapEditor;
      case 'attend':
        return ComponentEditors.AttendEditor;
      case 'image':
        return ComponentEditors.ImageEditor;
      case 'dday':
        return ComponentEditors.DdayEditor;
      case 'weddingContact':
        return ComponentEditors.WeddingContactEditor;
      default:
        console.warn(`Unknown component type: ${componentType}`);
        return null;
    }
  };

  // 컴포넌트 타입별 아이콘
  const getComponentIcon = (type) => {
    const icons = {
      button: '🔘',
      text: '📝',
      link: '🔗',
      map: '🗺️',
      attend: '✅',
      image: '🖼️',
      dday: '📅',
      weddingContact: '💒'
    };
    return icons[type] || '📦';
  };

  // 컴포넌트 타입별 라벨
  const getComponentLabel = (type) => {
    const labels = {
      button: 'Button',
      text: 'Text',
      link: 'Link',
      map: 'Map',
      attend: 'Attend',
      image: 'Image',
      dday: 'D-day',
      weddingContact: 'Wedding Contact'
    };
    return labels[type] || 'Component';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 340,
      height: '100vh',
      zIndex: 10,
      background: '#fff',
      width: 320,
      background: '#ffffff',
      borderLeft: '1px solid #e1e5e9',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
      overflowY: 'auto',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#3B4EFF',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff'
          }}>
            ⚙️
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#1d2129',
              letterSpacing: '0.3px'
            }}>
              Properties
            </h3>
            <div style={{
              fontSize: 12,
              color: '#65676b',
              marginTop: 2
            }}>
              {selectedComp ? getComponentLabel(selectedComp.type) : 'No selection'}
            </div>
          </div>
        </div>
      </div>

      {/* 속성 영역 */}
      <div style={{ 
        flex: 1, 
        padding: '24px',
        overflowY: 'auto'
      }}>
        {selectedComp ? (
          <div>
            {/* 컴포넌트 정보 카드 */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: 8,
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12
              }}>
                <div style={{
                  fontSize: 24
                }}>
                  {getComponentIcon(selectedComp.type)}
                </div>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1d2129'
                  }}>
                    {getComponentLabel(selectedComp.type)}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: '#65676b'
                  }}>
                    ID: {selectedComp.id.slice(0, 8)}
                  </div>
                </div>
              </div>
              
              {/* 위치 정보 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                fontSize: 12
              }}>
                <div>
                  <span style={{ color: '#65676b' }}>X:</span> {Math.round(selectedComp.x)}px
                </div>
                <div>
                  <span style={{ color: '#65676b' }}>Y:</span> {Math.round(selectedComp.y)}px
                </div>
                {selectedComp.width && (
                  <div>
                    <span style={{ color: '#65676b' }}>W:</span> {Math.round(selectedComp.width)}px
                  </div>
                )}
                {selectedComp.height && (
                  <div>
                    <span style={{ color: '#65676b' }}>H:</span> {Math.round(selectedComp.height)}px
                  </div>
                )}
              </div>
            </div>

            {/* 컴포넌트별 독립 에디터 렌더링 */}
            {(() => {
              const ComponentEditor = getComponentEditor(selectedComp.type);
              
              if (!ComponentEditor) {
                return (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#dc3545',
                    fontSize: 14,
                    background: '#f8d7da',
                    borderRadius: 6,
                    border: '1px solid #f5c6cb'
                  }}>
                    ⚠️ No editor available for component type: {selectedComp.type}
                  </div>
                );
              }

              return (
                <ComponentEditor
                  selectedComp={selectedComp}
                  onUpdate={onUpdate}
                />
              );
            })()}

            {/* 구분선 */}
            <div style={{ 
              height: 1, 
              backgroundColor: '#e9ecef', 
              margin: '24px 0',
              borderRadius: 1
            }} />

            {/* 도움말 */}
            <div style={{
              padding: '16px',
              backgroundColor: '#e3f2fd',
              borderRadius: 8,
              fontSize: 13,
              color: '#1976d2',
              border: '1px solid #bbdefb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8
              }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <strong>Quick Tips</strong>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                lineHeight: 1.5
              }}>
                <li>Press <kbd style={{
                  background: '#f1f3f4',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontSize: 11,
                  border: '1px solid #dadce0'
                }}>Delete</kbd> to remove component</li>
                <li>Double-click text to edit</li>
                <li>Drag corners to resize</li>
                <li>Use Ctrl+Scroll to zoom</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#65676b'
          }}>
            <div style={{ 
              fontSize: 48, 
              marginBottom: 16,
              opacity: 0.6
            }}>
              👆
            </div>
            <div style={{ 
              fontSize: 16, 
              marginBottom: 8,
              fontWeight: 500,
              color: '#1d2129'
            }}>
              Select a component
            </div>
            <div style={{ 
              fontSize: 13,
              lineHeight: 1.5
            }}>
              Click on any component in the canvas<br />
              to edit its properties here
            </div>
          </div>
        )}
      </div>

      {/* 하단 사용자 정보 */}
      <div style={{
        padding: '20px 24px',
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: color,
            borderRadius: '50%'
          }} />
          <span style={{ 
            fontSize: 13, 
            fontWeight: 500,
            color: '#1d2129'
          }}>
            {nickname}
          </span>
        </div>
        <div style={{ 
          fontSize: 11, 
          color: '#8a8d91',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span>🔗</span>
          Room: <strong>{roomId}</strong>
        </div>
      </div>
    </div>
  );
}

export default Inspector;
