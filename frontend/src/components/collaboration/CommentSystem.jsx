import React, { useState } from 'react';

/**
 * 캔버스 위에 표시되는 주석 핀들
 */
export function CommentPins({ comments, onPinClick, onAddComment, commentMode }) {
  const [newCommentPosition, setNewCommentPosition] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleCanvasClick = (event) => {
    if (!commentMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    setNewCommentPosition(position);
  };

  const handleAddComment = () => {
    if (newCommentText.trim() && newCommentPosition) {
      onAddComment('canvas', newCommentPosition, newCommentText);
      setNewCommentText('');
      setNewCommentPosition(null);
    }
  };

  return (
    <>
      {/* 캔버스 클릭 감지를 위한 오버레이 */}
      {commentMode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
            cursor: 'crosshair'
          }}
          onClick={handleCanvasClick}
        />
      )}

      {/* 기존 주석 핀들 */}
      {comments
        .filter(comment => !comment.isResolved)
        .map(comment => (
          <div
            key={comment.id}
            style={{
              position: 'absolute',
              left: comment.position.x - 12,
              top: comment.position.y - 12,
              zIndex: 10,
              cursor: 'pointer'
            }}
            onClick={() => onPinClick(comment.id)}
          >
            <CommentPin 
              commentCount={comment.replyCount} 
              isUnread={false} // 실제로는 읽음 상태 체크 필요
            />
          </div>
        ))}

      {/* 새 주석 작성 모달 */}
      {newCommentPosition && (
        <div
          style={{
            position: 'absolute',
            left: newCommentPosition.x,
            top: newCommentPosition.y,
            zIndex: 15,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            border: '1px solid #e1e5e9',
            padding: '16px',
            width: '280px'
          }}
        >
          <textarea
            autoFocus
            placeholder="댓글을 입력하세요..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              border: '1px solid #e1e5e9',
              borderRadius: '4px',
              padding: '8px',
              resize: 'vertical',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '8px', 
            marginTop: '12px' 
          }}>
            <button
              onClick={() => {
                setNewCommentPosition(null);
                setNewCommentText('');
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              onClick={handleAddComment}
              disabled={!newCommentText.trim()}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#3B4EFF',
                color: 'white',
                cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                opacity: newCommentText.trim() ? 1 : 0.5
              }}
            >
              댓글 작성
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 개별 주석 핀 컴포넌트
 */
function CommentPin({ commentCount, isUnread }) {
  return (
    <div
      style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: isUnread ? '#FF6B6B' : '#3B4EFF',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        transition: 'transform 0.2s ease',
        ':hover': {
          transform: 'scale(1.1)'
        }
      }}
    >
      {commentCount}
    </div>
  );
}

/**
 * 주석 스레드 모달
 */
export function CommentThreadModal({ 
  comment, 
  onClose, 
  onAddReply, 
  onResolve, 
  onDelete,
  currentUser 
}) {
  const [replyText, setReplyText] = useState('');

  const handleAddReply = () => {
    if (replyText.trim()) {
      onAddReply(comment.id, replyText);
      setReplyText('');
    }
  };

  if (!comment) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '480px',
          maxHeight: '70vh',
          overflow: 'auto',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            댓글 스레드
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onResolve(comment.id)}
              style={{
                padding: '6px 12px',
                border: '1px solid #28a745',
                borderRadius: '4px',
                backgroundColor: comment.isResolved ? '#28a745' : 'white',
                color: comment.isResolved ? 'white' : '#28a745',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {comment.isResolved ? '재개' : '해결'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div style={{ marginBottom: '20px' }}>
          {comment.replies.map((reply, index) => (
            <div
              key={reply.id}
              style={{
                padding: '12px',
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                marginBottom: '8px',
                backgroundColor: index === 0 ? '#f8f9fa' : 'white'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <strong style={{ fontSize: '14px' }}>{reply.author}</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
                {reply.text}
              </p>
            </div>
          ))}
        </div>

        {/* 새 댓글 작성 */}
        {!comment.isResolved && (
          <div>
            <textarea
              placeholder="답글을 입력하세요..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                padding: '12px',
                resize: 'vertical',
                outline: 'none',
                fontSize: '14px',
                marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleAddReply}
                disabled={!replyText.trim()}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#3B4EFF',
                  color: 'white',
                  cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                  opacity: replyText.trim() ? 1 : 0.5,
                  fontSize: '14px'
                }}
              >
                답글 작성
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 주석 모드 토글 버튼
 */
export function CommentModeToggle({ commentMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        top: '20px',
        right: '260px', // 컴포넌트 라이브러리 옆
        padding: '12px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: commentMode ? '#3B4EFF' : 'white',
        color: commentMode ? 'white' : '#333',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      💬 주석 {commentMode ? '종료' : '모드'}
    </button>
  );
} 