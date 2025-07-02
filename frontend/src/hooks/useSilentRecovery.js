import { useState, useEffect, useCallback } from "react";

/**
 * 조용한 페이지 복구 Hook (로딩 화면 없음)
 * @param {string} roomId - 방 ID
 */
function useSilentRecovery(roomId) {
  const [recoveredData, setRecoveredData] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // 서버에서 데이터 조회
  const fetchData = useCallback(async () => {
    if (!roomId) return null;

    try {
      const response = await fetch(`/api/users/pages/room/${roomId}/content`);
      if (response.ok) {
        const data = await response.json();
        console.log("🔄 백그라운드 복구 완료:", data);
        return data;
      }
    } catch (error) {
      console.log("📝 새 페이지 시작");
    }
    
    // 실패하면 기본 데이터 반환
    return {
      components: [],
      canvasSettings: { width: 1200, height: 800, backgroundColor: "#ffffff" }
    };
  }, [roomId]);

  // 초기 복구 실행
  useEffect(() => {
    if (!roomId) return;

    fetchData().then(data => {
      setRecoveredData(data);
      setIsReady(true);
    });
  }, [roomId, fetchData]);

  return {
    recoveredData,
    isReady
  };
}

export default useSilentRecovery;
