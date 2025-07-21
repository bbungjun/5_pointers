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
 * - onInviteSuccess: 초대 성공 시 호출할 콜백 함수
 */
function InviteModal({ isOpen, onClose, pageId, onInviteSuccess }) {
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

      const response = await fetch(
        `${API_BASE_URL}/pages/${pageId}/invitations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // 초대 링크 생성 성공
          // 이메일 앞부분 추출 (예: test@example.com -> test님)
          const emailPrefix = email.trim().split('@')[0];
          setMessage(`${emailPrefix}님을 초대했습니다!`);
          setMessageType('success');
          setEmail('');

          // 초대 성공 콜백 호출
          if (onInviteSuccess) {
            onInviteSuccess();
          }

          // 자동 모달 닫기 제거 - 사용자가 직접 닫도록 함
          // setTimeout(() => {
          //   onClose();
          //   setMessage('');
          // }, 5000);
        } else {
          // 초대 링크 생성 실패
          setMessage(data.message || '초대에 실패했습니다.');
          setMessageType('error');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(
          errorData.message || data.message || '초대에 실패했습니다.'
        );
        setMessageType('error');
      }
    } catch (error) {
      console.error('초대 오류:', error);
      setMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
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
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        fontFamily: 'Inter, sans-serif',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          width: '600px',
          maxWidth: '95%',
          height: 'auto',
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
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            팀원 초대하기
          </h2>
          <button
            onClick={handleClose}
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

        {/* 설명 */}
        <p
          style={{
            margin: '0 0 32px 0',
            color: '#6b7280',
            lineHeight: 1.5,
            fontSize: '18px',
          }}
        >
          이메일 주소를 입력하여 다른 사용자를 이 페이지에 초대하세요.
          <br />
          초대받은 사용자는 실시간 알림을 받고 초대 링크를 통해 참여할 수
          있습니다.
        </p>

        {/* 이메일 입력 폼 */}
        <form onSubmit={handleSendInvitation}>
          <div style={{ marginBottom: '32px' }}>
            <input
              type="email"
              placeholder="이메일 주소 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '18px',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#8477FF',
              color: 'white',
              fontWeight: 600,
              fontSize: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              marginBottom: '24px',
            }}
          >
            {loading ? '초대 중...' : '초대 보내기'}
          </button>
        </form>

        {/* 메시지 영역 - 간단한 텍스트만 표시 */}
        {message && (
          <div
            style={{
              marginTop: '16px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 500,
              color: messageType === 'success' ? '#059669' : '#d32f2f',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default InviteModal;
