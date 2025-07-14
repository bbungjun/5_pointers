import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationToggle from '../../../components/NotificationToggle';
import ddukddakLogo from '/ddukddak-logo.png';
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
  isFromTemplate = false,
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
        bg-pink-50 backdrop-blur-sm border-b border-pink-100 
        flex items-center justify-between px-6
        shadow-sm
      "
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: '64px',
        backgroundColor: '#fdf2f8',
        borderBottom: '1px solid #fce7f3',
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
            src={ddukddakLogo}
            alt="뚝딱"
            className="w-13 h-6 object-contain"
          />
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
              disabled={isFromTemplate}
              className={`
                px-3 py-2 text-sm
                border rounded-lg transition-colors
                ${isFromTemplate 
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 cursor-pointer'
                }
              `}
              title={isFromTemplate ? '템플릿에서는 편집 기준을 변경할 수 없습니다' : '편집 기준 선택'}
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
            px-4 py-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          <span className="material-symbols-outlined text-base" title="공유" aria-label="공유">group_add</span>
        </button>

        {/* 미리보기 버튼 */}
        <button
          onClick={onPreviewOpen}
          className="
            px-4 py-2 bg-white border border-pink-200 hover:border-pink-300 text-pink-600 hover:text-pink-700
            font-medium rounded-lg transition-colors duration-200
            flex items-center whitespace-nowrap text-sm
          "
        >
          미리보기
        </button>

        {/* 뚝딱 게시 버튼 (최우측, 강조 색상) */}
        <button
          onClick={() => setShowDeployModal(true)}
          disabled={isDeploying || !components || components.length === 0}
          className="
            px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500
            hover:from-pink-600 hover:to-rose-600 text-white
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
