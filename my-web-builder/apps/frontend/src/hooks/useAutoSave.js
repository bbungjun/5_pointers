import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 자동저장 Hook
 * @param {string} pageId - 페이지 ID
 * @param {Array} components - 컴포넌트 배열
 * @param {number} debounceMs - 디바운스 시간 (기본 3초)
 */
function useAutoSave(pageId, components, debounceMs = 3000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveCount, setSaveCount] = useState(0);
  
  const timeoutRef = useRef(null);
  const lastDataRef = useRef(null);

  // 서버에 저장하는 함수
  const saveToServer = useCallback(async (components) => {
    if (!pageId) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/pages/${pageId}/content`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ content: components })
      });
      
      if (!response.ok) {
        throw new Error(`저장 실패: ${response.status}`);
      }
      
      const result = await response.json();
      setLastSaved(new Date());
      setSaveCount(prev => prev + 1);
      
      console.log("✅ 자동저장 완료:", result);
      
    } catch (error) {
      console.error("❌ 자동저장 실패:", error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [pageId]);

  // 디바운스된 자동저장
  const debouncedSave = useCallback((data) => {
    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 디바운스된 서버 저장
    timeoutRef.current = setTimeout(() => {
      saveToServer(data);
    }, debounceMs);
    
  }, [saveToServer, debounceMs]);

  // 수동 저장 (즉시 실행)
  const saveNow = useCallback(() => {
    if (!pageId || !components) return;
    
    // 기존 타이머 취소하고 즉시 저장
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    saveToServer(components);
  }, [pageId, components, saveToServer]);

  // 컴포넌트가 변경될 때 자동저장
  useEffect(() => {
    if (!pageId || !components) return;
    
    // 데이터가 실제로 변경되었는지 확인
    const currentDataStr = JSON.stringify(components);
    if (lastDataRef.current === currentDataStr) {
      return; // 변경사항 없음
    }
    
    lastDataRef.current = currentDataStr;
    debouncedSave(components);
    
  }, [pageId, components, debouncedSave]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveError,
    saveCount,
    saveNow
  };
}

export default useAutoSave;
