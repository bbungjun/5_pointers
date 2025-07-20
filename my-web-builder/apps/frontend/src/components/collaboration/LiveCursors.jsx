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
  canvasRef = null // 캔버스 ref 추가
}) => {
  const scale = zoom / 100;

  return (
    <>
      {cursors.map((cursor, index) => {
        const userWithColor = addUserColor(cursor.user);
        const chatMessage = cursorChatMessages[userWithColor.id] || cursorChatMessages[String(userWithColor.id)];
        
        // 캔버스 좌표를 화면 좌표로 변환
        // 스크롤 오프셋을 고려하여 정확한 위치 계산
        const displayX = cursor.x * scale;
        const displayY = cursor.y * scale;

        // 스크롤 컨테이너의 스크롤 위치 고려 (렌더링 시에는 빼야 함)
        const scrollContainer = canvasRef?.current?.closest('[style*="overflow"]') || 
                               canvasRef?.current?.parentElement;
        const scrollLeft = scrollContainer?.scrollLeft || 0;
        const scrollTop = scrollContainer?.scrollTop || 0;

        // 최종 화면 좌표 계산 (스크롤 오프셋 제거)
        const finalX = displayX - scrollLeft;
        const finalY = displayY - scrollTop;

        // 디버깅을 위한 로그 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log('커서 렌더링:', {
            cursorId: cursor.id,
            storedX: cursor.x,
            storedY: cursor.y,
            scale,
            displayX,
            displayY,
            scrollOffset: { left: scrollLeft, top: scrollTop },
            finalX,
            finalY,
            user: userWithColor.name
          });
        }

        return (
          <div
            key={`cursor-${cursor.id || index}`}
            style={{
              position: 'absolute',
              left: finalX,
              top: finalY,
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