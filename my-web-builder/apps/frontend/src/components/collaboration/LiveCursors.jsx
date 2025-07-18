import React, { useEffect, useMemo, useCallback } from 'react';
import { addUserColor } from '../../utils/userColors';

/**
 * 채팅 메시지 컴포넌트 - 메모이제이션으로 깜빡임 방지
 */
const ChatMessage = React.memo(({ userWithColor, message }) => {
  if (!message) {
    return (
      <span>{userWithColor.name || '사용자'}</span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{userWithColor.name}</span>
      <span style={{ fontSize: '16px' }}>{message}</span>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

/**
 * 성능 최적화된 실시간 커서 컴포넌트
 */
export const LiveCursors = React.memo(({ cursors = [], zoom = 100, viewport = 'desktop', cursorChatMessages = {} }) => {
  console.log('🎯 LiveCursors props 받음:', { cursorChatMessages, cursorsLength: cursors.length });
  const scale = zoom / 100;
  
  // 커서 데이터 메모이제이션
  const processedCursors = useMemo(() => {
    if (!Array.isArray(cursors) || cursors.length === 0) return [];
    
    return cursors
      .filter(cursor => cursor && cursor.user)
      .map((cursor, index) => {
        const userWithColor = addUserColor(cursor.user);
        const displayX = cursor.x * scale;
        const displayY = cursor.y * scale;
        const chatMessage = cursorChatMessages[userWithColor.id] || cursorChatMessages[String(userWithColor.id)];
        
        return {
          ...cursor,
          userWithColor,
          displayX,
          displayY,
          chatMessage,
          key: `cursor-${cursor.user.id || index}-${index}`
        };
      });
  }, [cursors, scale, cursorChatMessages]);
  
  // 커서 렌더링 함수 메모이제이션 - cursorChatMessages 의존성 제거
  const renderCursor = useCallback((cursorData) => {
    const { userWithColor, displayX, displayY, chatMessage, key } = cursorData;
    
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: displayX,
          top: displayY,
          pointerEvents: 'none',
          zIndex: 9999,
          transform: 'translate(-2px, -2px)',
          transition: 'left 0.1s ease-out, top 0.1s ease-out',
        }}
      >
        {/* 커서 아이콘 */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.2))`
          }}
        >
          <path
            d="M3 3L21 12L12 21L9 12L3 3Z"
            fill={userWithColor.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        
        {/* 사용자 이름표 - 항상 표시 */}
        <div
          style={{
            position: 'absolute',
            left: 16,
            top: -4,
            backgroundColor: userWithColor.color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxWidth: '200px',
            wordWrap: 'break-word'
          }}
        >
          <ChatMessage userWithColor={userWithColor} message={chatMessage} />
        </div>
      </div>
    );
  }, []); // cursorChatMessages 의존성 제거
  
  return (
    <>
      {processedCursors.map(renderCursor)}
    </>
  );
});

LiveCursors.displayName = 'LiveCursors';

/**
 * 성능 최적화된 협업 선택 영역 컴포넌트
 */
export const CollaborativeSelections = React.memo(({ 
  selections = [], 
  components = [], 
  zoom = 100, 
  viewport = 'desktop', 
  getComponentDimensions 
}) => {
  const scale = zoom / 100;
  
  // 선택 데이터 메모이제이션
  const processedSelections = useMemo(() => {
    if (!Array.isArray(selections) || selections.length === 0) return [];
    
    // 현재 뷰포트와 일치하는 선택 상태만 필터링
    const filteredSelections = selections.filter(selection => 
      selection.viewport === viewport
    );
    
    return filteredSelections
      .filter(selection => Array.isArray(selection.componentIds))
      .flatMap(selection => {
        const userWithColor = addUserColor(selection.user);
        
        return selection.componentIds.map(componentId => {
          const component = components.find(c => c.id === componentId);
          if (!component) return null;

          const componentX = component.x || 0;
          const componentY = component.y || 0;
          const componentWidth = component.width || 150;
          const componentHeight = component.height || 50;
          
          const scaledX = componentX * scale;
          const scaledY = componentY * scale;
          const scaledWidth = componentWidth * scale;
          const scaledHeight = componentHeight * scale;

          return {
            componentId,
            userWithColor,
            scaledX,
            scaledY,
            scaledWidth,
            scaledHeight,
            key: `selection-${selection.user?.id || 'unknown'}-${componentId}`
          };
        }).filter(Boolean);
      });
  }, [selections, components, viewport, scale]);
  
  // 선택 영역 렌더링 함수 메모이제이션
  const renderSelection = useCallback((selectionData) => {
    const { 
      componentId, 
      userWithColor, 
      scaledX, 
      scaledY, 
      scaledWidth, 
      scaledHeight, 
      key 
    } = selectionData;
    
    return (
      <div
        key={key}
        style={{
          position: 'absolute',
          left: scaledX - 2,
          top: scaledY - 2,
          width: scaledWidth + 4,
          height: scaledHeight + 4,
          border: `2px solid ${userWithColor.color}`,
          borderRadius: '4px',
          pointerEvents: 'none',
          zIndex: 8,
          animation: 'pulseSelection 2s infinite'
        }}
      >
        {/* 선택한 사용자 이름표 */}
        <div
          style={{
            position: 'absolute',
            top: -28,
            left: 0,
            backgroundColor: userWithColor.color,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {userWithColor.name || '사용자'}님이 편집 중
        </div>
      </div>
    );
  }, []);
  
  return (
    <>
      {processedSelections.map(renderSelection)}
      
      <style>{`
        @keyframes pulseSelection {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
});

CollaborativeSelections.displayName = 'CollaborativeSelections';