import React from 'react';
import { addUserColor } from '../../utils/userColors';

/**
 * 채팅 메시지 컴포넌트 - 일관된 레이아웃 구조
 */
const ChatMessage = React.memo(({ userWithColor, message }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2px',
      minHeight: '16px' // 최소 높이로 레이아웃 안정성 확보
    }}>
      <span style={{ 
        fontWeight: 'bold', 
        fontSize: '12px',
        lineHeight: '14px'
      }}>
        {userWithColor.name || '사용자'}
      </span>
      {message && (
        <span style={{ 
          fontSize: '14px',
          lineHeight: '16px',
          marginTop: '2px'
        }}>
          {message}
        </span>
      )}
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
              // 매우 빠른 transition으로 실시간 추적감 향상
              transition: 'left 0.05s linear, top 0.05s linear',
              // 레이아웃 안정성을 위한 최소 크기 설정
              minWidth: '20px',
              minHeight: '20px',
              // GPU 가속 활성화
              willChange: 'left, top',
            }}
          >
            {/* 커서와 이름표를 하나의 그룹으로 묶어서 고정 크기 적용 */}
            <div
              style={{
                position: 'relative',
                // 줌 레벨과 관계없이 항상 동일한 크기 유지
                transform: `scale(1)`,
                transformOrigin: 'top left',
                // 스케일 변화에 대한 빠른 transition
                transition: 'transform 0.05s linear'
              }}
            >
              {/* 커서 아이콘 */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                }}
              >
                <path
                  d="M3 3L21 12L12 21L9 12L3 3Z"
                  fill={userWithColor.color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>
              
              {/* 사용자 이름표 - 커서와 동일한 스케일 그룹 내부 */}
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
                  // 레이아웃 안정성을 위한 설정
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  // 내용 변화에 대한 빠른 transition (채팅 메시지 표시/숨김)
                  transition: 'background-color 0.1s ease-out, box-shadow 0.1s ease-out',
                }}
              >
                <ChatMessage userWithColor={userWithColor} message={chatMessage} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
});

LiveCursors.displayName = 'LiveCursors';

/**
 * 협업 선택 영역 컴포넌트 - 다른 사용자가 선택한 컴포넌트 표시
 */
export const CollaborativeSelections = React.memo(({ 
  selections = [], 
  components = [], 
  zoom = 100, 
  viewport = 'desktop', 
  getComponentDimensions 
}) => {
  const currentScale = zoom / 100;

  // 모든 선택 정보 표시 (시간 제한 없음)
  if (selections.length === 0) {
    return null;
  }

  return (
    <>
      {selections.map((selection, index) => {
        const { user, componentIds } = selection;
        
        if (!user || !componentIds || componentIds.length === 0) {
          return null;
        }

        return componentIds.map((componentId) => {
          const component = components.find(comp => comp.id === componentId);
          if (!component || !user) return null;

          // 컴포넌트 크기 계산
          const dimensions = getComponentDimensions ? getComponentDimensions(component.type) : { width: 120, height: 40 };
          const componentWidth = component.width || dimensions.width;
          const componentHeight = component.height || dimensions.height;

          return (
            <div
              key={`collaborative-selection-${selection.id}-${componentId}`}
              style={{
                position: 'absolute',
                left: component.x,
                top: component.y,
                width: componentWidth,
                height: componentHeight,
                border: `3px solid ${user.color || '#666'}`,
                borderRadius: '4px',
                pointerEvents: 'none',
                zIndex: 1000,
                boxShadow: `0 0 8px ${(user.color || '#666')}40`,
              }}
            >
              {/* "편집 중" 메시지 */}
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '0px',
                  backgroundColor: user.color || '#666',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 1001,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0px',
                }}
              >
                {user.name || '사용자'} 편집 중
              </div>


            </div>
          );
        });
      })}


    </>
  );
});

CollaborativeSelections.displayName = 'CollaborativeSelections';