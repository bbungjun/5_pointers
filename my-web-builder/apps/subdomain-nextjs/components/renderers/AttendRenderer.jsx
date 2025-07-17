import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

function AttendRenderer({ comp, mode = 'live', pageId }) {
  const formType = comp.props?.formType || 'attendance';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  // 폼 타입별 설정
  const formConfigs = {
    attendance: {
      title: '참석 정보 입력',
      buttonText: '참석 의사 전달',
      apiEndpoint: 'attendance',
      fields: [
        { name: 'guestSide', label: '참석자 구분', type: 'radio', options: ['신부측', '신랑측'], required: true },
        { name: 'attendeeName', label: '참석자 성함', type: 'text', placeholder: '성함을 입력해주세요', required: true },
        { name: 'attendeeCount', label: '참석 인원', type: 'number', defaultValue: 1 },
        { name: 'contact', label: '연락처', type: 'tel', placeholder: '전화번호를 입력해주세요' },
        { name: 'companionCount', label: '동행인 수', type: 'number', placeholder: '동행인 수를 입력해주세요 (0명 = 동행인 없음)', defaultValue: 0 },
        { name: 'mealOption', label: '식사여부', type: 'radio', options: ['식사함', '식사안함'] }
      ]
    },
    'club-registration': {
      title: '동아리 가입 신청서',
      buttonText: '가입 신청하기',
      apiEndpoint: 'attendance',
      fields: [
        { name: 'studentName', label: '이름', type: 'text', placeholder: '이름을 입력해주세요', required: true },
        { name: 'studentId', label: '학번', type: 'text', placeholder: '학번을 입력해주세요', required: true },
        { name: 'major', label: '전공', type: 'text', placeholder: '전공을 입력해주세요', required: true },
        { name: 'grade', label: '학년', type: 'radio', options: ['1학년', '2학년', '3학년', '4학년'], required: true },
        { name: 'contact', label: '연락처', type: 'tel', placeholder: '전화번호를 입력해주세요', required: true },
        { name: 'email', label: '이메일', type: 'email', placeholder: '이메일을 입력해주세요', required: true },
        { name: 'motivation', label: '지원 동기', type: 'textarea', placeholder: '동아리 지원 동기를 입력해주세요', required: true },
        { name: 'experience', label: '관련 경험', type: 'textarea', placeholder: '관련 경험이나 특기사항을 입력해주세요' }
      ]
    }
  };

  const currentConfig = formConfigs[formType];
  
  // 폼 데이터 초기화
  const getInitialFormData = () => {
    const initialData = {};
    currentConfig.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      } else {
        initialData[field.name] = '';
      }
    });
    return initialData;
  };
  
  const [formData, setFormData] = useState(getInitialFormData);
  
  // 폼 타입이 변경될 때 데이터 리셋
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [formType]);


  const handleSubmit = async () => {
    // 필수 필드 검증
    const requiredFields = currentConfig.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
    
    if (missingFields.length > 0 || !privacyConsent) return;

    setIsSubmitting(true);
    try {
      // pageId를 prop으로 받거나 comp에서 가져오기, 에디터에서는 URL에서 추출
      let targetPageId = pageId || comp.pageId;
      console.log('🔍 Initial pageId:', {
        pageId,
        compPageId: comp.pageId,
        initialTarget: targetPageId,
      });

      // pageId가 없거나 임시 roomId인 경우 URL에서 실제 페이지 ID 추출
      if (!targetPageId || targetPageId.startsWith('room-')) {
        const pathParts = window.location.pathname.split('/').filter((p) => p);
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
      
      const url = `${apiBaseUrl}/users/pages/${targetPageId}/${currentConfig.apiEndpoint}/${comp.id}`;
      console.log('🎯 Form API Request:', { targetPageId, componentId: comp.id, url, mode, formType });
      
      // 폼 데이터 변환 (백엔드 호환성을 위해)
      let submitData = { ...formData, privacyConsent };
      
      // 동아리 가입 폼의 경우 attendance 엔드포인트와 호환되도록 필드명 변환
      if (formType === 'club-registration') {
        console.log('🔍 Club registration form data:', formData);
        submitData = {
          attendeeName: formData.studentName || '',
          attendeeCount: 1,
          guestSide: formData.grade || '',
          contact: formData.contact || '',
          companionCount: 0,
          mealOption: '',
          privacyConsent,
          // 동아리 가입 전용 필드들
          studentId: formData.studentId || '',
          major: formData.major || '',
          email: formData.email || '',
          motivation: formData.motivation || '',
          experience: formData.experience || '',
          formType: 'club-registration' // 구분을 위한 필드
        };
        console.log('📤 Sending club registration data:', submitData);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const successMessage = formType === 'attendance' ? '참석 의사가 성공적으로 전달되었습니다!' : '가입 신청이 성공적으로 제출되었습니다!';
        alert(successMessage);
        setIsModalOpen(false);
        
        // 폼 데이터 초기화
        const initialData = {};
        currentConfig.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            initialData[field.name] = field.defaultValue;
          } else {
            initialData[field.name] = '';
          }
        });
        setFormData(initialData);
        setPrivacyConsent(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {

    width: '100%',
    height: '100%',

    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '12px', // 16px → 12px로 줄임
    fontFamily: '"Playfair Display", serif',

    backgroundColor: comp.props?.backgroundColor || '#f8f9fa',
    borderRadius: comp.props?.borderRadius || '8px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',

  };

  return (
    <div style={containerStyle}>
      {/* 제목 영역 */}

      <div style={{
        textAlign: 'center',
        marginBottom: '12px', // 16px → 12px로 줄임
      }}>
        <h3 style={{
          fontSize: comp.props?.titleFontSize || '18px',
          fontWeight: '600',
          color: comp.props?.titleColor || '#1f2937',
          margin: '0 0 20px 0', // 8px → 6px로 줄임
          fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
        }}>
          {comp.props?.title || '참석 여부 확인'}
        </h3>
        {comp.props?.description && (
          <p style={{
            fontSize: comp.props?.descriptionFontSize || '14px',
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
          mode === 'editor' || isEditor === true
            ? undefined
            : (e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }
        }
        disabled={mode === 'editor' || isEditor === true}
        style={{
          backgroundColor: (mode === 'editor' || isEditor === true) ? '#d1d5db' : (comp.props?.buttonColor || '#9CAF88'),
          color: (mode === 'editor' || isEditor === true) ? '#9ca3af' : (comp.props?.buttonTextColor || 'white'),
          border: 'none',
          borderRadius: comp.props?.borderRadius || '8px',
          padding: '12px 24px',
          marginBottom : '10px',
          fontSize: comp.props?.fontSize || '16px',
          fontWeight: '500',
          fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
          cursor: (mode === 'editor' || isEditor === true) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          width: '100%',
          opacity: (mode === 'editor' || isEditor === true) ? 0.5 : 1,
          pointerEvents: (mode === 'editor' || isEditor === true) ? 'none' : 'auto',
        }}
        onMouseEnter={(e) => {
          if (!(mode === 'editor' || isEditor === true)) {
            e.target.style.opacity = '0.9';
            e.target.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!(mode === 'editor' || isEditor === true)) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }
        }}
      >
{comp.props.buttonText || currentConfig.buttonText}
      </button>
      </div>

      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999999,
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
              zIndex: 99999999,
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
              fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
            }}>
              {currentConfig.title}
            </h2>

            {/* 동적 필드 렌더링 */}
            {currentConfig.fields.map((field) => (
              <div key={field.name} style={{ marginBottom: '20px' }}>
                {field.type === 'radio' ? (
                  <>
                    <label style={labelStyle(comp)}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {field.options.map((option) => (
                        <label key={option} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            value={option}
                            checked={formData[field.name] === option}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                            style={{ marginRight: '8px' }}
                          />
                          <span style={textStyle(comp)}>{option}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : field.type === 'textarea' ? (
                  <>
                    <label style={labelStyle(comp)}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <textarea
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
                        boxSizing: 'border-box',
                        minHeight: '80px',
                        resize: 'vertical',
                      }}
                    />
                  </>
                ) : (
                  <>
                    <label style={labelStyle(comp)}>
                      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <input
                      type={field.type}
                      value={formData[field.name] || ''}
                      onChange={(e) => {
                        let newValue = e.target.value;
                        if (field.type === 'number') {
                          newValue = field.name === 'companionCount' ? Math.max(0, parseInt(newValue) || 0) : Math.max(1, parseInt(newValue) || 1);
                        }
                        setFormData(prev => ({ ...prev, [field.name]: newValue }));
                      }}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </>
                )}
              </div>
            ))}

            {/* 개인정보 수집 동의 */}

            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
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
                  <span style={{ 
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>개인정보 수집 및 이용 동의</span>
                  <span style={{ color: '#ef4444' }}> *</span>
                  <div style={{ 
                    marginTop: '4px', 
                    fontSize: '12px', 
                    color: '#6b7280' 
                  }}>
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

                disabled={(() => {
                  const requiredFields = currentConfig.fields.filter(field => field.required);
                  const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
                  return missingFields.length > 0 || !privacyConsent || isSubmitting;
                })()}
                style={buttonStyle(
                  (() => {
                    const requiredFields = currentConfig.fields.filter(field => field.required);
                    const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
                    return (missingFields.length > 0 || !privacyConsent || isSubmitting)
                      ? '#d1d5db'
                      : (comp.props?.buttonColor || '#475569');
                  })(),
                  'white',
                  comp,
                  (() => {
                    const requiredFields = currentConfig.fields.filter(field => field.required);
                    const missingFields = requiredFields.filter(field => !formData[field.name] || formData[field.name].toString().trim() === '');
                    return missingFields.length > 0 || !privacyConsent || isSubmitting;
                  })()
                )}
              >
{isSubmitting ? '전송 중...' : currentConfig.buttonText}
              </button>
            </div>
          </div>
        </div>,
        document.body
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
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
});

const textStyle = (comp) => ({
  fontSize: '16px',
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
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
  fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
  transition: 'all 0.2s ease',
});

const DynamicFormInput = ({ field, value, onChange, comp }) => (
  <>
    <label style={labelStyle(comp)}>
      {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      type={field.type}
      value={value}
      onChange={(e) => {
        let newValue = e.target.value;
        if (field.type === 'number') {
          newValue = field.name === 'companionCount' ? Math.max(0, parseInt(newValue) || 0) : Math.max(1, parseInt(newValue) || 1);
        }
        onChange(newValue);
      }}
      placeholder={field.placeholder}
      style={{
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '16px',
        fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
        boxSizing: 'border-box',
      }}
    />
  </>
);

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
        fontFamily: comp.props?.fontFamily || '"Playfair Display", serif',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

export default AttendRenderer;
