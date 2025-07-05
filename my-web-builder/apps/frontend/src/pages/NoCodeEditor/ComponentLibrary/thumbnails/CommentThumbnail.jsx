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
      padding: 6,
      gap: 3
    }}>
      {/* 상단 - 댓글 작성 폼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* 이름 입력 */}
        <div style={{
          height: 6,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 3
        }}>
          <div style={{
            fontSize: 5,
            color: '#9ca3af'
          }}>
            이름
          </div>
        </div>
        
        {/* 댓글 입력 */}
        <div style={{
          height: 8,
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 3
        }}>
          <div style={{
            fontSize: 5,
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
            width: 16,
            height: 5,
            backgroundColor: '#3b82f6',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 4,
            color: '#ffffff',
            fontWeight: '500'
          }}>
            작성
          </div>
        </div>
      </div>
      
      {/* 하단 - 댓글 목록 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {/* 댓글 1 */}
        <div>
          <div style={{
            fontSize: 5,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 1
          }}>
            홍길동
          </div>
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: '70%'
          }}></div>
        </div>
        
        {/* 댓글 2 */}
        <div>
          <div style={{
            fontSize: 5,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 1
          }}>
            김영희
          </div>
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: '80%'
          }}></div>
        </div>
      </div>
    </div>
  );
}

export default CommentThumbnail;
