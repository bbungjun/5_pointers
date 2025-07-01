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
    <div 
      className={`
        fixed top-0 h-16 
        bg-white/95 backdrop-blur-sm border-b border-blue-200/30 
        flex items-center justify-between 
        z-50 transition-all duration-300 ease-in-out
        ${isLibraryOpen ? 'left-60' : 'left-0'}
        ${selectedComp ? 'right-[340px] px-4' : 'right-0 px-6'}
        shadow-sm
      `}
    >
      {/* 좌측: 로고와 컴포넌트 개수 */}
      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
          PAGE CUBE
        </h1>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">
          {components.length}개
        </div>
      </div>

      {/* 중앙: 뷰포트 컨트롤러 */}
      <div className="flex-1 flex justify-center mx-4 min-w-0">
        <div className={`transition-all duration-300 ${selectedComp ? 'max-w-xs' : 'max-w-md'}`}>
          <ViewportController
            currentViewport={viewport}
            onViewportChange={onViewportChange}
          />
        </div>
      </div>

      {/* 우측: 버튼들 */}
      <div className={`flex items-center min-w-0 flex-shrink-0 ${selectedComp ? 'gap-2' : 'gap-3'}`}>
        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            className={`
              ${selectedComp ? 'px-2 py-2' : 'px-4 py-2'}
              bg-gradient-to-r from-emerald-500 to-green-500 
              hover:from-emerald-600 hover:to-green-600
              text-white font-medium rounded-lg
              transition-all duration-200 transform hover:scale-105 hover:shadow-lg
              flex items-center gap-2 whitespace-nowrap
              ${selectedComp ? 'text-sm' : 'text-sm'}
            `}
          >
            <span className="text-base">💾</span>
            {!selectedComp && <span className="hidden sm:inline">템플릿 저장</span>}
          </button>
        )}
        
        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className={`
            ${selectedComp ? 'px-2 py-2' : 'px-4 py-2'}
            bg-gradient-to-r from-blue-600 to-indigo-600 
            hover:from-blue-700 hover:to-indigo-700
            text-white font-medium rounded-lg
            transition-all duration-200 transform hover:scale-105 hover:shadow-lg
            flex items-center gap-2 whitespace-nowrap
            ${selectedComp ? 'text-sm' : 'text-sm'}
          `}
        >
          <span className="text-base">🔍</span>
          {!selectedComp && <span className="hidden sm:inline">미리보기</span>}
        </button>

        {/* Room ID 표시 - 작은 화면에서는 숨김 */}
        {!selectedComp && (
          <div className="hidden md:flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
            <span className="hidden lg:inline">Room: </span>
            <span className="font-mono">{roomId}</span>
          </div>
        )}

        {/* 작은 화면용 Room ID (Inspector 닫힌 상태에서만) */}
        {!selectedComp && (
          <div className="md:hidden flex px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
            {roomId.slice(0, 6)}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditorHeader; 