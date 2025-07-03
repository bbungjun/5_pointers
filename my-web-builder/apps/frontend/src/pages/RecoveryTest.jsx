import React from "react";
import { useParams } from "react-router-dom";
import usePageRecovery from "../hooks/usePageRecovery";
import useAutoSave from "../hooks/useAutoSave";
import PageRecoveryLoader from "../components/PageRecoveryLoader";
import SaveStatusIndicator from "../components/SaveStatusIndicator";

function RecoveryTest() {
  const { roomId } = useParams();
  
  // 복구 Hook
  const { isRecovering, recoveredData, recoveryError, retryRecovery } = usePageRecovery(roomId);
  
  // 자동저장 Hook
  const { isSaving, lastSaved, saveError, saveCount, saveNow } = useAutoSave(
    roomId,
    recoveredData?.components || [],
    recoveredData?.canvasSettings || {},
    3000
  );

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🔄 복구 기능 테스트</h1>
      <p><strong>Room ID:</strong> {roomId}</p>
      
      {/* 복구 로딩 화면 */}
      <PageRecoveryLoader 
        isRecovering={isRecovering}
        recoveryError={recoveryError}
        onRetry={retryRecovery}
        roomId={roomId}
      />
      
      {/* 저장 상태 표시 */}
      <SaveStatusIndicator 
        isSaving={isSaving}
        lastSaved={lastSaved}
        saveError={saveError}
        saveCount={saveCount}
        onSaveNow={saveNow}
      />
      
      {/* 복구된 데이터 표시 */}
      {recoveredData && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>📋 복구된 데이터</h3>
          <p><strong>컴포넌트 개수:</strong> {recoveredData.components?.length || 0}</p>
          <p><strong>마지막 수정:</strong> {recoveredData.lastModified ? new Date(recoveredData.lastModified).toLocaleString() : "없음"}</p>
          <p><strong>캔버스 크기:</strong> {recoveredData.canvasSettings?.width || 0} x {recoveredData.canvasSettings?.height || 0}</p>
          
          {recoveredData.components?.length > 0 && (
            <details style={{ marginTop: "10px" }}>
              <summary>컴포넌트 상세 정보</summary>
              <pre style={{ background: "white", padding: "10px", borderRadius: "4px", fontSize: "12px", overflow: "auto" }}>
                {JSON.stringify(recoveredData.components, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default RecoveryTest;
