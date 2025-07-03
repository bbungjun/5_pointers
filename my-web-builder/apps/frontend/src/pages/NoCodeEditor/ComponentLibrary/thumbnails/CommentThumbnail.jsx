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
      {/* 상단 - 댓글 작성 폼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        marginBottom: 5
      }}>
        {/* 이름 입력 */}
        <div style={{
          height: 8,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 4
        }}>
          <div style={{
            fontSize: 6,
            color: '#9ca3af'
          }}>
            이름
          </div>
        </div>
        
        {/* 댓글 입력 */}
        <div style={{
          height: 12,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'flex-start',
          padding: '2px 4px'
        }}>
          <div style={{
            fontSize: 6,
            color: '#9ca3af'
          }}>
            댓글을 입력하세요
          </div>
        </div>
        
        {/* 작성 버튼 */}
        <div style={{
          alignSelf: 'flex-end'
        }}>
          <div style={{
            width: 24,
            height: 7,
            backgroundColor: '#3b82f6',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 5,
            color: '#ffffff',
            fontWeight: '500'
          }}>
            작성하기
          </div>
        </div>
      </div>
      
      {/* 하단 - 댓글 목록 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        {/* 댓글 1 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <div style={{
            fontSize: 6,
            fontWeight: '600',
            color: '#374151'
          }}>
            홍길동
          </div>
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: '85%'
          }}></div>
        </div>
        
        {/* 댓글 2 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <div style={{
            fontSize: 6,
            fontWeight: '600',
            color: '#374151'
          }}>
            김영희
          </div>
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
              width: '70%'
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentThumbnail;
