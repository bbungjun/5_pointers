import { useState } from 'react';
import { API_BASE_URL, getDeployedUrl } from '../../../../config';

// JWT 토큰에서 사용자 ID 추출
const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;

    // Base64URL을 Base64로 변환
    let base64 = tokenParts[1];
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

    // 패딩 추가
    while (base64.length % 4) {
      base64 += '=';
    }

    // UTF-8로 안전하게 디코딩
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const utf8String = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(utf8String);

    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('토큰 파싱 실패:', error);
    return null;
  }
};

export function useDeploy() {
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeploy = async (components, roomId, domainOverride = null, editingMode = 'desktop', onDeploySuccess = null) => {
    const domainToUse = domainOverride ? domainOverride.trim() : domainName.trim();

    console.log('🚀 배포 시작:', { domainToUse, roomId, componentsCount: components?.length });

    if (!domainToUse) {
      setShowDomainInput(true);
      return;
    }

    // 만약 외부에서 도메인을 전달했다면 상태도 동기화
    if (domainOverride) {
      setDomainName(domainToUse);
    }
    
    setIsDeploying(true);
    setErrorMessage(''); // 에러 메시지 초기화
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('인증 토큰이 없습니다. 로그인이 필요할 수 있습니다.');
      }
      
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const userId = getUserIdFromToken();
      if (!userId) {
        throw new Error('사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.');
      }

      const requestBody = {
        projectId: roomId,
        userId: userId.toString(),
        components: components || [],
        domain: domainToUse,
        editingMode: editingMode
      };
      
      console.log('📤 API 요청:', {
        url: `${API_BASE_URL}/generator/deploy`,
        headers,
        body: requestBody
      });
      
      const response = await fetch(`${API_BASE_URL}/generator/deploy`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      console.log('배포 API 응답:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('배포 성공 데이터:', data);
        
        // 백엔드에서 반환된 URL을 사용 (백엔드가 환경별 올바른 URL을 제공)
        // data가 유효한지 확인
        if (data && typeof data === 'object') {
          const deployedUrl = data.url || getDeployedUrl(domainToUse);
          console.log('최종 배포 URL:', deployedUrl);
          
          setDeployedUrl(deployedUrl);
          setShowDomainInput(false);
          
          console.log('배포 완료! URL 상태 업데이트됨:', deployedUrl);
          
          // 배포 성공 후 콜백 실행
          if (onDeploySuccess) {
            onDeploySuccess(deployedUrl);
          }
        } else {
          throw new Error('백엔드에서 유효한 응답을 받지 못했습니다.');
        }
      } else {
        let errorMessage = '배포 실패';
        
        try {
          // JSON 응답인지 확인
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            const errorData = await response.text();
            errorMessage = errorData || errorMessage;
          }
        } catch (parseError) {
          console.error('에러 파싱 실패:', parseError);
        }
        
        console.error('배포 실패 응답:', response.status, errorMessage);
        
        if (response.status === 401) {
          throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          throw new Error(errorMessage);
        }
      }
    } catch (error) {
      console.error('배포 실패:', error);
      console.error('Deploy error', error);
      
      // 에러 메시지를 상태에 저장
      console.log('🔍 에러 메시지 검사:', error.message);
      
      const errorMsg = error.message.toLowerCase();
      
      // 데이터베이스 저장 실패 또는 undefined id 관련 오류 처리
      if (errorMsg.includes('cannot read properties of undefined') || 
          (errorMsg.includes('undefined') && errorMsg.includes('id')) || 
          errorMsg.includes('데이터베이스 저장 실패')) {
        setErrorMessage('이미 사용중인 주소입니다. 다른 주소를 입력해주세요.');
      }
      // 이미 존재하는 도메인 관련 오류 처리
      else if (errorMsg.includes('이미 존재') || 
          errorMsg.includes('이미 사용') || 
          errorMsg.includes('already') || 
          errorMsg.includes('exist') || 
          errorMsg.includes('duplicate')) {
        setErrorMessage('이미 사용중인 주소입니다. 다른 주소를 입력해주세요.');
      } else {
        setErrorMessage(`배포 중 오류가 발생했습니다: ${error.message}`);
      }
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    showDomainInput,
    setShowDomainInput,
    domainName,
    setDomainName,
    isDeploying,
    deployedUrl,
    errorMessage,
    handleDeploy,
    resetDeploy: () => {
      setDeployedUrl('');
      setDomainName('');
      setErrorMessage('');
    }
  };
}
