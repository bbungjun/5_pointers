import React from 'react';
import { addUserColor } from '../../utils/userColors';

/**
 * 채팅 메시지 컴포넌트 - 줌 레벨과 관계없이 고정 크기
 */
const ChatMessage = React.memo(({ userWithColor, message }) => {
  if (!message) {
    return <span style={{ fontSize: '12px' }}>{userWithColor.name || '사용자'}</span>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{userWithColor.name}</span>
      <span style={{ fontSize: '14px' }}>{message}</span>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

/**
 * 실시간 커서 컴포넌트
 */
export const LiveCursors = React.memo(({ 
  cursors = [], 
  zoom = 100, 
  viewport = 'desktop', 
  cursorChatMessages = {},
  canvasRef = null
}) => {
  const currentScale = Math.max(zoom / 100, 0.1);

  return (
    <>
      {cursors.map((cursor, index) => {
        const userWithColor = addUserColor(cursor.user);
        const chatMessage = cursorChatMessages[userWithColor.id] || cursorChatMessages[String(userWithColor.id)];
        
        // 콘텐츠 좌표를 원본 크기 기준으로 변환 (캔버스 transform 무시)
        // cursor.x, cursor.y는 이미 콘텐츠 좌표이므로 그대로 사용
        const displayX = cursor.x;
        const displayY = cursor.y;

        console.log('커서 위치 표시 (transform 독립):', {
          사용자: userWithColor.name,
          콘텐츠좌표: { x: cursor.x, y: cursor.y },
          현재줌: zoom + '%',
          표시좌표: { displayX, displayY }
        });

        return (
          <div
            key={`cursor-${cursor.id || index}`}
            style={{
              position: 'absolute',
              left: displayX,
              top: displayY,
              pointerEvents: 'none',
              zIndex: 9999,
              // 캔버스의 transform을 상쇄하여 실제 크기로 표시
              transform: `scale(${1 / currentScale}) translate(-2px, -2px)`,
              transformOrigin: 'top left',
              transition: 'left 0.1s ease-out, top 0.1s ease-out',
            }}
          >
            {/* 커서 아이콘 - 줌 레벨과 관계없이 고정 크기 */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                transform: `scale(${1 / currentScale})`, // 현재 줌 레벨에 반비례하여 크기 조정
                transformOrigin: 'left top' // 왼쪽 상단 기준으로 변환
              }}
            >
              <path
                d="M3 3L21 12L12 21L9 12L3 3Z"
                fill={userWithColor.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            
            {/* 사용자 이름표 - 줌 레벨과 관계없이 고정 크기 */}
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
                wordWrap: 'break-word',
                transform: `scale(${1 / currentScale})`, // 줌 레벨에 반비례하여 크기 조정
                transformOrigin: 'left top' // 왼쪽 상단 기준으로 변환
              }}
            >
              <ChatMessage userWithColor={userWithColor} message={chatMessage} />
            </div>
          </div>
        );
      })}
    </>
  );
});

LiveCursors.displayName = 'LiveCursors';

/**
 * 협업 선택 영역 컴포넌트 - 비활성화됨
 */
export const CollaborativeSelections = React.memo(({ 
  selections = [], 
  components = [], 
  zoom = 100, 
  viewport = 'desktop', 
  getComponentDimensions 
}) => {
  // 상대방 선택 테두리 비활성화
  return null;
});

CollaborativeSelections.displayName = 'CollaborativeSelections';