import React from 'react';
import ViewportController from '../ViewportController';

function EditorHeader({
  components,
  selectedComp,
  isLibraryOpen,
  viewport,
  onViewportChange,
  onPreviewOpen,
  onTemplateSaveOpen,
  roomId,
  isAdmin
}) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: isLibraryOpen ? 240 : 0, // ComponentLibrary 상태에 따라 동적 오프셋
      right: selectedComp ? 340 : 0, // Inspector 너비만큼 오프셋
      height: 60,
      background: 'rgba(255, 255, 255, 0.95)',
      borderBottom: '1px solid #e1e5e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 100,
      backdropFilter: 'blur(10px)',
      transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* 좌측: 로고와 컴포넌트 개수 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: '#1d2129'
        }}>
          석재민짱
        </h1>
        <div style={{
          padding: '4px 8px',
          background: '#e3f2fd',
          color: '#1976d2',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500
        }}>
          {components.length}개 컴포넌트
        </div>
      </div>

      {/* 중앙: 뷰포트 컨트롤러 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flex: 1,
        maxWidth: selectedComp ? '300px' : '400px', // Inspector 열림 상태에 따라 조정
        transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <ViewportController
          currentViewport={viewport}
          onViewportChange={onViewportChange}
        />
      </div>

      {/* 우측: 미리보기 버튼과 기타 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        minWidth: selectedComp ? '120px' : '200px', // Inspector 열림 상태에 따라 조정
        justifyContent: 'flex-end'
      }}>
        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            style={{
              padding: selectedComp ? '6px 12px' : '8px 16px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: selectedComp ? 12 : 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: selectedComp ? 4 : 8,
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#218838';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 16px rgba(40, 167, 69, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#28a745';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
            }}
          >
            <span>💾</span>
            {!selectedComp && <span>템플릿 저장</span>}
          </button>
        )}
        
        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          style={{
            padding: selectedComp ? '6px 12px' : '8px 16px', // Inspector 열림시 작게
            background: '#3B4EFF',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: selectedComp ? 12 : 14, // Inspector 열림시 작게
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: selectedComp ? 4 : 8, // Inspector 열림시 작게
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 78, 255, 0.2)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2c39d4';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 16px rgba(59, 78, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3B4EFF';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 78, 255, 0.2)';
          }}
        >
          <span>🔍</span>
          {!selectedComp && <span>미리보기</span>} {/* Inspector 열림시 텍스트 숨김 */}
        </button>

        {/* Room ID 표시 (Inspector 열림시 숨김) */}
        {!selectedComp && (
          <div style={{
            padding: '4px 8px',
            background: '#f0f2f5',
            borderRadius: 4,
            fontSize: 12,
            color: '#65676b'
          }}>
            Room: {roomId}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorHeader; 