import React from 'react';
import { useDeploy } from '../hooks/useDeploy';
import { getDeployedUrl } from '../../../../config';
import Toast from '../../../../components/Toast';

function DeploySection({ components, roomId }) {
  const {
    showDomainInput,
    setShowDomainInput,
    domainName,
    setDomainName,
    isDeploying,
    deployedUrl,
    errorMessage,
    handleDeploy,
    toast,
    closeToast
  } = useDeploy();

  const onDeploy = () => handleDeploy(components, roomId);

  return (
    <div style={{ 
      padding: '20px 24px',
      borderTop: '1px solid #e1e5e9',
      backgroundColor: '#fafbfc'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          width: 32,
          height: 32,
          background: '#00b894',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          color: '#fff'
        }}>
          🚀
        </div>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: '#1d2129',
            letterSpacing: '0.3px'
          }}>
            게시
          </h4>
          <div style={{
            fontSize: 11,
            color: '#65676b',
            marginTop: 2
          }}>
            {components ? components.length : 0} components ready
          </div>
        </div>
      </div>
      
      {showDomainInput && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Enter domain name"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e1e5e9',
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3B4EFF';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e5e9';
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onDeploy();
              }
            }}
            autoFocus
          />
          {/* 에러 메시지는 Toast로 표시하므로 제거 */}
          <div style={{ 
            fontSize: 10, 
            color: '#65676b', 
            marginTop: 6,
            lineHeight: 1.4
          }}>
            Your site will be available at:<br />
            <strong>{getDeployedUrl(domainName || 'your-domain')}</strong>
          </div>
        </div>
      )}
      
      <button
        onClick={onDeploy}
        disabled={isDeploying || (components && components.length === 0)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: isDeploying ? '#e1e5e9' : '#ec4899',
          color: isDeploying ? '#65676b' : '#ffffff',
          border: 'none',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: isDeploying ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
        onMouseEnter={(e) => {
          if (!isDeploying) {
            e.target.style.background = '#db2777';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDeploying) {
            e.target.style.background = '#ec4899';
          }
        }}
      >
        {isDeploying ? (
          <>
            <span style={{ fontSize: 14 }}>⏳</span>
            Deploying...
          </>
        ) : (
          <>
            <span style={{ fontSize: 14 }}>🚀</span>
            게시
          </>
        )}
      </button>
      
      {deployedUrl && (
        <div style={{
          marginTop: 16,
          padding: '12px',
          backgroundColor: '#e8f5e8',
          borderRadius: 6,
          border: '1px solid #c8e6c9',
          fontSize: 11,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#2e7d32',
            marginBottom: 6
          }}>
            ✅ Deployed Successfully!
          </div>
          <a 
            href={deployedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#1976d2', 
              textDecoration: 'underline',
              wordBreak: 'break-all',
              fontSize: 10
            }}
          >
            {deployedUrl}
          </a>
        </div>
      )}

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={closeToast}
        autoClose={true}
        duration={3000}
      />
    </div>
  );
}

export default DeploySection;
