import React from 'react';

function SlidoThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 상단 - 질문 제목 */}
      <div style={{
        fontSize: 6,
        fontWeight: 'bold',
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
        fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
      }}>
        실시간 의견
      </div>
      
      {/* 중간 - 의견 말풍선들 (흩어진 형태) */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* 의견 말풍선 1 */}
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '2px',
          backgroundColor: '#f3e5f5',
          border: '1px solid #9c27b0',
          borderRadius: '12px',
          padding: '2px 6px',
          fontSize: 5,
          color: '#6b7280',
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          의견1
        </div>
        
        {/* 의견 말풍선 2 */}
        <div style={{
          position: 'absolute',
          right: '6px',
          top: '8px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '12px',
          padding: '2px 6px',
          fontSize: 5,
          color: '#6b7280',
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          의견2 ×2
        </div>
        
        {/* 의견 말풍선 3 */}
        <div style={{
          position: 'absolute',
          left: '20px',
          bottom: '2px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '12px',
          padding: '2px 6px',
          fontSize: 5,
          color: '#6b7280',
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          의견3
        </div>
      </div>
      
      {/* 하단 - 입력 폼 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        marginTop: 4
      }}>
        {/* 입력창 (둥근 형태) */}
        <div style={{
          flex: 1,
          height: 8,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 4
        }}>
          <div style={{
            fontSize: 4,
            color: '#9ca3af',
            fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
          }}>
            💬 의견 입력...
          </div>
        </div>
        
        {/* 전송 버튼 */}
        <div style={{
          width: 8,
          height: 8,
          backgroundColor: '#667eea',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: 4,
            color: '#ffffff'
          }}>
            →
          </div>
        </div>
      </div>
    </div>
  );
}

export default SlidoThumbnail;
