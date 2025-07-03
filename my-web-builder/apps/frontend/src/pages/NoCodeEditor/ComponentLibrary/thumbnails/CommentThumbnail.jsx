import React from 'react';

function CommentThumbnail() {
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
        댓글
      </div>
      
      {/* 중앙 - 댓글 목록 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4
      }}>
        {/* 첫 번째 댓글 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* 작성자 이름 */}
          <div style={{
            fontSize: 7,
            fontWeight: '600',
            color: '#1e293b'
          }}>
            김철수
          </div>
          {/* 댓글 내용 (회색 선) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <div style={{
              height: 2,
              backgroundColor: '#d1d5db',
              borderRadius: 1,
              width: '90%'
            }}></div>
            <div style={{
              height: 2,
              backgroundColor: '#d1d5db',
              borderRadius: 1,
              width: '75%'
            }}></div>
          </div>
        </div>
        
        {/* 두 번째 댓글 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* 작성자 이름 */}
          <div style={{
            fontSize: 7,
            fontWeight: '600',
            color: '#1e293b'
          }}>
            박영희
          </div>
          {/* 댓글 내용 (회색 선) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            <div style={{
              height: 2,
              backgroundColor: '#d1d5db',
              borderRadius: 1,
              width: '85%'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* 하단 - 댓글 작성 영역 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        marginTop: 4
      }}>
        {/* 입력 필드 (회색 선) */}
        <div style={{
          flex: 1,
          height: 6,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 3
        }}>
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: '60%'
          }}></div>
        </div>
        
        {/* 작성 버튼 */}
        <div style={{
          width: 16,
          height: 6,
          backgroundColor: '#3b82f6',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 5,
          color: '#ffffff',
          fontWeight: '500'
        }}>
          작성
        </div>
      </div>
    </div>
  );
}

export default CommentThumbnail;
