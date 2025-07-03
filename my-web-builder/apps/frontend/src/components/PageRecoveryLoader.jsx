import React from "react";

/**
 * 페이지 복구 로딩 화면 컴포넌트
 */
function PageRecoveryLoader({ isRecovering, recoveryError, onRetry, roomId }) {
  // 복구 중이 아니고 오류도 없으면 아무것도 표시하지 않음
  if (!isRecovering && !recoveryError) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        flexDirection: "column"
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          textAlign: "center",
          maxWidth: "400px"
        }}
      >
        {isRecovering ? (
          <>
            {/* 로딩 스피너 */}
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3B4EFF",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px"
              }}
            />
            <h3 style={{ margin: "0 0 10px", color: "#333" }}>
              🔄 페이지 복구 중...
            </h3>
            <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
              Room {roomId}의 작업 내용을 불러오고 있습니다.
            </p>
          </>
        ) : recoveryError ? (
          <>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px"
              }}
            >
              ❌
            </div>
            <h3 style={{ margin: "0 0 10px", color: "#f44336" }}>
              복구 실패
            </h3>
            <p style={{ margin: "0 0 20px", color: "#666", fontSize: "14px" }}>
              {recoveryError}
            </p>
            <button
              onClick={onRetry}
              style={{
                background: "#3B4EFF",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              다시 시도
            </button>
          </>
        ) : null}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default PageRecoveryLoader;
