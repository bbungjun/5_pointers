import React, { useState } from 'react';

const WebSocketConnectionGuide = ({ wsUrl, onRetry }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCertificateSetup = () => {
    // WSS/WS URL을 HTTPS URL로 변경 (SSL 인증서 확인용)
    let httpsUrl;
    
    if (wsUrl.includes('wss://')) {
      // WSS URL을 HTTPS URL로 변경
      httpsUrl = wsUrl.replace('wss://', 'https://');
    } else if (wsUrl.includes('ws://')) {
      // WS URL을 WSS용 HTTPS URL로 변경
      if (wsUrl.includes('localhost:1234')) {
        // 로컬 환경: 1234 포트를 1235 포트(SSL)로 변경
        httpsUrl = wsUrl.replace('ws://localhost:1234', 'https://localhost:1235');
      } else if (wsUrl.includes('ws.ddukddak.org')) {
        // 프로덕션 환경: 도메인 기반 HTTPS
        httpsUrl = wsUrl.replace('ws://', 'https://').replace(':1234', ':1235');
      } else {
        // 기타 환경: WS를 HTTPS로 변경하고 SSL 포트 사용
        httpsUrl = wsUrl.replace('ws://', 'https://').replace(':1234', ':1235');
      }
    } else {
      // 기본값
      httpsUrl = wsUrl;
    }
    
    // WSL 환경에서 localhost가 안 되는 경우를 위한 대체 URL
    const isWSLEnvironment = httpsUrl.includes('localhost') && typeof window !== 'undefined';
    const isProductionDomain = httpsUrl.includes('ddukddak.org');
    
    if (isWSLEnvironment) {
      // WSL 환경: localhost와 WSL IP 둘 다 시도
      console.log('🔗 SSL 서버 확인 URL (localhost):', httpsUrl);
      console.log('🔗 SSL 서버 확인 URL (WSL IP 대체):', httpsUrl.replace('localhost', '172.30.74.11'));
      console.log('💡 localhost가 안 되면 WSL IP로 시도하세요.');
      
      window.open(httpsUrl, '_blank');
      
      setTimeout(() => {
        const wslUrl = httpsUrl.replace('localhost', '172.30.74.11');
        console.log('🔄 WSL IP 대체 URL도 열어드립니다:', wslUrl);
        if (confirm('localhost 연결이 안 되나요? WSL IP 주소로도 시도해보시겠습니까?\n\n' + wslUrl)) {
          window.open(wslUrl, '_blank');
        }
      }, 3000);
    } else if (isProductionDomain) {
      // 프로덕션 도메인 환경
      console.log('🌍 프로덕션 도메인 SSL 서버 확인 URL:', httpsUrl);
      console.log('💡 도메인 SSL 인증서로 보안 연결을 제공합니다.');
      window.open(httpsUrl, '_blank');
    } else {
      // 기타 환경
      console.log('🔗 SSL 서버 확인 URL:', httpsUrl);
      window.open(httpsUrl, '_blank');
    }
    
    console.log('💡 SSL 인증서를 신뢰하도록 설정한 후 WSS 연결을 시도하세요.');
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
              협업 서버 SSL 연결 확인 필요
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>실시간 협업을 위해 WSS (보안 WebSocket) 서버 연결을 확인해주세요.</p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={() => {
                  console.log('🔄 협업 서버 접속 시도...');
                  onRetry();
                }}
                className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-4 py-2 rounded transition-colors shadow-sm"
              >
                접속하기
              </button>
              <button
                onClick={handleCertificateSetup}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1 rounded border border-yellow-300 transition-colors"
              >
                SSL 서버 확인
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
            <h4 className="font-medium mb-2">🔒 WSS 서버 연결 확인 방법:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>"SSL 서버 확인" 버튼 클릭</li>
              <li>새 탭에서 SSL 인증서 경고가 나타나면 "고급" → "안전하지 않음으로 이동" 클릭</li>
              <li>"Y.js WebSocket Server (HTTPS) is running!" 메시지 확인</li>
              <li>인증서를 신뢰한 후 이 페이지로 돌아와서 "접속하기" 클릭</li>
              <li>WSS 연결이 자동으로 설정됩니다</li>
            </ol>
            <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
              <strong>🔒 SSL 보안:</strong> 자체 서명 인증서를 사용하므로 브라우저에서 경고가 나타날 수 있습니다. 
              로컬 개발 환경에서는 안전하게 진행하셔도 됩니다.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketConnectionGuide;
