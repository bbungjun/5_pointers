import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationToggle from '../../../components/NotificationToggle';
import pageCubeLogo from '../../../assets/page-cube-logo.png';
import { useDeploy } from '../ComponentLibrary/hooks/useDeploy';
import DeployModal from './DeployModal';
import PageNavigation from './PageNavigation';

function EditorHeader({
  components,
  selectedComp,
  isLibraryOpen,
  viewport,
  designMode,
  onViewportChange,
  onDesignModeChange,
  onPreviewOpen,
  onTemplateSaveOpen,
  onInviteOpen,
  pageId,
  roomId,
  isConnected,
  connectionError,
  isAdmin,
  templateCategory = null,
}) {
  const navigate = useNavigate();

  // 배포 관련 훅 (컴포넌트 라이브러리에서 사용하던 것을 재사용)
  const {
    setDomainName,
    handleDeploy,
    isDeploying,
    deployedUrl,
    resetDeploy,
  } = useDeploy();

  // 배포 모달 상태
  const [showDeployModal, setShowDeployModal] = useState(false);

  const handleLogoClick = () => {
    navigate('/dashboard');
  };
  return (
    <div
      className="
        h-16 w-full
        bg-white/95 backdrop-blur-sm border-b border-blue-200/30 
        flex items-center justify-between px-6
        shadow-sm
      "
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        color: '#1f2937',
        zIndex: 10,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* 좌측: 로고와 컴포넌트 개수 */}
      <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
        {/* 로고 */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
          onClick={handleLogoClick}
        >
          <img
            src={pageCubeLogo}
            alt="Page Cube"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
            PAGE CUBE
          </h1>
        </div>
      </div>

      {/* 중앙: 편집 기준 선택 */}
      <div className="flex-1 flex justify-center mx-4 min-w-0">
        <div className="flex items-center gap-4">
n          {/* 페이지 네비게이션 */}
          <PageNavigation currentPageId={pageId} />

          {/* DesignMode 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium whitespace-nowrap">
              편집 기준
            </label>
            <select
              value={designMode}
              onChange={(e) => onDesignModeChange(e.target.value, pageId)}
              className="
                px-3 py-2 text-sm
                bg-white border border-gray-300 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                hover:border-blue-400 transition-colors
                cursor-pointer
              "
            >
              {templateCategory !== 'wedding' && <option value="desktop">💻 데스크탑</option>}
              <option value="mobile">📱 모바일</option>
            </select>
          </div>
        </div>
      </div>

      {/* 우측: 버튼들 */}
      <div className="flex items-center min-w-0 flex-shrink-0 gap-3">
        {/* 연결 상태 표시 */}
        <div className="flex items-center gap-2">
          {connectionError ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>연결 오류</span>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>연결됨</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span>연결 중...</span>
            </div>
          )}
        </div>

        {/* 템플릿 저장 버튼 (관리자만) */}
        {isAdmin && (
          <button
            onClick={onTemplateSaveOpen}
            className="
              px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800
              font-medium rounded-lg transition-colors duration-200
              flex items-center whitespace-nowrap text-sm
            "
          >
            <span className="material-symbols-outlined text-xl" title="템플릿 저장" aria-label="템플릿 저장">save</span>
          </button>
        )}

        {/* 공유 버튼 */}
        <button
          onClick={onInviteOpen}
          className="
            px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          <span className="material-symbols-outlined text-xl" title="공유" aria-label="공유">group_add</span>
        </button>

        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className="
            px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          <span className="material-symbols-outlined text-xl" title="미리보기" aria-label="미리보기">visibility</span>
        </button>

        {/* 게시 버튼 (최우측, 강조 색상) */}
        <button
          onClick={() => setShowDeployModal(true)}
          disabled={isDeploying || !components || components.length === 0}
          className="
            px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600
            hover:from-blue-700 hover:to-indigo-700 text-white
            font-medium rounded-lg transition-all duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          게시
        </button>
      </div>
      {/* 배포 모달 */}
      <DeployModal
        isOpen={showDeployModal}
        onClose={() => { setShowDeployModal(false); resetDeploy(); }}
        isDeploying={isDeploying}
        deployedUrl={deployedUrl}
        onDeploy={(domain) => {
          handleDeploy(components, roomId, domain);
        }}
      />
    </div>
  );
}

export default EditorHeader;
