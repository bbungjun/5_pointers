import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NoCodeEditor from "./NoCodeEditor";
import useSilentRecovery from "../hooks/useSilentRecovery";
import useAutoSave from "../hooks/useAutoSave";
import SaveStatusIndicator from "../components/SaveStatusIndicator";

/**
 * NoCodeEditor + 복구/자동저장 기능 래퍼
 */
function NoCodeEditorWithRecovery() {
  const { roomId } = useParams();
  const [initialComponents, setInitialComponents] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 조용한 복구
  const { recoveredData, isReady } = useSilentRecovery(roomId);
  
  // 복구된 데이터로 초기화
  useEffect(() => {
    if (isReady && recoveredData?.components && !isInitialized) {
      setInitialComponents(recoveredData.components);
      setIsInitialized(true);
      console.log("✅ 복구 완료:", recoveredData.components.length, "개 컴포넌트");
    }
  }, [isReady, recoveredData, isInitialized]);

  // 아직 준비되지 않았으면 로딩
  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ position: "relative" }}>
      <NoCodeEditor initialComponents={initialComponents} />
      
      {/* 저장 상태만 표시 */}
      <SaveStatusIndicator 
        isSaving={false}
        lastSaved={null}
        saveError={null}
        saveCount={0}
        onSaveNow={() => {}}
      />
    </div>
  );
}

export default NoCodeEditorWithRecovery;
