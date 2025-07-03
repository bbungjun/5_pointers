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
      padding: 6  // 8 → 6으로 축소
    }}>
      {/* 상단 - 댓글 작성 폼 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,  // 3 → 2로 축소
        marginBottom: 4  // 6 → 4로 축소
      }}>
        {/* 이름 입력 */}
        <div style={{
          height: 6,  // 8 → 6으로 축소
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 2,  // 3 → 2로 축소
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 3  // 4 → 3으로 축소
        }}>
          <div style={{
            fontSize: 5,  // 6 → 5로 축소
            color: '#9ca3af'
          }}>
            이름
          </div>
        </div>
        
        {/* 댓글 입력 */}
        <div style={{
          height: 8,  // 12 → 8로 축소
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: 2,  // 3 → 2로 축소
          display: 'flex',
          alignItems: 'flex-start',
          padding: '1px 3px'  // 2px 4px → 1px 3px로 축소
        }}>
          <div style={{
            fontSize: 5,  // 6 → 5로 축소
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
            width: 18,  // 20 → 18로 축소
            height: 5,  // 6 → 5로 축소
            backgroundColor: '#3b82f6',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 4,  // 5 → 4로 축소
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
        gap: 3  // 4 → 3으로 축소
      }}>
        {/* 댓글 1 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <div style={{
            fontSize: 5,  // 6 → 5로 축소
            fontWeight: '600',
            color: '#374151'
          }}>
            홍길동
          </div>
          <div style={{
            height: 2,
            backgroundColor: '#d1d5db',
            borderRadius: 1,
            width: '80%'  // 85% → 80%로 축소
          }}></div>
        </div>
        
        {/* 댓글 2 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <div style={{
            fontSize: 5,  // 6 → 5로 축소
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
              width: '85%'  // 90% → 85%로 축소
            }}></div>
            <div style={{
              height: 2,
              backgroundColor: '#d1d5db',
              borderRadius: 1,
              width: '65%'  // 70% → 65%로 축소
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentThumbnail;
