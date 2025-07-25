import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../config';

/**
 * 마스터 전용 자동저장 훅
 * 마스터 사용자만 자동저장을 수행하여 중복 저장 방지
 */
function useMasterAutoSave(roomId, components, canvasHeight, isMaster, debounceMs = 2000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

  const timeoutRef = useRef(null);
  const lastDataRef = useRef(null);
  const lastSaveTimeRef = useRef(0);

  // 서버에 저장하는 함수 (마스터만 실행)
  const saveToServer = useCallback(
    async (components) => {
      if (!roomId || !isMaster) {
        console.log('🚫 자동저장 건너뜀:', isMaster ? '룸ID 없음' : '마스터 아님');
        return;
      }

      // 마지막 저장 후 1초 이내면 저장하지 않음
      const now = Date.now();
      if (now - lastSaveTimeRef.current < 1000) {
        return;
      }

      try {
        setIsSaving(true);
        setSaveError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('인증 토큰이 없습니다.');
        }

        

        const response = await fetch(
          `${API_BASE_URL}/users/pages/room/${roomId}/content`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              components: components,
              canvasSettings: {
                canvasHeight: canvasHeight
              }
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`저장 실패: ${response.status}`);
        }

        const result = await response.json();
        setLastSaved(new Date());
        setSaveCount((prev) => prev + 1);
        lastSaveTimeRef.current = now;



      } catch (error) {
        console.error('❌ 마스터 자동저장 실패:', error);
        setSaveError(error.message);
      } finally {
        setIsSaving(false);
      }
    },
    [roomId, canvasHeight, isMaster, saveCount]
  );

  // 디바운스된 자동저장 (마스터만)
  const debouncedSave = useCallback(
    (components) => {
      if (!isMaster) {

        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveToServer(components);
      }, debounceMs);
    },
    [saveToServer, debounceMs, isMaster]
  );

  // 수동 저장 (마스터만)
  const saveNow = useCallback(() => {
    if (!roomId || !components || !isMaster) {

      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    saveToServer(components);
  }, [roomId, components, saveToServer, isMaster]);

  // 컴포넌트나 캔버스 높이가 변경될 때 자동저장 (마스터만)
  useEffect(() => {
    if (!roomId || !components || !isMaster) return;

    const currentData = {
      components,
      canvasHeight
    };
    const currentDataStr = JSON.stringify(currentData);
    
    // 데이터가 실제로 변경되었을 때만 저장
    if (lastDataRef.current !== currentDataStr) {
      lastDataRef.current = currentDataStr;
  
      debouncedSave(components);
    }
  }, [roomId, components, canvasHeight, debouncedSave, isMaster]);

  // 마스터 권한 변경 시 처리
  useEffect(() => {
    if (isMaster) {
      
    } else {
  
      
      // 마스터가 아니면 진행 중인 저장 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isMaster]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving: isMaster ? isSaving : false,
    lastSaved: isMaster ? lastSaved : null,
    saveError: isMaster ? saveError : null,
    saveCount: isMaster ? saveCount : 0,
    saveNow: isMaster ? saveNow : () => {},
    isMasterSaver: isMaster
  };
}

export default useMasterAutoSave;
