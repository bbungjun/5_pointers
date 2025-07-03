import React from 'react';

function SlideGalleryThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 8
    }}>
      {/* 상단 - 제목 */}
      <div style={{
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
        textAlign: 'center',
        marginBottom: 4
      }}>
        슬라이드 갤러리
      </div>
      
      {/* 중앙 - 슬라이드 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* 메인 슬라이드 */}
        <div style={{
          width: 50,
          height: 32,
          backgroundColor: '#f3f4f6',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#9ca3af',
          position: 'relative'
        }}>
          🖼️
          
          {/* 좌측 화살표 */}
          <div style={{
            position: 'absolute',
            left: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 6,
            color: '#6b7280',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            ‹
          </div>
          
          {/* 우측 화살표 */}
          <div style={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 12,
            height: 12,
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 6,
            color: '#6b7280',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            ›
          </div>
        </div>
      </div>
      
      {/* 하단 - 인디케이터와 설명 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3
      }}>
        {/* 인디케이터 점들 */}
        <div style={{
          display: 'flex',
          gap: 2
        }}>
          <div style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#3b82f6'
          }}></div>
          <div style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: '#d1d5db'
          }}></div>
          <div style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            backgroundColor: '#d1d5db'
          }}></div>
        </div>
        
        {/* 설명 */}
        <div style={{
          fontSize: 8,
          color: '#64748b',
          textAlign: 'center'
        }}>
          슬라이드 사진 보기
        </div>
      </div>
    </div>
  );
}

export default SlideGalleryThumbnail;
