import React, { useState } from 'react';

const WebSocketConnectionGuide = ({ wsUrl, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCertificateSetup = () => {
    // 새 탭에서 HTTPS 서버 열기
    window.open(wsUrl.replace('wss://', 'https://'), '_blank');
  };

  return (
    <div className="fixed top-4 right-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              협업 기능 연결 필요
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>실시간 협업을 위해 보안 인증서 승인이 필요합니다.</p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleCertificateSetup}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1 rounded border border-yellow-300 transition-colors"
              >
                인증서 승인하기
              </button>
              <button
                onClick={onRetry}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded border border-blue-300 transition-colors"
              >
                다시 연결
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-600 hover:text-yellow-800 text-xs font-medium px-2 py-1 transition-colors"
              >
                {isExpanded ? '접기' : '자세히'}
              </button>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={() => document.querySelector('.websocket-guide').style.display = 'none'}
                className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                <span className="sr-only">닫기</span>
                <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-4 text-sm text-yellow-700 border-t border-yellow-200 pt-4">
            <h4 className="font-medium mb-2">📋 인증서 승인 방법:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>"인증서 승인하기" 버튼 클릭</li>
              <li>새 탭에서 보안 경고 화면이 나타남</li>
              <li>"고급" 또는 "Advanced" 클릭</li>
              <li>"안전하지 않음으로 이동" 또는 "Proceed to..." 클릭</li>
              <li>"Y.js WebSocket Server (HTTPS) is running!" 메시지 확인</li>
              <li>이 페이지로 돌아와서 "다시 연결" 클릭</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
              <strong>💡 팁:</strong> 인증서는 한 번만 승인하면 됩니다. 이후 자동으로 연결됩니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketConnectionGuide;
