import React from 'react';

function AttendThumbnail() {
  return (
    <div style={{
      width: 100,  // 80 → 100으로 확대
      height: 75,  // 60 → 75로 확대
      backgroundColor: '#ffffff',
      borderRadius: 8,  // 6 → 8로 확대
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: 10,  // 8 → 12로 확대
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* 상단 - 제목 영역 */}
      <div style={{
        fontSize: 10,  // 8 → 10으로 확대
        fontWeight: '600',
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 6  // 4 → 6으로 확대
      }}>
        참석 의사 전달
      </div>
      
      {/* 중간 - 텍스트 라인들 (실제 내용을 암시) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 3  // 2 → 3으로 확대
      }}>
        <div style={{
          height: 3,  // 2 → 3으로 확대
          backgroundColor: '#d1d5db',
          borderRadius: 1.5,
          width: '90%',
          alignSelf: 'center'
        }}></div>
        <div style={{
          height: 3,  // 2 → 3으로 확대
          backgroundColor: '#d1d5db',
          borderRadius: 1.5,
          width: '100%'
        }}></div>
        <div style={{
          height: 3,  // 2 → 3으로 확대
          backgroundColor: '#d1d5db',
          borderRadius: 1.5,
          width: '85%',
          alignSelf: 'center'
        }}></div>
      </div>
      
      {/* 하단 - 버튼 */}
      <div style={{
        height: 16,  // 12 → 16으로 확대
        backgroundColor: '#aeb8fa',
        borderRadius: 6,  // 4 → 6으로 확대
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6  // 4 → 6으로 확대
      }}>
        <span style={{
          fontSize: 8,  // 6 → 8로 확대
          fontWeight: 'bold',
          color: '#ffffff'
        }}>
          전달하기
        </span>
      </div>
    </div>
  );
}

export default AttendThumbnail;
