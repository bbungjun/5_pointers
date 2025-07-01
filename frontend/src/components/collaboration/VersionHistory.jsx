import React, { useState } from 'react';

/**
 * 버전 히스토리 사이드바 패널
 */
export function VersionHistoryPanel({ 
  versions, 
  onCreateSnapshot, 
  onRestoreVersion, 
  onDeleteVersion,
  onRenameVersion,
  isCreatingSnapshot,
  isRestoring,
  isOpen,
  onToggle 
}) {
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateSnapshot = async () => {
    if (!newVersionName.trim()) return;

    try {
      await onCreateSnapshot(newVersionName, newVersionDescription);
      setNewVersionName('');
      setNewVersionDescription('');
      setShowCreateForm(false);
    } catch (error) {
      alert('버전 저장에 실패했습니다: ' + error.message);
    }
  };

  const handleRename = async (versionId) => {
    if (!editingName.trim()) return;

    try {
      await onRenameVersion(versionId, editingName);
      setEditingVersionId(null);
      setEditingName('');
    } catch (error) {
      alert('이름 변경에 실패했습니다: ' + error.message);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '80px',
          right: '260px',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 100,
          fontSize: '14px'
        }}
      >
        📚 버전 히스토리
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '320px',
        height: '100vh',
        backgroundColor: 'white',
        borderLeft: '1px solid #e1e5e9',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 헤더 */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            버전 히스토리
          </h3>
          <button
            onClick={onToggle}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={isCreatingSnapshot || isRestoring}
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3B4EFF',
              color: 'white',
              cursor: isCreatingSnapshot || isRestoring ? 'not-allowed' : 'pointer',
              opacity: isCreatingSnapshot || isRestoring ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isCreatingSnapshot ? '저장 중...' : '현재 상태 저장'}
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="버전 이름 (예: v1.0 시안)"
              value={newVersionName}
              onChange={(e) => setNewVersionName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e1e5e9',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <textarea
              placeholder="설명 (선택사항)"
              value={newVersionDescription}
              onChange={(e) => setNewVersionDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e1e5e9',
                borderRadius: '4px',
                marginBottom: '12px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                minHeight: '60px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewVersionName('');
                  setNewVersionDescription('');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e1e5e9',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateSnapshot}
                disabled={!newVersionName.trim() || isCreatingSnapshot}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#3B4EFF',
                  color: 'white',
                  cursor: !newVersionName.trim() || isCreatingSnapshot ? 'not-allowed' : 'pointer',
                  opacity: !newVersionName.trim() || isCreatingSnapshot ? 0.5 : 1,
                  fontSize: '14px'
                }}
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 버전 목록 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {versions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            marginTop: '40px'
          }}>
            저장된 버전이 없습니다.<br/>
            현재 상태를 저장해보세요.
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.id}
              style={{
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: index === 0 ? '#f8f9ff' : 'white'
              }}
            >
              {/* 버전 헤더 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                {editingVersionId === version.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleRename(version.id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(version.id);
                      }
                    }}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      border: '1px solid #3B4EFF',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      outline: 'none',
                      flex: 1
                    }}
                    autoFocus
                  />
                ) : (
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333',
                      cursor: 'pointer',
                      flex: 1
                    }}
                    onClick={() => {
                      setEditingVersionId(version.id);
                      setEditingName(version.name);
                    }}
                  >
                    {version.name}
                    {index === 0 && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        padding: '2px 6px',
                        backgroundColor: '#3B4EFF',
                        color: 'white',
                        borderRadius: '10px'
                      }}>
                        최신
                      </span>
                    )}
                  </h4>
                )}
                
                <button
                  onClick={() => {
                    if (confirm('이 버전을 삭제하시겠습니까?')) {
                      onDeleteVersion(version.id);
                    }
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    fontSize: '12px',
                    padding: '2px'
                  }}
                >
                  🗑️
                </button>
              </div>

              {/* 생성 시간 */}
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '8px'
              }}>
                {new Date(version.createdAt).toLocaleString()}
              </div>

              {/* 설명 */}
              {version.description && (
                <div style={{
                  fontSize: '13px',
                  color: '#555',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  {version.description}
                </div>
              )}

              {/* 복원 버튼 */}
              <button
                onClick={() => {
                  if (confirm(`"${version.name}" 버전으로 복원하시겠습니까? 현재 작업 내용은 사라집니다.`)) {
                    onRestoreVersion(version.id);
                  }
                }}
                disabled={isRestoring}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #28a745',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  color: '#28a745',
                  cursor: isRestoring ? 'not-allowed' : 'pointer',
                  opacity: isRestoring ? 0.5 : 1,
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                {isRestoring ? '복원 중...' : '이 버전으로 복원'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* 복원 중 오버레이 */}
      {isRestoring && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <div style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>🔄</div>
            <div style={{ fontSize: '14px' }}>버전을 복원하는 중...</div>
          </div>
        </div>
      )}
    </div>
  );
} 