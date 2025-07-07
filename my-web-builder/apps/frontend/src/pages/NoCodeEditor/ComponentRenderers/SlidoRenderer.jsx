import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../../config';

function SlidoRenderer({ comp, isEditor = false }) {
  const { question, placeholder, backgroundColor } = comp.props;
  const [opinions, setOpinions] = useState([]);
  const [newOpinion, setNewOpinion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opinionGroups, setOpinionGroups] = useState({});
  const [centerPopup, setCenterPopup] = useState(null);
  const [scatteredOpinions, setScatteredOpinions] = useState([]);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  // 동일한 의견 그룹화 함수
  const groupOpinions = (opinions) => {
    const groups = {};
    opinions.forEach(opinion => {
      const normalizedContent = opinion.content.trim().toLowerCase();
      if (!groups[normalizedContent]) {
        groups[normalizedContent] = [];
      }
      groups[normalizedContent].push(opinion);
    });
    return groups;
  };

  // 텍스트 크기 추정 함수 (단순화)
  const estimateTextSize = (text, fontSize, groupSize) => {
    const baseWidth = text.length * fontSize * 0.7; // 조금 더 여유있게
    const padding = groupSize >= 3 ? 60 : groupSize >= 2 ? 40 : 30; // 패딩 여유있게
    const countWidth = groupSize >= 2 ? 35 : 0; // ×2, ×3 등의 추가 공간
    
    // 그룹 크기에 따른 스케일 적용
    const groupScale = [1, 1.2, 1.4, 1.6, 1.8][Math.min(groupSize - 1, 4)];
    
    return {
      width: (baseWidth + padding + countWidth) * groupScale,
      height: (fontSize + 30) * groupScale // 높이도 여유있게
    };
  };

  // 컨테이너 크기 가져오기 (더 안전한 계산)
  const getContainerSize = () => {
    let containerWidth = 300; // 더 보수적인 기본값
    let containerHeight = 150; // 더 보수적인 기본값
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // 패딩과 여백을 고려한 실제 사용 가능한 공간
      const padding = 40; // 20px 패딩 + 20px 추가 여백
      const formHeight = 100; // 입력 폼과 제목이 차지하는 공간
      
      containerWidth = Math.max(rect.width - padding, 200);
      containerHeight = Math.max(rect.height - formHeight - padding, 100);
    }
    
    return { containerWidth, containerHeight };
  };

  // 안전한 위치 생성 함수 (강화된 경계 검사)
  const generateRandomPosition = (textSize) => {
    const { containerWidth, containerHeight } = getContainerSize();
    
    // 텍스트 크기에 안전 여백 추가
    const margin = 15;
    const totalWidth = textSize.width + margin * 2;
    const totalHeight = textSize.height + margin * 2;
    
    // 컨테이너보다 텍스트가 큰 경우 처리
    if (totalWidth >= containerWidth || totalHeight >= containerHeight) {
      return {
        x: margin,
        y: margin,
        rotation: 0,
        scale: 0.8 // 작게 스케일링
      };
    }
    
    // 안전한 영역 내에서만 위치 생성
    const maxX = containerWidth - totalWidth;
    const maxY = containerHeight - totalHeight;
    
    return {
      x: margin + Math.random() * Math.max(maxX, 0),
      y: margin + Math.random() * Math.max(maxY, 0),
      rotation: (Math.random() - 0.5) * 6, // 회전 더 줄임 (-3도 ~ +3도)
      scale: 0.9 + Math.random() * 0.1 // 스케일 더 보수적 (0.9 ~ 1.0)
    };
  };

  // 두 텍스트 박스의 충돌 확인 (회전 고려)
  const checkCollision = (pos1, size1, pos2, size2) => {
    const margin = 15; // 최소 간격
    
    // 간단한 사각형 충돌 감지 (회전은 근사치로 처리)
    const rect1 = {
      left: pos1.x - margin,
      right: pos1.x + size1.width + margin,
      top: pos1.y - margin,
      bottom: pos1.y + size1.height + margin
    };
    
    const rect2 = {
      left: pos2.x - margin,
      right: pos2.x + size2.width + margin,
      top: pos2.y - margin,
      bottom: pos2.y + size2.height + margin
    };
    
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
  };

  // 의견을 산재된 형태로 변환 (안전하고 단순한 배치)
  const createScatteredOpinions = (opinions, groups) => {
    const usedPositions = [];
    const uniqueOpinions = new Map();
    
    // 중복 제거: 같은 내용의 의견은 하나만 유지
    opinions.forEach(opinion => {
      const normalizedContent = opinion.content.trim().toLowerCase();
      if (!uniqueOpinions.has(normalizedContent)) {
        uniqueOpinions.set(normalizedContent, {
          ...opinion,
          groupSize: groups[normalizedContent]?.length || 1,
          isNew: !scatteredOpinions.find(existing => 
            existing.content.trim().toLowerCase() === normalizedContent
          )
        });
      }
    });
    
    // 고유한 의견들에 대해 위치 생성
    return Array.from(uniqueOpinions.values()).map((opinion, index) => {
      const fontSize = [14, 16, 18, 20, 22][Math.min(opinion.groupSize - 1, 4)];
      
      // 먼저 텍스트 크기 계산
      const textSize = estimateTextSize(opinion.content, fontSize, opinion.groupSize);
      
      let position;
      let attempts = 0;
      let validPosition = false;
      
      // 안전한 위치 찾기
      while (attempts < 20 && !validPosition) {
        position = generateRandomPosition(textSize);
        
        // 다른 요소와의 충돌 확인
        const hasCollision = usedPositions.some(used => 
          checkCollision(position, textSize, used.position, used.size)
        );
        
        if (!hasCollision) {
          validPosition = true;
          usedPositions.push({ position, size: textSize });
        }
        
        attempts++;
      }
      
      // 유효한 위치를 찾지 못한 경우 안전한 그리드 배치
      if (!validPosition) {
        const { containerWidth, containerHeight } = getContainerSize();
        
        // 텍스트 크기를 고려한 그리드 간격
        const cellWidth = Math.max(textSize.width + 20, 80);
        const cellHeight = Math.max(textSize.height + 20, 40);
        
        const cols = Math.max(Math.floor(containerWidth / cellWidth), 1);
        const rows = Math.max(Math.floor(containerHeight / cellHeight), 1);
        
        const col = index % cols;
        const row = Math.floor(index / cols) % rows;
        
        // 그리드 위치도 컨테이너 경계 내에서 계산
        const gridX = col * cellWidth + 10;
        const gridY = row * cellHeight + 10;
        
        // 경계 검사
        const maxAllowedX = containerWidth - textSize.width - 10;
        const maxAllowedY = containerHeight - textSize.height - 10;
        
        position = {
          x: Math.min(gridX, Math.max(maxAllowedX, 10)),
          y: Math.min(gridY, Math.max(maxAllowedY, 10)),
          rotation: 0, // 그리드 배치에서는 회전 없음
          scale: 0.85 // 그리드에서는 조금 작게
        };
      }
      
      return {
        ...opinion,
        ...position,
        textSize
      };
    });
  };

  // 의견 목록 조회
  const fetchOpinions = async () => {
    if (isEditor) return; // 에디터 모드에서는 API 호출 안함
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/pages/${comp.pageId}/slido/${comp.id}`);
      if (response.ok) {
        const data = await response.json();
        setOpinions(data);
        
        // 의견 그룹 업데이트
        const groups = groupOpinions(data);
        setOpinionGroups(groups);
        
        // 산재된 의견 생성
        const scattered = createScatteredOpinions(data, groups);
        setScatteredOpinions(scattered);
      }
    } catch (error) {
      console.error('의견 조회 실패:', error);
    }
  };

  // 의견 작성
  const handleSubmitOpinion = async (e) => {
    e.preventDefault();
    if (!newOpinion.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const submittedContent = newOpinion.trim();
    
    try {
      console.log('API 요청 시작:', {
        url: `${API_BASE_URL}/users/pages/${comp.pageId}/slido/${comp.id}`,
        pageId: comp.pageId,
        componentId: comp.id,
        content: submittedContent
      });

      const response = await fetch(`${API_BASE_URL}/users/pages/${comp.pageId}/slido/${comp.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ content: submittedContent })
      });

      console.log('API 응답 상태:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API 응답 성공:', result);
        
        // 의견 제출 후 팝업 표시 (한 번만)
        setCenterPopup(submittedContent);
        setTimeout(() => setCenterPopup(null), 2000);
        
        setNewOpinion('');
        await fetchOpinions(); // 의견 목록 새로고침
      } else {
        const errorText = await response.text();
        console.error('API 응답 에러:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        alert(`의견 제출에 실패했습니다. (${response.status}: ${response.statusText})`);
      }
    } catch (error) {
      console.error('의견 제출 실패:', error);
      alert(`의견 제출에 실패했습니다. 네트워크 오류: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  // 실시간 업데이트를 위한 폴링
  useEffect(() => {
    if (!isEditor) {
      fetchOpinions(); // 초기 로드
      intervalRef.current = setInterval(fetchOpinions, 5000); // 5초마다 업데이트 (팝업 없이)
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [comp.id, comp.pageId, isEditor]);



  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        padding: '20px',
        borderRadius: '16px',
        border: isEditor ? '2px dashed #3b82f6' : '2px solid #e5e7eb',
        backgroundColor: backgroundColor || '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            transform: translateY(-20px) scale(0.9);
            opacity: 0;
          }
          50% {
            transform: translateY(0) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            background-color: #f8f9fa;
          }
          50% {
            background-color: #e9ecef;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          50% {
            box-shadow: 0 8px 24px rgba(255, 148, 0, 0.4);
          }
        }

        @keyframes centerPopup {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          20% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes popIn {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.3) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(var(--rotation, 0deg));
            opacity: 1;
          }
        }
        
        .pulsing {
          animation: pulse 2s infinite;
        }
        
        .glowing {
          animation: glow 2s infinite;
        }
      `}</style>

      {/* 질문 제목 */}
      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#1f2937',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {question || '💭 여러분의 의견을 들려주세요'}
      </div>

      {/* 의견 입력 폼 */}
      {!isEditor && (
        <form onSubmit={handleSubmitOpinion} style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder={placeholder || "💬 의견을 입력하세요..."}
              value={newOpinion}
              onChange={(e) => setNewOpinion(e.target.value)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '30px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s ease',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newOpinion.trim()}
            style={{
              padding: '16px 24px',
              borderRadius: '30px',
              border: 'none',
              background: isSubmitting || !newOpinion.trim() 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isSubmitting || !newOpinion.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '80px',
              boxShadow: isSubmitting || !newOpinion.trim() 
                ? 'none' 
                : '0 4px 12px rgba(102, 126, 234, 0.25)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && newOpinion.trim()) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && newOpinion.trim()) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.25)';
              }
            }}
          >
            {isSubmitting ? '⏳' : '🚀'}
          </button>
        </form>
      )}

      {/* 에디터 모드용 입력 폼 미리보기 */}
      {isEditor && (
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          opacity: 0.7
        }}>
          <div style={{
            flex: 1,
            padding: '16px 20px',
            border: '2px solid #e5e7eb',
            borderRadius: '30px',
            fontSize: '15px',
            backgroundColor: '#f8f9fa',
            color: '#6b7280'
          }}>
            💬 의견을 입력하세요...
          </div>
          <div style={{
            padding: '16px 24px',
            borderRadius: '30px',
            background: '#d1d5db',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '600',
            minWidth: '80px',
            textAlign: 'center'
          }}>
            🚀
          </div>
        </div>
      )}

      {/* 산재된 의견 표시 영역 */}
      <div style={{
        flex: 1,
        position: 'relative',
        minHeight: '200px',
        height: 'auto',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: 'rgba(248, 250, 252, 0.5)'
      }}>
        {isEditor ? (
          // 에디터 모드에서 샘플 의견들 (전체 공간 활용)
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px' }}>
            <div style={{
              position: 'absolute',
              left: '5%',
              top: '10%',
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: '600',
              transform: 'rotate(-5deg) scale(1.2)',
              boxShadow: '0 8px 20px rgba(255, 152, 0, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              좋은 아이디어네요! ×2
            </div>
            <div style={{
              position: 'absolute',
              right: '8%',
              top: '25%',
              background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
              color: 'white',
              padding: '14px 22px',
              borderRadius: '30px',
              fontSize: '18px',
              fontWeight: '700',
              transform: 'rotate(8deg) scale(1.4)',
              boxShadow: '0 10px 25px rgba(156, 39, 176, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.4)'
            }}>
              완전 대박! ×3
            </div>
            <div style={{
              position: 'absolute',
              left: '60%',
              top: '50%',
              background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
              color: 'white',
              padding: '16px 30px',
              borderRadius: '35px',
              fontSize: '22px',
              fontWeight: '700',
              transform: 'rotate(3deg) scale(1.8)',
              boxShadow: '0 12px 30px rgba(33, 150, 243, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.4)'
            }}>
              최고예요! ×5
            </div>
            <div style={{
              position: 'absolute',
              left: '15%',
              bottom: '30%',
              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '15px',
              fontSize: '14px',
              fontWeight: '500',
              transform: 'rotate(-8deg)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            }}>
              동감이에요 💚
            </div>
            <div style={{
              position: 'absolute',
              right: '20%',
              bottom: '10%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: '600',
              transform: 'rotate(12deg) scale(1.2)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}>
              멋져요! ×2
            </div>
            <div style={{
              position: 'absolute',
              left: '45%',
              top: '75%',
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              padding: '12px 22px',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: '700',
              transform: 'rotate(-3deg) scale(1.6)',
              boxShadow: '0 8px 20px rgba(244, 67, 54, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.4)'
            }}>
              진짜 좋다! ×4
            </div>
            
            {/* 안내 텍스트 */}
            <div style={{
              position: 'absolute',
              bottom: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              color: '#6b7280',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '6px 12px',
              borderRadius: '15px',
              border: '1px dashed #d1d5db',
              backdropFilter: 'blur(10px)'
            }}>
              전체 공간에 의견이 자유롭게 배치됩니다
            </div>
          </div>
        ) : scatteredOpinions.length === 0 ? (
          // 의견이 없을 때
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <div>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px',
                animation: 'bounce 2s infinite'
              }}>✨</div>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>
                첫 번째 의견을 기다리고 있어요
              </div>
            </div>
          </div>
        ) : (
          // 산재된 의견들 표시
          scatteredOpinions.map((opinion) => {
            // 그룹 크기에 따른 스타일 계산
            const getOpinionStyle = (groupSize) => {
              const colors = [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 1개
                'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', // 2개
                'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', // 3개
                'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)', // 4개
                'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'  // 5개+
              ];
              
              const sizes = [14, 16, 18, 20, 22]; // 폰트 크기
              const scales = [1, 1.2, 1.4, 1.6, 1.8]; // 전체 스케일
              const paddings = [
                '8px 14px',
                '10px 18px', 
                '12px 22px',
                '14px 26px',
                '16px 30px'
              ];
              
              const index = Math.min(groupSize - 1, 4);
              
              return {
                background: colors[index],
                fontSize: `${sizes[index]}px`,
                padding: paddings[index],
                transform: `rotate(${opinion.rotation}deg) scale(${opinion.scale * scales[index]})`,
                boxShadow: groupSize >= 3 
                  ? '0 12px 30px rgba(0,0,0,0.3)' 
                  : '0 6px 20px rgba(0,0,0,0.2)',
                border: groupSize >= 3 
                  ? '3px solid rgba(255, 255, 255, 0.4)' 
                  : '2px solid rgba(255, 255, 255, 0.3)'
              };
            };
            
            const style = getOpinionStyle(opinion.groupSize);
            
            return (
              <div
                key={opinion.id}
                style={{
                  position: 'absolute',
                  left: `${opinion.x}px`,
                  top: `${opinion.y}px`,
                  ...style,
                  color: 'white',
                  borderRadius: '25px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'default',
                  transition: 'all 0.5s ease',
                  animation: opinion.isNew ? 'popIn 0.6s ease-out' : 'none',
                  zIndex: opinion.groupSize
                }}
                title={opinion.content} // 긴 텍스트를 위한 툴팁
              >
                {opinion.content}
                {opinion.groupSize >= 2 && (
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '0.8em',
                    opacity: 0.9
                  }}>
                    ×{opinion.groupSize}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 실시간 표시기 */}
      {!isEditor && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#6b7280',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '6px 12px',
          borderRadius: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            animation: 'pulse 2s infinite'
          }} />
          <span style={{ fontWeight: '600' }}>LIVE</span>
        </div>
      )}

      {/* 중앙 팝업 */}
      {centerPopup && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '24px',
          fontSize: '20px',
          fontWeight: '700',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          animation: 'centerPopup 2s ease-in-out',
          zIndex: 1000,
          maxWidth: '90%',
          wordBreak: 'break-word',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ 
            fontSize: '28px', 
            marginBottom: '8px'
          }}>
            🎉
          </div>
          {centerPopup}
        </div>
      )}

    </div>
  );
}

export default SlidoRenderer;