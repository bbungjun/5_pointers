import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';

/**
 * 시나리오 2: 컴포넌트 단위 주석 및 토론
 * 
 * Figma의 주석 시스템과 같은 컴포넌트별 토론 기능
 * - 특정 컴포넌트에 주석 핀 생성
 * - 주석별 댓글 스레드 관리
 * - 주석 해결(Resolve) 상태 관리
 * - 실시간 주석 동기화
 */
export function useComments(ydoc, currentUser) {
  const [comments, setComments] = useState(new Map());
  const [commentMode, setCommentMode] = useState(false);
  
  // Y.js 데이터 구조: Y.Map<componentId, Y.Array<comment>>
  const yComments = ydoc?.getMap?.('comments');
  const yCommentThreads = ydoc?.getMap?.('commentThreads');

  // 새 주석 추가
  const addComment = useCallback((componentId, position, initialText) => {
    if (!yComments || !yCommentThreads || !currentUser) return;

    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 주석 메타데이터 (위치, 상태 등)
    const commentMeta = {
      id: commentId,
      componentId,
      position, // { x, y } 캔버스 내 위치
      isResolved: false,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    // 댓글 스레드 초기화
    const thread = new Y.Array();
    const firstComment = {
      id: `reply_${Date.now()}`,
      author: currentUser.name,
      authorId: currentUser.id,
      text: initialText,
      createdAt: new Date().toISOString()
    };
    thread.push([firstComment]);

    // Y.js에 저장
    yComments.set(commentId, commentMeta);
    yCommentThreads.set(commentId, thread);

    return commentId;
  }, [yComments, yCommentThreads, currentUser]);

  // 주석에 댓글 추가
  const addReply = useCallback((commentId, text) => {
    if (!yCommentThreads || !currentUser) return;

    const thread = yCommentThreads.get(commentId);
    if (!thread) return;

    const reply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      author: currentUser.name,
      authorId: currentUser.id,
      text,
      createdAt: new Date().toISOString()
    };

    thread.push([reply]);
  }, [yCommentThreads, currentUser]);

  // 주석 해결/재개
  const toggleResolveComment = useCallback((commentId) => {
    if (!yComments) return;

    const comment = yComments.get(commentId);
    if (!comment) return;

    // Y.js의 Map은 직접 수정할 수 없으므로 새 객체를 설정
    yComments.set(commentId, {
      ...comment,
      isResolved: !comment.isResolved,
      resolvedAt: !comment.isResolved ? new Date().toISOString() : null,
      resolvedBy: !comment.isResolved ? currentUser.id : null
    });
  }, [yComments, currentUser]);

  // 주석 삭제
  const deleteComment = useCallback((commentId) => {
    if (!yComments || !yCommentThreads) return;

    yComments.delete(commentId);
    yCommentThreads.delete(commentId);
  }, [yComments, yCommentThreads]);

  // 특정 컴포넌트의 주석들 가져오기
  const getCommentsForComponent = useCallback((componentId) => {
    const componentComments = [];
    
    comments.forEach((comment, commentId) => {
      if (comment.componentId === componentId && !comment.isResolved) {
        componentComments.push({
          id: commentId,
          ...comment
        });
      }
    });

    return componentComments;
  }, [comments]);

  // Y.js 데이터 변화 감지 및 React 상태 업데이트
  useEffect(() => {
    if (!yComments || !yCommentThreads) return;

    const updateComments = () => {
      try {
        const commentsMap = new Map();

        // 주석 메타데이터 수집
        yComments.forEach((commentMeta, commentId) => {
          const thread = yCommentThreads.get(commentId);
          const replies = thread ? thread.toArray() : [];

          commentsMap.set(commentId, {
            ...commentMeta,
            replies,
            replyCount: replies.length
          });
        });

        setComments(commentsMap);
      } catch (error) {
        console.error('주석 업데이트 중 오류:', error);
      }
    };

    // 초기 데이터 로드
    updateComments();

    // Y.js 변화 이벤트 리스너
    try {
      yComments.observe(updateComments);
      yCommentThreads.observe(updateComments);
    } catch (error) {
      console.error('Y.js 이벤트 리스너 등록 실패:', error);
    }

    return () => {
      try {
        yComments.unobserve(updateComments);
        yCommentThreads.unobserve(updateComments);
      } catch (error) {
        console.error('Y.js 이벤트 리스너 해제 실패:', error);
      }
    };
  }, [yComments, yCommentThreads]);

  // 주석 모드 토글
  const toggleCommentMode = useCallback(() => {
    setCommentMode(prev => !prev);
  }, []);

  return {
    comments: Array.from(comments.entries()).map(([id, comment]) => ({
      id,
      ...comment
    })),
    commentMode,
    addComment,
    addReply,
    toggleResolveComment,
    deleteComment,
    getCommentsForComponent,
    toggleCommentMode
  };
} 