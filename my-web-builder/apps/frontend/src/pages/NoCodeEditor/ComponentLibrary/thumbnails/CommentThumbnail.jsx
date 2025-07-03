import React from 'react';

function CommentThumbnail() {
  return (
    <div style={{
      width: 80, 
      height: 60, 
      background: '#fff', 
      border: '1px solid #ddd',
      borderRadius: 6, 
      padding: 4, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      fontSize: 6
    }}>
      <div style={{ fontSize: 16, marginBottom: 4 }}>💬</div>
      <div style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 2 }}>댓글</div>
      <div style={{ 
        background: '#f3f4f6', 
        borderRadius: 2, 
        padding: '1px 3px', 
        fontSize: 5 
      }}>
        작성하기
      </div>
    </div>
  );
}

export default CommentThumbnail;
