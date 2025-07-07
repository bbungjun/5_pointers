import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../config';

/**
 * 페이지 복구 Hook
 * @param {string} roomId - 방 ID (subdomain)
 * @param {Object} options - 복구 옵션
 */
function usePageRecovery(roomId, options = {}) {
  const [isRecovering, setIsRecovering] = useState(true);
  const [recoveredData, setRecoveredData] = useState(null);
  const [recoveryError, setRecoveryError] = useState(null);
  const [pageId, setPageId] = useState(null);

  // 서버에서 페이지 데이터 조회
  const fetchPageData = useCallback(async () => {
    if (!roomId) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/pages/room/${roomId}/content`);
      
      if (!response.ok) {
        throw new Error(`페이지 조회 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("🔄 서버에서 복구된 데이터:", data);
      
      return data;
    } catch (error) {
      console.error("❌ 페이지 데이터 조회 실패:", error);
      throw error;
    }
  }, [roomId]);

  // 로컬스토리지에서 미저장 데이터 확인
  const getLocalUnsavedData = useCallback(() => {
    if (!roomId) return null;

    try {
      const localKey = `autosave_${roomId}`;
      const localData = localStorage.getItem(localKey);
      
      if (localData) {
        const parsed = JSON.parse(localData);
        console.log("💾 로컬에서 발견된 데이터:", parsed);
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error("❌ 로컬 데이터 조회 실패:", error);
      return null;
    }
  }, [roomId]);

  // 데이터 병합 (서버 데이터 + 로컬 미저장 데이터)
  const mergeData = useCallback((serverData, localData) => {
    // 로컬 데이터가 없으면 서버 데이터 그대로 사용
    if (!localData) {
      return serverData;
    }

    // 서버 데이터가 더 최신이면 서버 데이터 사용
    const serverTime = new Date(serverData.lastModified).getTime();
    const localTime = localData.timestamp || 0;
    
    if (serverTime > localTime) {
      console.log("🔄 서버 데이터가 더 최신입니다");
      return serverData;
    }

    // 로컬 데이터가 더 최신이면 로컬 데이터 사용
    console.log("💾 로컬 데이터가 더 최신입니다");
    return {
      components: localData.components || [],
      canvasSettings: localData.canvasSettings || serverData.canvasSettings,
      lastModified: new Date(localTime),
      version: serverData.version || 1
    };
  }, []);

  // 복구 재시도
  const retryRecovery = useCallback(async () => {
    setIsRecovering(true);
    setRecoveryError(null);
    
    try {
      const serverData = await fetchPageData();
      const localData = getLocalUnsavedData();
      const mergedData = mergeData(serverData, localData);
      
      setRecoveredData(mergedData);
      setPageId(roomId); // roomId를 pageId로 사용
      
    } catch (error) {
      setRecoveryError(error.message);
    } finally {
      setIsRecovering(false);
    }
  }, [roomId, fetchPageData, getLocalUnsavedData, mergeData]);

  // 초기 복구 실행
  useEffect(() => {
    if (!roomId) return;

    const performRecovery = async () => {
      try {
        setIsRecovering(true);
        setRecoveryError(null);
        
        const serverData = await fetchPageData();
        const localData = getLocalUnsavedData();
        const mergedData = mergeData(serverData, localData);
        
        setRecoveredData(mergedData);
        setPageId(roomId);
        
        console.log("✅ 페이지 복구 완료:", mergedData);
        
      } catch (error) {
        console.error("❌ 페이지 복구 실패:", error);
        setRecoveryError(error.message);
        
        // 복구 실패 시 기본 데이터 제공
        setRecoveredData({
          components: [],
          canvasSettings: {
            width: 1200,
            height: 800,
            backgroundColor: "#ffffff"
          },
          lastModified: new Date(),
          version: 1
        });
        setPageId(roomId);
        
      } finally {
        setIsRecovering(false);
      }
    };

    performRecovery();
  }, [roomId, fetchPageData, getLocalUnsavedData, mergeData]);

  return {
    isRecovering,
    recoveredData,
    recoveryError,
    retryRecovery,
    pageId
  };
}

export default usePageRecovery;
