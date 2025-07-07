import React, { useState, useRef } from 'react';
import { ComponentList } from '../components/definitions';

// 모듈화된 컴포넌트들
import ToggleButton from './ComponentLibrary/components/ToggleButton';
import SearchBar from './ComponentLibrary/components/SearchBar';
import ComponentGrid from './ComponentLibrary/components/ComponentGrid';
import DeploySection from './ComponentLibrary/components/DeploySection';

function ComponentLibrary({ onDragStart, components, roomId, isOpen = true, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [libraryWidth, setLibraryWidth] = useState(320); // 기본 너비
  const resizeRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target === resizeRef.current) {
      setIsResizing(true);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 200 && newWidth < 600) { // 최소 200px, 최대 600px
        setLibraryWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  if (!isOpen) {
    return (
      <div style={{ position: 'relative' }}>
        {/* 라이브러리가 닫혔을 때 표시되는 토글 버튼 */}
        <button
          onClick={onToggle}
          style={{
            position: 'absolute',
            left: '0',
            top: '20px',
            width: '24px',
            height: '76px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderLeft: 'none',
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.boxShadow = '2px 0 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.boxShadow = '2px 0 8px rgba(0,0,0,0.1)';
          }}
          title="컴포넌트 라이브러리 열기"
        >
          <span style={{ fontSize: '14px', color: '#6b7280' }}>▶</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="bg-white transition-all duration-300 ease-in-out border-r border-gray-200 flex flex-col"
      style={{ 
        width: `${libraryWidth}px`,
        minWidth: '200px',
        maxWidth: '600px',
        position: 'relative'
      }}
    >
      {/* 고정 검색바 */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* 스크롤 가능한 컴포넌트 그리드 */}
      <div className="flex-1 overflow-y-auto">
        <ComponentGrid
          components={ComponentList}
          searchTerm={searchTerm}
          onDragStart={onDragStart}
        />
      </div>

      {/* 고정 배포 섹션 */}
      <div className="p-4 border-t border-gray-200">
        <DeploySection
          components={components}
          roomId={roomId}
        />
      </div>
      
      {/* 토글 버튼 - 라이브러리 우측 밖에 위치 */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '0',
          width: '24px',
          height: '76px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderLeft: 'none',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          transition: 'all 0.2s ease',
          color: '#6b7280'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#f8f9fa';
          e.target.style.boxShadow = '2px 0 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#ffffff';
          e.target.style.boxShadow = '2px 0 8px rgba(0,0,0,0.1)';
        }}
        title="컴포넌트 라이브러리 토글"
      >
        <span style={{ fontSize: '14px' }}>◀</span>
      </button>
      
      {/* 리사이즈 핸들 */}
      <div
        ref={resizeRef}
        style={{
          position: 'absolute',
          right: -2,
          top: 0,
          bottom: 0,
          width: '8px',
          cursor: 'col-resize',
          backgroundColor: 'transparent',
          zIndex: 10
        }}
        onMouseEnter={() => {
          if (resizeRef.current) {
            resizeRef.current.style.backgroundColor = 'rgba(59, 78, 255, 0.1)';
          }
        }}
        onMouseLeave={() => {
          if (resizeRef.current) {
            resizeRef.current.style.backgroundColor = 'transparent';
          }
        }}
        onMouseDown={handleMouseDown}
      />
    </aside>
  );
}

export default ComponentLibrary;
