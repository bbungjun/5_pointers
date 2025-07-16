import React, { useState, useEffect } from 'react';

function AttendRenderer({ comp, mode = 'live', pageId, isEditor = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestSide, setGuestSide] = useState('');
  const [contact, setContact] = useState('');
  const [companionCount, setCompanionCount] = useState(0);
  const [mealOption, setMealOption] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 375);

  // 실제 화면 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = windowWidth;
  const scaleFactor = Math.min(actualWidth / baseWidth, 1.5); // 최대 1.5배까지만 확대
  
  // 원본 크기 정보 (더 작은 기본 크기로 설정)
  const containerWidth = comp.width || 280;
  const containerHeight = comp.height || 120; // 160 → 120으로 줄임
  
  // 화면 크기 변경 시 리렌더링
  useEffect(() => {
    if (mode === 'live' && typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [mode]);
  

  const handleSubmit = async () => {
    if (!attendeeName.trim() || !guestSide || !privacyConsent) return;

    setIsSubmitting(true);
    try {
      // pageId를 prop으로 받거나 comp에서 가져오기, 에디터에서는 URL에서 추출
      let targetPageId = pageId || comp.pageId;
      console.log('🔍 Initial pageId:', { pageId, compPageId: comp.pageId, initialTarget: targetPageId });
      
      // pageId가 없거나 임시 roomId인 경우 URL에서 실제 페이지 ID 추출
      if (!targetPageId || targetPageId.startsWith('room-')) {
        const pathParts = window.location.pathname.split('/').filter(p => p);
        console.log('🔍 URL pathParts:', pathParts);
        
        // 배포된 사이트: /{pageId} 형태 (Next.js 동적 라우팅)
        // 에디터: /editor/{pageId} 형태
        const editorIndex = pathParts.indexOf('editor');
        if (editorIndex !== -1 && editorIndex + 1 < pathParts.length) {
          // 에디터 모드
          targetPageId = pathParts[editorIndex + 1];
        } else if (pathParts.length > 0) {
          // 배포된 사이트 모드: 첫 번째 path segment가 pageId
          targetPageId = pathParts[0];
        }
        console.log('🔍 Extracted pageId from URL:', targetPageId);
      }
      
      // API 기본 URL 동적 설정 (배포된 사이트와 에디터 구분)
      const apiBaseUrl = typeof window !== 'undefined' && window.API_BASE_URL 
        ? window.API_BASE_URL 
        : (mode === 'live' ? 'http://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api' : '/api');
      
      const url = `${apiBaseUrl}/users/pages/${targetPageId}/attendance/${comp.id}`;
      console.log('🎯 Attendance API Request:', { targetPageId, componentId: comp.id, url, mode });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendeeName: attendeeName.trim(),
          attendeeCount,
          guestSide,
          contact: contact.trim(),
          companionCount,
          mealOption,
          privacyConsent,
        }),
      });

      if (response.ok) {
        alert('참석 의사가 성공적으로 전달되었습니다!');
        setIsModalOpen(false);
        setAttendeeName('');
        setAttendeeCount(1);
        setGuestSide('');
        setContact('');
        setCompanionCount(0);
        setMealOption('');
        setPrivacyConsent(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '참석 의사 전달에 실패했습니다.');
      }
    } catch (error) {
      console.error('참석 의사 전달 오류:', error);
      alert('참석 의사 전달에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    width: mode === 'live' ? '100%' : '100%',
    height: mode === 'live' ? `${containerHeight * scaleFactor}px` : `${containerHeight}px`,
    backgroundColor: comp.props?.backgroundColor || '#f8f9fa',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: '"Playfair Display", serif',
    boxSizing: 'border-box',
    borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
    padding: mode === 'live' ? `${12 * scaleFactor}px` : '12px', // 16px → 12px로 줄임
    minHeight: mode === 'live' ? `${containerHeight * scaleFactor}px` : `${containerHeight}px`
  };

  return (
    <div style={containerStyle}>
      {/* 제목 영역 */}
      <div style={{
        textAlign: 'center',
        marginBottom: mode === 'live' ? `${12 * scaleFactor}px` : '12px', // 16px → 12px로 줄임
      }}>
        <h3 style={{
          fontSize: mode === 'live' ? `${(parseInt(comp.props?.titleFontSize) || 18) * scaleFactor}px` : comp.props?.titleFontSize || '18px',
          fontWeight: '600',
          color: comp.props?.titleColor || '#1f2937',
          margin: `0 0 ${mode === 'live' ? 6 * scaleFactor : 6}px 0`, // 8px → 6px로 줄임
          fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
        }}>
          {comp.props?.title || '참석 여부 확인'}
        </h3>
        {comp.props?.description && (
          <p style={{
            fontSize: mode === 'live' ? `${(parseInt(comp.props?.descriptionFontSize) || 14) * scaleFactor}px` : comp.props?.descriptionFontSize || '14px',
            color: comp.props?.descriptionColor || '#6b7280',
            margin: '0',
            lineHeight: '1.4', // 1.5 → 1.4로 줄임
            fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
          }}>
            {comp.props.description}
          </p>
        )}
      </div>

      {/* 버튼 영역 - 맨 아래 배치 */}
      <div style={{ marginTop: 'auto' }}>
        <button
        onClick={
          mode === 'editor' 
            ? undefined
            : (e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }
        }
        disabled={mode === 'editor'}
        style={{
          backgroundColor: mode === 'editor' ? '#d1d5db' : (comp.props?.buttonColor || '#9CAF88'),
          color: mode === 'editor' ? '#9ca3af' : (comp.props?.buttonTextColor || 'white'),
          border: 'none',
          borderRadius: mode === 'live' ? `${(parseInt(comp.props?.borderRadius) || 8) * scaleFactor}px` : comp.props?.borderRadius || '8px',
          padding: mode === 'live' ? `${12 * scaleFactor}px ${24 * scaleFactor}px` : '12px 24px',
          fontSize: mode === 'live' ? `${(parseInt(comp.props?.fontSize) || 16) * scaleFactor}px` : comp.props?.fontSize || '16px',
          fontWeight: '500',
          fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
          cursor: mode === 'editor' ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
          opacity: mode === 'editor' ? 0.5 : 1,
          ...(mode === 'editor' ? { pointerEvents: 'none' } : {}),
        }}
        onMouseEnter={(e) => {
          if (mode !== 'editor') {
            e.target.style.opacity = '0.9';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (mode !== 'editor') {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
        {comp.props.buttonText || '참석 의사 전달'}
      </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: mode === 'live' ? `${12 * scaleFactor}px` : '12px',
              padding: mode === 'live' ? `${32 * scaleFactor}px` : '32px',
              width: '90%',
              maxWidth: mode === 'live' ? `${400 * scaleFactor}px` : '400px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
              fontWeight: '600',
              marginBottom: mode === 'live' ? `${24 * scaleFactor}px` : '24px',
              color: '#1f2937',
              textAlign: 'center',
              fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
            }}>
              참석 정보 입력
            </h2>

            {/* 참석자 구분 */}
            <div style={{ marginBottom: mode === 'live' ? `${20 * scaleFactor}px` : '20px' }}>
              <label style={labelStyle(comp, scaleFactor, mode)}>
                참석자 구분 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: mode === 'live' ? `${16 * scaleFactor}px` : '16px' }}>
                {['신부측', '신랑측'].map((side) => (
                  <label key={side} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={side}
                      checked={guestSide === side}
                      onChange={(e) => setGuestSide(e.target.value)}
                      style={{ marginRight: mode === 'live' ? `${8 * scaleFactor}px` : '8px' }}
                    />
                    <span style={textStyle(comp, scaleFactor, mode)}>{side}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 참석자 성함 */}
            <FormInput
              label="참석자 성함"
              required
              value={attendeeName}
              onChange={setAttendeeName}
              placeholder="성함을 입력해주세요"
              comp={comp}
              scaleFactor={scaleFactor}
              mode={mode}
            />

            {/* 참석 인원 */}
            <FormInput
              label="참석 인원"
              type="number"
              value={attendeeCount}
              onChange={(v) => setAttendeeCount(Math.max(1, parseInt(v) || 1))}
              comp={comp}
              scaleFactor={scaleFactor}
              mode={mode}
            />

            {/* 연락처 */}
            <FormInput
              label="연락처"
              type="tel"
              value={contact}
              onChange={setContact}
              placeholder="전화번호를 입력해주세요"
              comp={comp}
              scaleFactor={scaleFactor}
              mode={mode}
            />

            {/* 동행인 수 */}
            <FormInput
              label="동행인 수"
              type="number"
              value={companionCount}
              onChange={(v) => setCompanionCount(Math.max(0, parseInt(v) || 0))}
              placeholder="동행인 수를 입력해주세요 (0명 = 동행인 없음)"
              comp={comp}
              scaleFactor={scaleFactor}
              mode={mode}
            />

            {/* 식사 여부 */}
            <div style={{ marginBottom: mode === 'live' ? `${20 * scaleFactor}px` : '20px' }}>
              <label style={labelStyle(comp, scaleFactor, mode)}>식사여부</label>
              <div style={{ display: 'flex', gap: mode === 'live' ? `${16 * scaleFactor}px` : '16px' }}>
                {['식사함', '식사안함'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={opt}
                      checked={mealOption === opt}
                      onChange={(e) => setMealOption(e.target.value)}
                      style={{ marginRight: mode === 'live' ? `${8 * scaleFactor}px` : '8px' }}
                    />
                    <span style={textStyle(comp, scaleFactor, mode)}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 개인정보 수집 동의 */}
            <div style={{ marginBottom: mode === 'live' ? `${32 * scaleFactor}px` : '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
                fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
                color: '#374151',
                gap: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
              }}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  style={{ marginTop: mode === 'live' ? `${2 * scaleFactor}px` : '2px' }}
                />
                <div>
                  <span style={{ 
                    fontWeight: '500',
                    fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px'
                  }}>개인정보 수집 및 이용 동의</span>
                  <span style={{ color: '#ef4444' }}> *</span>
                  <div style={{ 
                    marginTop: mode === 'live' ? `${4 * scaleFactor}px` : '4px', 
                    fontSize: mode === 'live' ? `${12 * scaleFactor}px` : '12px', 
                    color: '#6b7280' 
                  }}>
                    참석 관련 업무 처리를 위해 개인정보 수집 및 이용에 동의합니다.
                  </div>
                </div>
              </label>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: mode === 'live' ? `${12 * scaleFactor}px` : '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={buttonStyle('#f3f4f6', '#374151', comp, false, scaleFactor, mode)}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting}
                style={buttonStyle(
                  (!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting)
                    ? '#d1d5db'
                    : (comp.props?.buttonColor || '#9CAF88'), // frontend와 동일한 기본값
                  comp.props?.buttonTextColor || 'white',
                  comp,
                  !attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting,
                  scaleFactor,
                  mode
                )}
              >
                {isSubmitting ? '전송 중...' : '참석 의사 전달'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = (comp, scaleFactor = 1, mode = 'editor') => ({
  display: 'block',
  marginBottom: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
  fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
  fontWeight: '500',
  color: '#374151',
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
});

const textStyle = (comp, scaleFactor = 1, mode = 'editor') => ({
  fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
});

const buttonStyle = (bg, color, comp, disabled = false, scaleFactor = 1, mode = 'editor') => ({
  padding: mode === 'live' ? `${12 * scaleFactor}px ${24 * scaleFactor}px` : '12px 24px',
  backgroundColor: bg,
  color,
  border: 'none',
  borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
  fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
  fontWeight: '500',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
  transition: 'all 0.2s ease',
});

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = false, comp, scaleFactor = 1, mode = 'editor' }) => (
  <div style={{ marginBottom: mode === 'live' ? `${20 * scaleFactor}px` : '20px' }}>
    <label style={labelStyle(comp, scaleFactor, mode)}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: mode === 'live' ? `${12 * scaleFactor}px ${16 * scaleFactor}px` : '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
        fontSize: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
        fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

export default AttendRenderer;