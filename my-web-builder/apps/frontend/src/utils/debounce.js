/**
 * 디바운스 함수 - 한글 입력 최적화를 위한 유틸리티
 * 
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @param {boolean} immediate - 즉시 실행 여부
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * 스로틀 함수 - 실시간 협업을 위한 유틸리티
 * 
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (밀리초)
 * @returns {Function} 스로틀된 함수
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 한글 입력 전용 디바운스 - 조합 완료 후 동기화
 * 
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (기본 300ms)
 * @returns {Function} 한글 최적화된 디바운스 함수
 */
export function debounceKorean(func, wait = 300) {
  let timeout;
  let isComposing = false;
  let lastArgs = null;
  
  const debouncedFunc = function(...args) {
    lastArgs = args;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (!isComposing) {
        func(...args);
      }
    }, wait);
  };
  
  // 조합 상태 추적 메서드 추가
  debouncedFunc.setComposing = (composing) => {
    isComposing = composing;
    if (!composing && lastArgs) {
      // 조합 완료 시 즉시 실행
      clearTimeout(timeout);
      func(...lastArgs);
    }
  };
  
  return debouncedFunc;
}
