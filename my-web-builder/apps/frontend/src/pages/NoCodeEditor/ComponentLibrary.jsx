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
    <aside
      className={`bg-white transition-all duration-300 ease-in-out border-r border-gray-200 flex flex-col ${
        isOpen ? 'w-80' : 'w-0'
      }`}
    >
      <div className={`flex-1 overflow-y-auto ${isOpen ? 'p-4' : ''}`}>
        <div className={`${isOpen ? 'block' : 'hidden'}`}>
          <LibraryHeader
            roomId={roomId}
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
      </div>
    </aside>
  );
}

export default ComponentLibrary;
