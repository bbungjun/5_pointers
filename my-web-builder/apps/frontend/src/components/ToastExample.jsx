import React from 'react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

/**
 * Toast 사용 예시 컴포넌트
 * 실제 사용 시에는 이 컴포넌트를 참고하여 사용하세요.
 */
function ToastExample() {
  const { showSuccess, showError, hideToast, toastState } = useToast();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Toast 알림 테스트</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => showSuccess('성공적으로 처리되었습니다!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          성공 토스트
        </button>

        <button
          onClick={() => showError('오류가 발생했습니다. 다시 시도해주세요.')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          에러 토스트
        </button>
      </div>

      {/* Toast 컴포넌트 */}
      <Toast
        type={toastState.type}
        message={toastState.message}
        isVisible={toastState.isVisible}
        onClose={hideToast}
        autoClose={true}
        duration={5000}
      />
    </div>
  );
}

export default ToastExample;
