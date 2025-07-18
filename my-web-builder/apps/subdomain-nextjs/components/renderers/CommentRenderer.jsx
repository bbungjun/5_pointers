import React, { useState, useEffect } from 'react';

function CommentRenderer({ comp, mode = 'live', pageId }) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;
  
  const { title, placeholder, backgroundColor } = comp.props;
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    author: '',
    content: '',
    password: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');

  // 댓글 목록 조회
  const fetchComments = async () => {
    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl = typeof window !== 'undefined' ? window.API_BASE_URL : null;
    
    if (!actualPageId || !actualApiBaseUrl) {
      return;
    }

    try {
      const apiUrl = `${actualApiBaseUrl}/users/pages/${actualPageId}/comments/${comp.id}`;
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content || !newComment.password) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl = typeof window !== 'undefined' ? window.API_BASE_URL : null;
    
    if (!actualPageId || !actualApiBaseUrl) {
      alert('페이지 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
      return;
    }

    try {
      const apiUrl = `${actualApiBaseUrl}/users/pages/${actualPageId}/comments/${comp.id}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment),
      });

      if (response.ok) {
        setNewComment({ author: '', content: '', password: '' });
        await fetchComments();
        // alert('댓글이 성공적으로 등록되었습니다.');
      } else {
        alert(`댓글 등록에 실패했습니다. (${response.status}: ${response.statusText})`);
      }
    } catch (error) {
      alert(`댓글 등록에 실패했습니다. 네트워크 오류: ${error.message}`);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!deletePassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    const actualApiBaseUrl = typeof window !== 'undefined' ? window.API_BASE_URL : null;

    try {
      const response = await fetch(
        `${actualApiBaseUrl}/users/pages/${comp.pageId}/comments/${comp.id}/${showDeleteModal}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: deletePassword }),
        }
      );

      if (response.ok) {
        setShowDeleteModal(null);
        setDeletePassword('');
        fetchComments();
      } else {
        alert('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      alert('댓글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [comp.id, comp.pageId, mode]);

  // 폰트 관련 속성들
  const fontFamily = comp.props?.fontFamily || 'Playfair Display, serif';
  const textAlign = comp.props?.textAlign || 'left';
  const lineHeight = comp.props?.lineHeight || 1.2;
  const letterSpacing = comp.props?.letterSpacing || 0;
  const fontWeight = comp.props?.fontWeight ? 'bold' : 'normal';
  const textDecoration = comp.props?.textDecoration ? 'underline' : 'none';
  const isItalic = comp.props?.fontStyle;
  const italicTransform = isItalic ? 'skewX(-15deg)' : 'none';

  return (
    <div
      style={{
        width: mode === 'live' ? '100%' : `${comp?.width || 300}px`,
        height: mode === 'live' ? `${(comp?.height || 400) * scaleFactor}px` : `${comp?.height || 200}px`,
        borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : 0,
        border: '1px solid #e5e7eb',
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        fontFamily: fontFamily,
        padding: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
      }}
    >
      <h3
        style={{
          fontSize: mode === 'live' ? `${18 * scaleFactor}px` : '18px',
          fontWeight: fontWeight === 'bold' ? 'bold' : '600',
          marginBottom: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
          color: comp.props?.color || '#1f2937',
          whiteSpace: 'pre-wrap',
          fontFamily: fontFamily,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: `${letterSpacing * scaleFactor}px`,
          textDecoration: textDecoration,
          transform: italicTransform,
        }}
      >
        {title || '축하 메세지를 남겨주세요'}
      </h3>

      {/* 댓글 작성 폼 */}
      <form
        onSubmit={handleSubmitComment}
        style={{
          marginBottom: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
          padding: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
          backgroundColor: '#f9fafb',
          borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: mode === 'live' ? `${12 * scaleFactor}px` : '12px',
            marginBottom: mode === 'live' ? `${12 * scaleFactor}px` : '12px',
          }}
        >
          <input
            type="text"
            placeholder="이름"
            value={newComment.author}
            onChange={(e) =>
              setNewComment({ ...newComment, author: e.target.value })
            }
            style={{
              padding: mode === 'live' ? `${8 * scaleFactor}px ${12 * scaleFactor}px` : '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: mode === 'live' ? `${6 * scaleFactor}px` : '6px',
              fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
              fontFamily: fontFamily,
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={newComment.password}
            onChange={(e) =>
              setNewComment({ ...newComment, password: e.target.value })
            }
            style={{
              padding: mode === 'live' ? `${8 * scaleFactor}px ${12 * scaleFactor}px` : '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: mode === 'live' ? `${6 * scaleFactor}px` : '6px',
              fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
              outline: 'none',
            }}
          />
        </div>
        <textarea
          placeholder={placeholder || '댓글을 남겨주세요'}
          value={newComment.content}
          onChange={(e) =>
            setNewComment({ ...newComment, content: e.target.value })
          }
          style={{
            width: '100%',
            padding: mode === 'live' ? `${8 * scaleFactor}px ${12 * scaleFactor}px` : '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: mode === 'live' ? `${6 * scaleFactor}px` : '6px',
            fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
            fontFamily: fontFamily,
            outline: 'none',
            resize: 'none',
            minHeight: mode === 'live' ? `${80 * scaleFactor}px` : '80px',
            whiteSpace: 'pre-wrap',
            boxSizing: 'border-box'
          }}
          rows="3"
        />
        <button
          type="submit"
          style={{
            marginTop: mode === 'live' ? `${12 * scaleFactor}px` : '12px',
            padding: mode === 'live' ? `${8 * scaleFactor}px ${16 * scaleFactor}px` : '8px 16px',
            borderRadius: mode === 'live' ? `${6 * scaleFactor}px` : '6px',
            fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            transition: 'background-color 0.2s',
            whiteSpace: 'pre-wrap',
          }}
        >
          댓글 작성
        </button>
      </form>

      {/* 댓글 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: mode === 'live' ? `${12 * scaleFactor}px` : '12px' }}>
        {comments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: mode === 'live' ? `${32 * scaleFactor}px 0` : '32px 0',
              fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
            }}
          >
            첫 번째 댓글을 남겨보세요!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                position: 'relative',
                padding: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: mode === 'live' ? `${6 * scaleFactor}px` : '6px',
              }}
            >
              <button
                onClick={() => setShowDeleteModal(comment.id)}
                style={{
                  position: 'absolute',
                  top: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
                  right: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
                  width: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
                  height: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
                  transition: 'color 0.2s',
                }}
              >
                ×
              </button>
              <div style={{ paddingRight: mode === 'live' ? `${32 * scaleFactor}px` : '32px' }}>
                <div
                  style={{
                    fontWeight: fontWeight === 'bold' ? 'bold' : '500',
                    color: comp.props?.color || '#1f2937',
                    marginBottom: `${4 * scaleFactor}px`,
                    fontFamily: fontFamily,
                    textAlign: textAlign,
                    letterSpacing: `${letterSpacing * scaleFactor}px`,
                    textDecoration: textDecoration,
                    transform: italicTransform,
                    fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
                  }}
                >
                  {comment.author}
                </div>
                <div
                  style={{
                    color: comp.props?.color || '#4b5563',
                    fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
                    lineHeight: lineHeight,
                    whiteSpace: 'pre-wrap',
                    fontFamily: fontFamily,
                    textAlign: textAlign,
                    letterSpacing: `${letterSpacing * scaleFactor}px`,
                    textDecoration: textDecoration,
                    transform: italicTransform,
                  }}
                >
                  {comment.content}
                </div>
                <div
                  style={{
                    fontSize: mode === 'live' ? `${12 * scaleFactor}px` : '12px',
                    color: '#9ca3af',
                    marginTop: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
                  }}
                >
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: mode === 'live' ? 'clamp(16px, 4vw, 24px)' : '24px',
              borderRadius: mode === 'live' ? 'clamp(6px, 1.5vw, 8px)' : '8px',
              width: mode === 'live' ? 'clamp(250px, 70vw, 320px)' : '320px',
            }}
          >
            <h3
              style={{
                fontSize: mode === 'live' ? 'clamp(16px, 4vw, 18px)' : '18px',
                fontWeight: '600',
                marginBottom: mode === 'live' ? 'clamp(12px, 3vw, 16px)' : '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              댓글 삭제
            </h3>
            <p
              style={{
                color: '#4b5563',
                marginBottom: mode === 'live' ? 'clamp(12px, 3vw, 16px)' : '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              댓글 작성 시 입력한 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={{
                width: '100%',
                padding: mode === 'live' ? 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)' : '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: mode === 'live' ? 'clamp(4px, 1vw, 6px)' : '6px',
                marginBottom: mode === 'live' ? 'clamp(12px, 3vw, 16px)' : '16px',
                outline: 'none',
                fontSize: mode === 'live' ? 'clamp(12px, 3vw, 14px)' : '14px',
                boxSizing: 'border-box'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleDeleteComment()}
            />
            <div
              style={{
                display: 'flex',
                gap: mode === 'live' ? 'clamp(6px, 1.5vw, 8px)' : '8px',
              }}
            >
              <button
                onClick={handleDeleteComment}
                style={{
                  flex: 1,
                  padding: mode === 'live' ? 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)' : '8px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: mode === 'live' ? 'clamp(4px, 1vw, 6px)' : '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: mode === 'live' ? 'clamp(12px, 3vw, 14px)' : '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                삭제
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setDeletePassword('');
                }}
                style={{
                  flex: 1,
                  padding: mode === 'live' ? 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)' : '8px 16px',
                  backgroundColor: '#d1d5db',
                  color: '#374151',
                  borderRadius: mode === 'live' ? 'clamp(4px, 1vw, 6px)' : '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: mode === 'live' ? 'clamp(12px, 3vw, 14px)' : '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentRenderer;