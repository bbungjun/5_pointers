import { useState } from 'react';
import { API_BASE_URL, getDeployedUrl } from '../../../../config';

export function useDeploy() {
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');

  const handleDeploy = async (components, roomId, domainOverride = null) => {
    const domainToUse = domainOverride ? domainOverride.trim() : domainName.trim();

    if (!domainToUse) {
      setShowDomainInput(true);
      return;
    }

    // 만약 외부에서 도메인을 전달했다면 상태도 동기화
    if (domainOverride) {
      setDomainName(domainToUse);
    }
    
    setIsDeploying(true);
    
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
      
      const response = await fetch(`${API_BASE_URL}/generator/deploy`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId: roomId,
          userId: 'user1',
          components: components || [],
          domain: domainToUse
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const deployedUrl = getDeployedUrl(domainToUse);
        setDeployedUrl(deployedUrl);
        setShowDomainInput(false);
      } else {
        const errorData = await response.text();
        console.error('배포 실패 응답:', response.status, errorData);
        
        if (response.status === 401) {
          throw new Error('인증이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else {
          throw new Error(`배포 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('배포 실패:', error);
      console.error('Deploy error', error);
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
    handleDeploy,
    resetDeploy: () => {
      setDeployedUrl('');
      setDomainName('');
    }
  };
}
