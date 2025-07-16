import React, { useState } from 'react';

function DeployModal({ isOpen, onClose, onDeploy, isDeploying, deployedUrl, errorMessage }) {
  const [domain, setDomain] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!domain.trim()) return;
    onDeploy(domain.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          width: '440px',
          maxWidth: '90%',
          minHeight: '300px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            내가 만든 페이지 게시
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {deployedUrl ? (
          // 성공 메시지
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>게시 완료!</p>
            <a href={deployedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899', textDecoration: 'underline', wordBreak: 'break-all' }}>
              {deployedUrl}
            </a>
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <>
            <p
              style={{
                margin: '0 0 24px 0',
                color: '#6b7280',
                lineHeight: 1.5,
                fontSize: '14px',
              }}
            >
              서브도메인을 입력하여 사이트를 배포하세요.<br />예: <code>my-wedding</code>
            </p>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="서브도메인 입력"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: errorMessage ? '1px solid #dc2626' : '1px solid #e5e7eb',
                  fontSize: '16px',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                autoFocus
              />
              {errorMessage && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {errorMessage}
                </div>
              )}
            </div>

            <button
              onClick={handleConfirm}
              disabled={isDeploying || !domain.trim()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: isDeploying ? '#9ca3af' : 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '16px',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
              }}
            >
              {isDeploying ? '게시 중...' : '최종 확정'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeployModal; 