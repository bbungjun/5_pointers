import React, { useState } from 'react';
import { API_BASE_URL } from '../../../config';

/**
 * InviteModal 컴포넌트
 * 
 * 역할: 페이지에 다른 사용자를 초대하는 모달
 * 
 * Props:
 * - isOpen: 모달 열림 상태
 * - onClose: 모달 닫기 함수
 * - pageId: 현재 페이지 ID
 */
function InviteModal({ isOpen, onClose, pageId }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'

  // 초대 이메일 발송
  const handleSendInvitation = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('이메일을 입력해주세요.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/pages/${pageId}/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // 이메일 발송 성공
          setMessage('초대 이메일을 성공적으로 보냈습니다! 🎉');
          setMessageType('success');
          setEmail('');
          // 3초 후 모달 닫기
          setTimeout(() => {
            onClose();
            setMessage('');
          }, 3000);
        } else {
          // 이메일 발송 실패했지만 링크는 생성됨
          setMessage(
            <div>
              <p>{data.message}</p>
              <p style={{ 
                marginTop: '10px', 
                padding: '10px', 
                background: '#f8f9fa', 
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                초대 링크: {data.inviteUrl}
              </p>
            </div>
          );
          setMessageType('error');
        }
      } else {
        setMessage(data.message || '초대 발송에 실패했습니다.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('초대 발송 오류:', error);
      setMessage('네트워크 오류가 발생했습니다.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setEmail('');
    setMessage('');
    setMessageType('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          minWidth: '400px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            👥 팀원 초대하기
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* 설명 */}
        <p style={{
          margin: '0 0 24px 0',
          color: '#6b7280',
          lineHeight: 1.5
        }}>
          이메일 주소를 입력하여 다른 사용자를 이 페이지에 초대하세요.<br/>
          초대받은 사용자는 이메일로 초대 링크를 받게 됩니다.
        </p>

        {/* 이메일 입력 폼 */}
        <form onSubmit={handleSendInvitation}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="이메일 주소 입력"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '16px',
                fontFamily: 'inherit',
                marginBottom: '8px'
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, #7c3aed 0%, #f472b6 100%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '12px',
              transition: 'background 0.2s'
            }}
          >
            {loading ? '초대 중...' : '초대 보내기'}
          </button>
        </form>

        {/* 메시지 */}
        {message && (
          <div style={{
            marginTop: '10px',
            color: messageType === 'success' ? '#059669' : '#d32f2f',
            background: messageType === 'success' ? '#ecfdf5' : '#ffebee',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '15px',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default InviteModal; 