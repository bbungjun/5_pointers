import React from 'react';

const ConnectionStatus = ({ isConnected, connectionError }) => {
  return (
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
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span>연결 중...</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
