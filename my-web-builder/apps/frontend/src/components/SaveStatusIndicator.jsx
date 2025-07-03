import React from "react";

/**
 * 저장 상태 표시 컴포넌트
 */
function SaveStatusIndicator({ isSaving, lastSaved, saveError, saveCount, onSaveNow }) {
  const getStatusColor = () => {
    if (saveError) return "#f44336"; // 빨간색 - 오류
    if (isSaving) return "#ff9800";  // 주황색 - 저장 중
    return "#4CAF50";                // 녹색 - 정상
  };

  const getStatusText = () => {
    if (saveError) return `❌ 저장 실패: ${saveError}`;
    if (isSaving) return "💾 저장 중...";
    if (lastSaved) {
      const timeStr = lastSaved.toLocaleTimeString();
      return `✅ 저장됨 (${timeStr}) - ${saveCount}회`;
    }
    return "💾 저장 준비";
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        background: getStatusColor(),
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "500",
        zIndex: 1000,
        maxWidth: "250px",
        cursor: saveError ? "pointer" : "default",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
      onClick={saveError ? onSaveNow : undefined}
      title={saveError ? "클릭하여 다시 저장" : ""}
    >
      {getStatusText()}
    </div>
  );
}

export default SaveStatusIndicator;
