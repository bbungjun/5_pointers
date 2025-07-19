import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
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

  const value = {
    showToast,
    showSuccess,
    showError,
    hideToast,
    toastState,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        type={toastState.type}
        message={toastState.message}
        isVisible={toastState.isVisible}
        onClose={hideToast}
        autoClose={true}
        duration={5000}
      />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
