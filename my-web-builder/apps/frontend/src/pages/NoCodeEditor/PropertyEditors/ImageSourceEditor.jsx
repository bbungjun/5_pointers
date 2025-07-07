import React, { useState, useRef } from "react";
import { API_BASE_URL } from '../../../config.js';

function ImageSourceEditor({ label, value, onChange }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [urlInput, setUrlInput] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);

    try {
      // 🚀 서버 업로드 방식으로 변경
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/users/upload/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`업로드 실패: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // 서버에서 반환된 URL을 사용
        onChange(result.imageUrl);
        console.log("이미지 업로드 성공:", result);
      } else {
        throw new Error("서버에서 업로드 실패 응답");
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleUrlKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUrlSubmit();
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
        {label}
      </label>

      {/* 탭 버튼 */}
      <div style={{ display: "flex", marginBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: activeTab === "upload" ? "#3b82f6" : "transparent",
            color: activeTab === "upload" ? "white" : "#6b7280",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
            fontSize: "14px",
          }}
        >
          파일 업로드
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: activeTab === "url" ? "#3b82f6" : "transparent",
            color: activeTab === "url" ? "white" : "#6b7280",
            cursor: "pointer",
            borderRadius: "4px 4px 0 0",
            fontSize: "14px",
          }}
        >
          URL 입력
        </button>
      </div>

      {/* 파일 업로드 탭 */}
      {activeTab === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: "100%",
              padding: "12px",
              border: "2px dashed #d1d5db",
              borderRadius: "8px",
              background: isUploading ? "#f9fafb" : "#fafafa",
              cursor: isUploading ? "not-allowed" : "pointer",
              fontSize: "14px",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isUploading ? (
              <>
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #d1d5db",
                    borderTop: "2px solid #3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                업로드 중...
              </>
            ) : (
              <>
                📁 이미지 파일 선택 (최대 5MB)
              </>
            )}
          </button>
          
          {/* 현재 이미지 미리보기 */}
          {value && !isUploading && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <img
                src={value}
                alt="미리보기"
                style={{
                  maxWidth: "200px",
                  maxHeight: "150px",
                  objectFit: "contain",
                  border: "1px solid #e5e7eb",
                  borderRadius: "4px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                현재 이미지
              </div>
            </div>
          )}
        </div>
      )}

      {/* URL 입력 탭 */}
      {activeTab === "url" && (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleUrlKeyPress}
            placeholder="이미지 주소를 입력해주세요"
            style={{
              flex: 1,
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            적용
          </button>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ImageSourceEditor;
