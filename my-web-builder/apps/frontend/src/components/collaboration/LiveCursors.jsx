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
  const scale = zoom / 100;

  return (
    <>
      {cursors.map((cursor, index) => {
        const userWithColor = addUserColor(cursor.user);
        const chatMessage = cursorChatMessages[userWithColor.id] || cursorChatMessages[String(userWithColor.id)];
        
        // 캔버스 내부 좌표를 화면 좌표로 변환
        const displayX = cursor.x * scale;
        const displayY = cursor.y * scale;

        return (
          <div
            key={`cursor-${cursor.id || index}`}
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
            {/* 커서 아이콘 - 줌 레벨과 관계없이 고정 크기 */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                transform: `scale(${1 / scale})`, // 줌 레벨에 반비례하여 크기 조정
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
                transform: `scale(${1 / scale})`, // 줌 레벨에 반비례하여 크기 조정
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