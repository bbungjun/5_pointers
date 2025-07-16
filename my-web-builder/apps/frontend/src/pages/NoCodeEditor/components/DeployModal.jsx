import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function DeployModal({ isOpen, onClose, onDeploy, isDeploying, deployedUrl, errorMessage }) {
  const [domain, setDomain] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const qrCodeRef = useRef(null);

  // QR 코드 생성
  useEffect(() => {
    const generateQRCode = async () => {
      if (deployedUrl) {
        try {
          const qrCodeDataURL = await QRCode.toDataURL(deployedUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeDataUrl(qrCodeDataURL);
        } catch (error) {
          console.error('QR 코드 생성 실패:', error);
        }
      }
    };
    
    generateQRCode();
  }, [deployedUrl]);

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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
          borderRadius: '24px',
          padding: '80px',
          width: deployedUrl ? '1200px' : '1000px',
          maxWidth: '98%',
          minHeight: deployedUrl ? '800px' : '650px',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '48px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '42px',
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
              fontSize: '36px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '12px',
            }}
          >
            ✕
          </button>
        </div>

        {deployedUrl ? (
          // 성공 메시지
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: 600, marginBottom: '32px' }}>게시 완료!</p>
            
            {/* QR 코드와 URL을 나란히 배치 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '64px',
              marginBottom: '64px',
              padding: '48px',
              backgroundColor: '#f9fafb',
              borderRadius: '20px',
              border: '2px solid #e5e7eb'
            }}>
              {/* QR 코드 */}
              {qrCodeDataUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    style={{ 
                      width: '220px', 
                      height: '220px',
                      border: '3px solid #e5e7eb',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff'
                    }} 
                  />
                  <p style={{ 
                    fontSize: '18px', 
                    color: '#6b7280', 
                    marginTop: '16px',
                    margin: 0
                  }}>
                    QR 코드로 접속
                  </p>
                </div>
              )}
              
              {/* URL 정보 */}
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ 
                  fontSize: '24px', 
                  color: '#374151', 
                  marginBottom: '20px',
                  fontWeight: 600
                }}>
                  배포된 페이지:
                </p>
                <a 
                  href={deployedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#ec4899', 
                    textDecoration: 'underline', 
                    wordBreak: 'break-all',
                    fontSize: '20px',
                    fontWeight: 500,
                    display: 'block',
                    marginBottom: '20px'
                  }}
                >
                  {deployedUrl}
                </a>
                <p style={{ 
                  fontSize: '18px', 
                  color: '#6b7280', 
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  모바일에서 QR 코드를 스캔하여 쉽게 접속하세요
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                padding: '20px 40px',
                borderRadius: '16px',
                background: 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)',
                color: '#fff',
                fontWeight: 500,
                fontSize: '20px',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <p
              style={{
                margin: '0 0 48px 0',
                color: '#6b7280',
                lineHeight: 1.5,
                fontSize: '22px',
              }}
            >
              서브도메인을 입력하여 사이트를 배포하세요.<br />예: <code style={{ fontSize: '20px', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>my-wedding</code>
            </p>

            <div style={{ marginBottom: '48px' }}>
              <input
                type="text"
                placeholder="서브도메인 입력"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '24px',
                  borderRadius: '16px',
                  border: errorMessage ? '3px solid #dc2626' : '3px solid #e5e7eb',
                  fontSize: '24px',
                  boxSizing: 'border-box',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                autoFocus
              />
              {errorMessage && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#fee2e2',
                  border: '2px solid #fecaca',
                  borderRadius: '12px',
                  color: '#dc2626',
                  fontSize: '18px',
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
                padding: '24px',
                borderRadius: '16px',
                background: isDeploying ? '#9ca3af' : 'linear-gradient(90deg, #ec4899 0%, #be185d 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '24px',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
                border: 'none',
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
