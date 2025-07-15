/**
 * 템플릿 동기화 유틸리티
 * 템플릿 기반 협업에서 발생하는 동기화 문제를 해결하기 위한 유틸리티 함수들
 */

/**
 * 템플릿 시작 시 모든 사용자에게 강제 동기화를 수행하는 함수
 * @param {Object} collaborationHook - useCollaboration 훅의 반환값
 * @param {string} roomId - 룸 ID
 * @param {number} maxRetries - 최대 재시도 횟수
 */
export async function forceTemplateSyncForAllUsers(collaborationHook, roomId, maxRetries = 3) {
  const { forceTemplateSync, isConnected } = collaborationHook;
  
  if (!isConnected) {
    console.warn('Y.js 연결이 되지 않아 템플릿 동기화를 건너뜁니다.');
    return false;
  }

  console.log('🎯 모든 사용자에게 템플릿 강제 동기화 시작...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 템플릿 동기화 시도 ${attempt}/${maxRetries}...`);
      
      const success = await forceTemplateSync();
      
      if (success) {
        console.log('✅ 템플릿 동기화 성공!');
        
        // 추가 확인을 위해 잠시 대기 후 한 번 더 동기화
        setTimeout(async () => {
          await forceTemplateSync();
          console.log('🔄 템플릿 동기화 재확인 완료');
        }, 1000);
        
        return true;
      }
      
      // 실패 시 잠시 대기 후 재시도
      if (attempt < maxRetries) {
        console.log(`⏳ ${attempt}번째 시도 실패, 1초 후 재시도...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ 템플릿 동기화 ${attempt}번째 시도 중 오류:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('❌ 템플릿 동기화 최종 실패');
  return false;
}

/**
 * 템플릿 페이지 진입 시 자동으로 동기화를 시도하는 함수
 * @param {Object} collaborationHook - useCollaboration 훅의 반환값
 * @param {string} roomId - 룸 ID
 * @param {Function} onSyncComplete - 동기화 완료 콜백
 */
export function initializeTemplateSync(collaborationHook, roomId, onSyncComplete) {
  const { isConnected } = collaborationHook;
  
  // 연결 상태를 모니터링하여 연결되면 즉시 동기화
  const checkConnection = () => {
    if (isConnected) {
      console.log('🔗 Y.js 연결 완료, 템플릿 자동 동기화 시작...');
      
      setTimeout(async () => {
        const success = await forceTemplateSyncForAllUsers(collaborationHook, roomId);
        if (onSyncComplete) {
          onSyncComplete(success);
        }
      }, 200);
      
      return true;
    }
    return false;
  };
  
  // 즉시 확인
  if (checkConnection()) {
    return;
  }
  
  // 연결될 때까지 주기적으로 확인
  const connectionInterval = setInterval(() => {
    if (checkConnection()) {
      clearInterval(connectionInterval);
    }
  }, 500);
  
  // 10초 후 타임아웃
  setTimeout(() => {
    clearInterval(connectionInterval);
    console.warn('⚠️ 템플릿 동기화 타임아웃');
  }, 10000);
}

/**
 * 컴포넌트 중복 제거 및 정리 함수
 * @param {Array} components - 컴포넌트 배열
 * @returns {Array} 중복이 제거된 컴포넌트 배열
 */
export function deduplicateComponents(components) {
  if (!Array.isArray(components)) {
    return [];
  }
  
  const seen = new Set();
  const uniqueComponents = [];
  
  for (const component of components) {
    if (component.id && !seen.has(component.id)) {
      seen.add(component.id);
      uniqueComponents.push(component);
    }
  }
  
  const removedCount = components.length - uniqueComponents.length;
  if (removedCount > 0) {
    console.log(`🧹 중복 컴포넌트 ${removedCount}개 제거됨`);
  }
  
  return uniqueComponents;
}
