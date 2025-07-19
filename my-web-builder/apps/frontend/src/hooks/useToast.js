import { useState, useCallback } from 'react';

/**
 * Toast 알림을 쉽게 사용할 수 있는 커스텀 훅
 *
 * Returns:
 * - showToast: 토스트 표시 함수
 * - toastState: 토스트 상태 객체
 * - hideToast: 토스트 숨기기 함수
 */
export function useToast() {
  const [toastState, setToastState] = useState({
    isVisible: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback(
    (message, type = 'success', duration = 5000) => {
      setToastState({
        isVisible: true,
        message,
        type,
      });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToastState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  const showSuccess = useCallback(
    (message) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showError = useCallback(
    (message) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  return {
    showToast,
    showSuccess,
    showError,
    hideToast,
    toastState,
  };
}
