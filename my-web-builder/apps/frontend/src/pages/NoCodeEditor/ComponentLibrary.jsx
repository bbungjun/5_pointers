import React, { useState } from 'react';
import { ComponentList } from '../components/definitions';

// 모듈화된 컴포넌트들
import ToggleButton from './ComponentLibrary/components/ToggleButton';
import LibraryHeader from './ComponentLibrary/components/LibraryHeader';
import SearchBar from './ComponentLibrary/components/SearchBar';
import ComponentGrid from './ComponentLibrary/components/ComponentGrid';
import DeploySection from './ComponentLibrary/components/DeploySection';

function ComponentLibrary({ onDragStart, components, roomId, isOpen = true, onToggle }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      {/* 토글 버튼 - 라이브러리가 닫혀있을 때 보임 */}
      {!isOpen && <ToggleButton onToggle={onToggle} />}

      {/* 라이브러리 패널 */}
      <div
        style={{
          position: 'fixed',
          top: 64, // 헤더 높이만큼 아래로
          left: isOpen ? 0 : -240,
          height: 'calc(100vh - 64px)', // 헤더 높이만큼 제외
          zIndex: 100,
          overflowY: 'auto',
          width: 240,
          background: '#ffffff',
          borderRight: '1px solid #e1e5e9',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* 헤더 */}
        <LibraryHeader 
          componentCount={ComponentList.length} 
          onToggle={onToggle} 
        />

        {/* 검색 입력 */}
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />

        {/* 컴포넌트 그리드 */}
        <ComponentGrid 
          components={ComponentList}
          searchTerm={searchTerm}
          onDragStart={onDragStart}
        />

        {/* 배포 섹션 */}
        <DeploySection 
          components={components} 
          roomId={roomId} 
        />
      </div>
    </>
  );
}

export default ComponentLibrary;
