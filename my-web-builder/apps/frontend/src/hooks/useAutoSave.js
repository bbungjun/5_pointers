import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 자동저장 Hook
 * @param {string} roomId - 방 ID (subdomain)
 * @param {Array} components - 컴포넌트 배열
 * @param {Object} canvasSettings - 캔버스 설정
 * @param {number} debounceMs - 디바운스 시간 (기본 3초)
 */
function useAutoSave(roomId, components, canvasSettings, debounceMs = 3000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveCount, setSaveCount] = useState(0);
  
  const timeoutRef = useRef(null);
  const lastDataRef = useRef(null);

  // 서버에 저장하는 함수
  const saveToServer = useCallback(async (data) => {
    if (!roomId) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const response = await fetch(`/api/users/pages/room/${roomId}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
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
  }, [roomId]);

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
    if (!roomId || !components) return;
    
    const data = {
      components: components || [],
      canvasSettings: canvasSettings || {}
    };
    
    // 기존 타이머 취소하고 즉시 저장
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    saveToServer(data);
  }, [roomId, components, canvasSettings, saveToServer]);

  // 컴포넌트나 캔버스 설정이 변경될 때 자동저장
  useEffect(() => {
    if (!roomId || !components) return;
    
    const currentData = {
      components: components || [],
      canvasSettings: canvasSettings || {}
    };
    
    // 데이터가 실제로 변경되었는지 확인
    const currentDataStr = JSON.stringify(currentData);
    if (lastDataRef.current === currentDataStr) {
      return; // 변경사항 없음
    }
    
    lastDataRef.current = currentDataStr;
    debouncedSave(currentData);
    
  }, [roomId, components, canvasSettings, debouncedSave]);

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
