/**
 * 협업 상태 표시 컴포넌트
 */

import React from 'react';

const CollaborationStatus = ({ 
  isConnected, 
  connectionError, 
  collaborators = [], 
  onReconnect 
}) => {
  // 연결 상태에 따른 스타일
  const getStatusStyle = () => {
    if (connectionError) {
      return {
        bg: 'bg-red-100 border-red-200',
        text: 'text-red-800',
        icon: '❌',
        status: '연결 오류'
      };
    } else if (isConnected) {
      return {
        bg: 'bg-green-100 border-green-200',
        text: 'text-green-800',
        icon: '✅',
        status: '연결됨'
      };
    } else {
      return {
        bg: 'bg-yellow-100 border-yellow-200',
        text: 'text-yellow-800',
        icon: '🔄',
        status: '연결 중...'
      };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className={`fixed top-12 right-4 max-w-sm ${statusStyle.bg} border rounded-lg shadow-lg z-50`}>
      <div className="p-3">
        {/* 상태 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{statusStyle.icon}</span>
            <span className={`text-sm font-medium ${statusStyle.text}`}>
              협업 {statusStyle.status}
            </span>
          </div>
          
          {/* 재연결 버튼 */}
          {(connectionError || !isConnected) && (
            <button
              onClick={onReconnect}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              재연결
            </button>
          )}
        </div>

        {/* 협업자 목록 */}
        {isConnected && collaborators.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-1">
              함께 작업 중 ({collaborators.length}명)
            </div>
            <div className="flex flex-wrap gap-1">
              {collaborators.map((collaborator, index) => (
                <div
                  key={collaborator.id || index}
                  className="flex items-center space-x-1 text-xs bg-white rounded px-2 py-1 border"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: collaborator.color || '#666' }}
                  />
                  <span className="text-gray-700">
                    {collaborator.name || `사용자 ${collaborator.id}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {connectionError && (
          <div className="mt-2 pt-2 border-t border-red-200">
            <div className="text-xs text-red-600">
              연결에 문제가 발생했습니다. 재연결을 시도해주세요.
            </div>
          </div>
        )}

        {/* 로컬 모드 안내 */}
        {connectionError && (
          <div className="mt-2 text-xs text-gray-600">
            현재 로컬 모드로 작업 중입니다. 변경사항은 저장되지만 실시간 협업은 불가능합니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationStatus;
