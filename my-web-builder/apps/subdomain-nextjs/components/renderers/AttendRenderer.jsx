import React, { useState } from 'react';

function AttendRenderer({ comp, mode = 'live', pageId, isEditor = false }) {
  console.log('🎯 AttendRenderer props:', { pageId, mode, isEditor, componentId: comp.id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestSide, setGuestSide] = useState('');
  const [contact, setContact] = useState('');
  const [companionCount, setCompanionCount] = useState(0);
  const [mealOption, setMealOption] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);

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
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          // 에디터 모드에서는 알림만 표시, 배포된 사이트나 미리보기에서는 모달 열기
          if (mode === 'editor' || isEditor === true) {
            alert('참석 기능은 배포된 사이트에서 사용 가능합니다.');
          } else {
            // mode가 'live' (배포된 사이트) 또는 'preview'이고 isEditor가 false인 경우 모달 열기
            setIsModalOpen(true);
          }
        }}
        style={{
          backgroundColor: comp.props?.buttonColor || '#6366f1',
          color: comp.props?.textColor || 'white',
          border: 'none',
          borderRadius: comp.props?.borderRadius || '8px',
          padding: '12px 24px',
          fontSize: comp.props?.fontSize || '16px',
          fontWeight: '500',
          fontFamily: comp.props?.fontFamily || 'Playfair Display, serif',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.target.style.opacity = '0.9';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {comp.props.buttonText || '참석 의사 전달'}
      </button>

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
              borderRadius: '12px',
              padding: '32px',
              width: '90%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '24px',
              color: '#1f2937',
              textAlign: 'center',
              fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
            }}>
              참석 정보 입력
            </h2>

            {/* 참석자 구분 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle(comp)}>
                참석자 구분 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['신부측', '신랑측'].map((side) => (
                  <label key={side} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={side}
                      checked={guestSide === side}
                      onChange={(e) => setGuestSide(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={textStyle(comp)}>{side}</span>
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
            />

            {/* 참석 인원 */}
            <FormInput
              label="참석 인원"
              type="number"
              value={attendeeCount}
              onChange={(v) => setAttendeeCount(Math.max(1, parseInt(v) || 1))}
              comp={comp}
            />

            {/* 연락처 */}
            <FormInput
              label="연락처"
              type="tel"
              value={contact}
              onChange={setContact}
              placeholder="전화번호를 입력해주세요"
              comp={comp}
            />

            {/* 동행인 수 */}
            <FormInput
              label="동행인 수"
              type="number"
              value={companionCount}
              onChange={(v) => setCompanionCount(Math.max(0, parseInt(v) || 0))}
              placeholder="동행인 수를 입력해주세요 (0명 = 동행인 없음)"
              comp={comp}
            />

            {/* 식사 여부 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle(comp)}>식사여부</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {['식사함', '식사안함'].map((opt) => (
                  <label key={opt} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      value={opt}
                      checked={mealOption === opt}
                      onChange={(e) => setMealOption(e.target.value)}
                      style={{ marginRight: '8px' }}
                    />
                    <span style={textStyle(comp)}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 개인정보 수집 동의 */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
                color: '#374151',
                gap: '8px',
              }}>
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <span style={{ fontWeight: '500' }}>개인정보 수집 및 이용 동의</span>
                  <span style={{ color: '#ef4444' }}> *</span>
                  <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
                    참석 관련 업무 처리를 위해 개인정보 수집 및 이용에 동의합니다.
                  </div>
                </div>
              </label>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={buttonStyle('#f3f4f6', '#374151', comp)}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting}
                style={buttonStyle(
                  (!attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting)
                    ? '#d1d5db'
                    : (comp.props?.buttonColor || '#6366f1'),
                  'white',
                  comp,
                  !attendeeName.trim() || !guestSide || !privacyConsent || isSubmitting
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

const labelStyle = (comp) => ({
  display: 'block',
  marginBottom: '8px',
  fontSize: '16px',
  fontWeight: '500',
  color: '#374151',
  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
});

const textStyle = (comp) => ({
  fontSize: '16px',
  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
});

const buttonStyle = (bg, color, comp, disabled = false) => ({
  padding: '12px 24px',
  backgroundColor: bg,
  color,
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
});

const FormInput = ({ label, type = 'text', value, onChange, placeholder, required = false, comp }) => (
  <div style={{ marginBottom: '20px' }}>
    <label style={labelStyle(comp)}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '16px',
        fontFamily: comp.props.fontFamily || 'Playfair Display, serif',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

export default AttendRenderer;