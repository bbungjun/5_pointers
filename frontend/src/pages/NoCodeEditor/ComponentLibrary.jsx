import React, { useState } from 'react';
import { ComponentList } from '../components/definitions';

function ComponentLibrary({ onDragStart, components, roomId }) {
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');

  // 배포 핸들러
  const handleDeploy = async () => {
    console.log('🚀 handleDeploy 호출됨');
    console.log('domainName:', domainName);
    console.log('components:', components);
    console.log('roomId:', roomId);
    
    if (!domainName.trim()) {
      console.log('도메인 입력창 표시');
      setShowDomainInput(true);
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const response = await fetch('http://localhost:3000/generator/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: roomId,
          userId: domainName.trim(),
          components: components || []
        })
      });
      
      const data = await response.json();
      setDeployedUrl(data.url);
      setShowDomainInput(false);
      alert(`배포 완료! 사이트 URL: ${data.url}`);
    } catch (error) {
      console.error('배포 실패:', error);
      alert('배포에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeploying(false);
    }
  };
  return (
    <div style={{
      width: 180, background: '#3B4EFF', color: '#fff', padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100vh'
    }}>
      <h3 style={{ marginBottom: 24, fontWeight: 900, letterSpacing: 2 }}>Components</h3>
      
      {/* 컴포넌트 리스트 */}
      {ComponentList.map(comp => (
        <div
          key={comp.type}
          draggable
          onDragStart={e => onDragStart(e, comp.type)}
          style={{
            width: '100%', marginBottom: 16, padding: 16,
            background: '#fff', color: '#3B4EFF', borderRadius: 8,
            fontWeight: 700, fontSize: 18, textAlign: 'center',
            cursor: 'grab', boxShadow: '0 1px 4px #0001'
          }}
        >
          {comp.label}
        </div>
      ))}

      {/* 배포 섹션 */}
      <div style={{ 
        width: '100%', 
        marginTop: 'auto', 
        paddingTop: 24, 
        borderTop: '1px solid rgba(255,255,255,0.2)' 
      }}>
        <h4 style={{ 
          marginBottom: 16, 
          fontWeight: 700, 
          fontSize: 14,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          🚀 DEPLOY
        </h4>
        
        {showDomainInput && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="원하는 도메인을 입력하세요"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDeploy();
                }
              }}
              autoFocus
            />
            <div style={{ 
              fontSize: 10, 
              color: 'rgba(255,255,255,0.8)', 
              textAlign: 'center',
              marginBottom: 8 
            }}>
              {domainName}.localhost:3001로 배포됩니다
            </div>
          </div>
        )}
        
        <button
          onClick={(e) => {
            console.log('버튼 클릭됨!');
            console.log('isDeploying:', isDeploying);
            console.log('components 길이:', components?.length);
            console.log('버튼 disabled 상태:', isDeploying || (components && components.length === 0));
            handleDeploy();
          }}
          disabled={isDeploying || (components && components.length === 0)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isDeploying ? 'rgba(255,255,255,0.3)' : '#fff',
            color: isDeploying ? 'rgba(255,255,255,0.7)' : '#3B4EFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isDeploying ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: 1
          }}
          onMouseEnter={(e) => {
            if (!isDeploying) {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeploying) {
              e.target.style.backgroundColor = '#fff';
            }
          }}
        >
          {isDeploying ? 'DEPLOYING...' : 'DEPLOY SITE'}
        </button>
        
        {deployedUrl && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            textAlign: 'center'
          }}>
            <strong>배포 완료!</strong>
            <br />
            <a 
              href={deployedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#fff', 
                textDecoration: 'underline',
                wordBreak: 'break-all'
              }}
            >
              {deployedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentLibrary; 