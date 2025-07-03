import React from 'react';

function AttendThumbnail() {
  return (
    <div style={{
      width: 80,
      height: 60,
      backgroundColor: '#ffffff',
      borderRadius: 6,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* 상단 - 제목 영역 */}
      <div style={{
        fontSize: 8,
        fontWeight: '600',
        color: '#9ca3af',
        textAlign: 'center',
        marginBottom: 4
      }}>
        참석 의사 전달
      </div>
      
      {/* 중간 - 텍스트 라인들 (실제 내용을 암시) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2
      }}>
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '90%',
          alignSelf: 'center'
        }}></div>
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '100%'
        }}></div>
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '85%',
          alignSelf: 'center'
        }}></div>
      </div>
      
      {/* 하단 - 버튼 */}
      <div style={{
        height: 12,
        backgroundColor: '#aeb8fa',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4
      }}>
        <span style={{
          fontSize: 6,
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
