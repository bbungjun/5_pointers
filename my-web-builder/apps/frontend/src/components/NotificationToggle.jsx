import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function NotificationToggle({ pageId, isEditor = false }) {
  // Toast Context를 안전하게 사용
  let showError = null;
  try {
    const { useToastContext } = require('../contexts/ToastContext');
    const toastContext = useToastContext();
    showError = toastContext?.showError;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showError = (message) => alert(message);
  }

  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 ID를 prop으로 받거나 URL에서 추출
  const getPageId = () => {
    if (pageId) return pageId;

    // URL에서 페이지 ID 추출
    const pathParts = window.location.pathname.split('/').filter((p) => p);
    const editorIndex = pathParts.indexOf('editor');

    if (editorIndex !== -1 && editorIndex + 1 < pathParts.length) {
      return pathParts[editorIndex + 1];
    } else if (pathParts.length > 0) {
      return pathParts[0];
    }

    return null;
  };

  // 알림 설정 상태 조회
  const fetchNotificationStatus = async () => {
    const actualPageId = getPageId();
    if (!actualPageId || isEditor) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${actualPageId}/notification-status`
      );
      if (response.ok) {
        const data = await response.json();
        setIsEnabled(data.enabled || false);
      }
    } catch (error) {
      console.error('알림 상태 조회 실패:', error);
    }
  };

  // 알림 설정 토글
  const toggleNotification = async () => {
    const actualPageId = getPageId();
    if (!actualPageId) {
      showError('페이지 정보를 찾을 수 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${actualPageId}/toggle-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enabled: !isEnabled }),
        }
      );

      if (response.ok) {
        setIsEnabled(!isEnabled);
      } else {
        showError('알림 설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 토글 실패:', error);
      showError('알림 설정 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationStatus();
  }, [pageId, isEditor]);

  // 에디터 모드에서는 표시하지 않음
  if (isEditor) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        minWidth: '200px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#6b7280' }}>알림</span>
        <button
          onClick={toggleNotification}
          disabled={isLoading}
          style={{
            width: '40px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: isEnabled ? '#3B4EFF' : '#d1d5db',
            position: 'relative',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '2px',
              left: isEnabled ? '22px' : '2px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            }}
          />
        </button>
      </div>
      {isLoading && (
        <div
          style={{
            width: '12px',
            height: '12px',
            border: '2px solid #e5e7eb',
            borderTop: '2px solid #3B4EFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NotificationToggle;
