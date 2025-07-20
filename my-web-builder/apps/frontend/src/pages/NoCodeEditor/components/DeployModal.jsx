import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function DeployModal({
  isOpen,
  onClose,
  onDeploy,
  isDeploying,
  deployedUrl,
  errorMessage,
}) {
  const [domain, setDomain] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const qrCodeRef = useRef(null);

  // QR 코드 생성
  useEffect(() => {
    const generateQRCode = async () => {
      if (deployedUrl) {
        try {
          const qrCodeDataURL = await QRCode.toDataURL(deployedUrl, {
            width: 400,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff',
            },
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
          borderRadius: '20px',
          padding: '32px',
          width: deployedUrl ? '700px' : '500px',
          maxWidth: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            {deployedUrl ? '접속 안내' : '주소 입력'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {deployedUrl ? (
          // 성공 메시지
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '36px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              QR 코드 접속
            </p>

            {/* QR 코드 중앙 배치 */}
            {qrCodeDataUrl && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '32px',
                }}
              >
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  style={{
                    width: '220px',
                    height: '220px',
                    border: '3px solid #e5e7eb',
                    borderRadius: '16px',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            )}

            {/* 배포된 URL 정보 */}
            <div
              style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <p
                style={{
                  fontSize: '28px',
                  color: '#374151',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}
              >
                내가 만든 페이지 주소
              </p>
              <a
                href={deployedUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#8477FF',
                  textDecoration: 'underline',
                  wordBreak: 'break-all',
                  fontSize: '24px',
                  fontWeight: 500,
                  display: 'block',
                }}
              >
                {deployedUrl}
              </a>
            </div>

            <button
              onClick={onClose}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: '#8477FF',
                color: 'white',
                fontWeight: 600,
                fontSize: '18px',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <p
              style={{
                margin: '0 0 32px 0',
                color: '#6b7280',
                lineHeight: 1.5,
                fontSize: '18px',
              }}
            >
              사용할 주소를 입력하세요.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="서브도메인 입력"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: errorMessage
                    ? '2px solid #dc2626'
                    : '2px solid #e5e7eb',
                  fontSize: '18px',
                  boxSizing: 'border-box',
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleConfirm();
                }}
                autoFocus
              />
              {errorMessage && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fee2e2',
                    border: '2px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '16px',
                    fontWeight: '500',
                  }}
                >
                  {errorMessage}
                </div>
              )}
            </div>

            {/* 실시간 URL 미리보기 */}
            {domain.trim() && (
              <div
                style={{
                  marginBottom: '32px',
                  padding: '16px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  사용할 주소
                </p>
                <p
                  style={{
                    fontSize: '20px',
                    color: '#374151',
                    fontWeight: 600,
                    margin: 0,
                    wordBreak: 'break-all',
                  }}
                >
                  https://{domain.trim()}.ddukddak.org/
                </p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isDeploying || !domain.trim()}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                backgroundColor: isDeploying ? '#9ca3af' : '#8477FF',
                color: 'white',
                fontWeight: 600,
                fontSize: '18px',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: '100%',
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
