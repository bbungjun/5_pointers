import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

// 사용 가능한 폰트 목록
const AVAILABLE_FONTS = [
  'Playfair Display',
  'Adelio Darmanto',
  'Bodoni',
  'Brooke Smith Script',
  'Chalisa Oktavia',
  'Dearly Loved One',
  'Deluxe Edition',
  'Dreamland',
  'EB Garamond',
  'Elsie',
  'England Hand',
  'Hijrnotes',
  'La Paloma',
  'Millerstone',
  'Montserrat',
  'Pinyon Script',
  'Prata',
  'Underland',
];

function CommentRenderer({
  comp,
  mode = 'editor',
  viewport = 'desktop',
  pageId,
}) {
  // Toast Context를 안전하게 사용
  let showError = null;
  try {
    const { useToastContext } = require('../../../contexts/ToastContext');
    const toastContext = useToastContext();
    showError = toastContext?.showError;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showError = (message) => alert(message);
  }

  const {
    title,
    placeholder,
    backgroundColor,
    noBorder = true,
    borderColor = '#e5e7eb',
    borderWidth = '1px',
    borderRadius = 0,
  } = comp.props;
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
    if (mode === 'editor') return; // 에디터 모드에서는 API 호출 안함

    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl =
      API_BASE_URL ||
      (typeof window !== 'undefined' ? window.API_BASE_URL : null);

    if (!actualPageId || !actualApiBaseUrl) {
      return;
    }

    try {
      const apiUrl = `${actualApiBaseUrl}/users/pages/${actualPageId}/comments/${comp.id}`;

      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error(
          '❌ CommentRenderer - API 응답 오류:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('❌ CommentRenderer - 댓글 조회 실패:', error);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content || !newComment.password) {
      showError('모든 필드를 입력해주세요.');
      return;
    }

    const actualPageId = pageId || comp.pageId;
    const actualApiBaseUrl =
      API_BASE_URL ||
      (typeof window !== 'undefined' ? window.API_BASE_URL : null);

    if (!actualPageId || !actualApiBaseUrl) {
      showError('페이지 정보를 찾을 수 없습니다. 페이지를 새로고침해주세요.');
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
        await fetchComments(); // 댓글 목록 새로고침
      } else {
        showError(
          `댓글 등록에 실패했습니다. (${response.status}: ${response.statusText})`
        );
      }
    } catch (error) {
      showError(`댓글 등록에 실패했습니다. 네트워크 오류: ${error.message}`);
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async () => {
    if (!deletePassword) {
      showError('비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${comp.pageId}/comments/${comp.id}/${showDeleteModal}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: deletePassword }),
        }
      );

      if (response.ok) {
        setShowDeleteModal(null);
        setDeletePassword('');
        fetchComments(); // 댓글 목록 새로고침
      } else {
        showError('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      showError('댓글 삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [comp.id, comp.pageId, mode]);

  // viewport에 따른 반응형 스타일 계산
  const getResponsiveStyles = () => {
    const isMobile = viewport === 'mobile';

    return {
      containerPadding: isMobile ? '16px' : '24px',
      titleFontSize: isMobile ? '16px' : '18px',
      inputPadding: isMobile ? '6px 10px' : '8px 12px',
      inputFontSize: isMobile ? '13px' : '14px',
      buttonPadding: isMobile ? '6px 12px' : '8px 16px',
      commentPadding: isMobile ? '12px' : '16px',
      minWidth: isMobile ? '200px' : '250px',
      minHeight: isMobile ? '120px' : '150px',
      gridColumns: isMobile ? '1fr' : '1fr 1fr',
      textareaHeight: isMobile ? '60px' : '80px',
    };
  };

  const styles = getResponsiveStyles();

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
        width: '100%',
        height: '100%',
        borderRadius: borderRadius,
        border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
        backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        fontFamily: fontFamily,
        padding: styles.containerPadding,
      }}
    >
      <h3
        style={{
          fontSize: styles.titleFontSize,
          fontWeight: fontWeight === 'bold' ? 'bold' : '600',
          marginBottom: '16px',
          color: comp.props?.color || '#1f2937',
          whiteSpace: 'pre-wrap',
          fontFamily: fontFamily,
          textAlign: textAlign,
          lineHeight: lineHeight,
          letterSpacing: letterSpacing + 'px',
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
          marginBottom: viewport === 'mobile' ? '16px' : '24px',
          padding: styles.commentPadding,
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gridTemplateColumns: styles.gridColumns,
            gap: viewport === 'mobile' ? '8px' : '12px',
            marginBottom: viewport === 'mobile' ? '8px' : '12px',
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
              padding: styles.inputPadding,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: styles.inputFontSize,
              fontFamily: fontFamily,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={newComment.password}
            onChange={(e) =>
              setNewComment({ ...newComment, password: e.target.value })
            }
            style={{
              padding: styles.inputPadding,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: styles.inputFontSize,
              fontFamily: fontFamily,
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
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
            padding: styles.inputPadding,
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: styles.inputFontSize,
            fontFamily: fontFamily,
            outline: 'none',
            resize: 'none',
            minHeight: styles.textareaHeight,
            whiteSpace: 'pre-wrap',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
          rows="3"
        />
        <button
          type="submit"
          disabled={mode === 'editor'}
          style={{
            marginTop: viewport === 'mobile' ? '8px' : '12px',
            padding: styles.buttonPadding,
            borderRadius: '6px',
            fontSize: styles.inputFontSize,
            border: 'none',
            cursor: mode === 'editor' ? 'not-allowed' : 'pointer',
            backgroundColor: mode === 'editor' ? '#d1d5db' : '#2563eb',
            color: mode === 'editor' ? '#6b7280' : '#ffffff',
            transition: 'background-color 0.2s',
            whiteSpace: 'pre-wrap',
          }}
          onMouseOver={(e) => {
            if (mode !== 'editor') e.target.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            if (mode !== 'editor') e.target.style.backgroundColor = '#2563eb';
          }}
        >
          {mode === 'editor' ? '배포 후 사용 가능' : '댓글 작성'}
        </button>
      </form>

      {/* 댓글 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mode === 'editor' ? (
          <>
            <div
              style={{
                position: 'relative',
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                disabled={true}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#d1d5db',
                  cursor: 'not-allowed',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  샘플 사용자
                </div>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  이곳에 댓글이 표시됩니다. 배포 후에 실제 댓글을 작성할 수
                  있습니다.
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                  }}
                >
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
            <div
              style={{
                position: 'relative',
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                disabled={true}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#d1d5db',
                  cursor: 'not-allowed',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                }}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: '500',
                    color: '#1f2937',
                    marginBottom: '4px',
                  }}
                >
                  또 다른 사용자
                </div>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  댓글 예시입니다.
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                  }}
                >
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </>
        ) : comments.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '32px 0',
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
                padding: styles.commentPadding,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            >
              <button
                onClick={() => setShowDeleteModal(comment.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '24px',
                  height: '24px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  fontSize: '16px',
                  transition: 'color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.color = '#ef4444')}
                onMouseOut={(e) => (e.target.style.color = '#9ca3af')}
              >
                ×
              </button>
              <div style={{ paddingRight: '32px' }}>
                <div
                  style={{
                    fontWeight: fontWeight === 'bold' ? 'bold' : '500',
                    color: comp.props?.color || '#1f2937',
                    marginBottom: '4px',
                    fontFamily: fontFamily,
                    textAlign: textAlign,
                    letterSpacing: letterSpacing + 'px',
                    textDecoration: textDecoration,
                    transform: italicTransform,
                  }}
                >
                  {comment.author}
                </div>
                <div
                  style={{
                    color: comp.props?.color || '#4b5563',
                    fontSize: '14px',
                    lineHeight: lineHeight,
                    whiteSpace: 'pre-wrap',
                    fontFamily: fontFamily,
                    textAlign: textAlign,
                    letterSpacing: letterSpacing + 'px',
                    textDecoration: textDecoration,
                    transform: italicTransform,
                  }}
                >
                  {comment.content}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
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
              padding: styles.containerPadding,
              borderRadius: '8px',
              width: viewport === 'mobile' ? '280px' : '320px',
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              댓글 삭제
            </h3>
            <p
              style={{
                color: '#4b5563',
                marginBottom: '16px',
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
                padding: styles.inputPadding,
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                marginBottom: viewport === 'mobile' ? '12px' : '16px',
                outline: 'none',
                fontSize: styles.inputFontSize,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
              onKeyPress={(e) => e.key === 'Enter' && handleDeleteComment()}
            />
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              <button
                onClick={handleDeleteComment}
                style={{
                  flex: 1,
                  padding: styles.buttonPadding,
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: styles.inputFontSize,
                  whiteSpace: 'pre-wrap',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#b91c1c')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#dc2626')}
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
                  padding: styles.buttonPadding,
                  backgroundColor: '#d1d5db',
                  color: '#374151',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontSize: styles.inputFontSize,
                  whiteSpace: 'pre-wrap',
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = '#9ca3af')
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = '#d1d5db')}
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
