import React, { useState, useRef, useEffect } from 'react';

function BankAccountRenderer({ comp, isEditor = false, onUpdate, mode = 'live' }) {
  const { title, groomSide, brideSide, backgroundColor } = comp.props;
  const [groomModalOpen, setGroomModalOpen] = useState(false);
  const [brideModalOpen, setBrideModalOpen] = useState(false);
  const ref = useRef();

  // 모달 상태, props 변경, 마운트 시마다 높이 측정
  useEffect(() => {
    if (ref.current && onUpdate) {
      const newHeight = ref.current.offsetHeight;
      if (comp.height !== newHeight) {
        onUpdate({ ...comp, height: newHeight });
      }
    }
  }, [comp.props, onUpdate]);

  const copyToClipboard = (account, name) => {
    navigator.clipboard.writeText(account);
    alert(`${name}의 계좌번호가 복사되었습니다.`);
  };

  const renderAccountInfo = (person, label) => {
    if (!person.enabled && label !== '신랑' && label !== '신부') return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
        <div className="mb-3">
          <span
            style={{ 
              fontSize: '16px',
              fontWeight: '600',
              color: '#4A4A4A',
              whiteSpace: 'pre-wrap',
              fontFamily: 'Playfair Display, serif'
            }}
          >
            {label} {person.name}
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '60px' }}>
            <span style={{ fontSize: '14px', color: '#BDB5A6', marginBottom: '4px', fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>은행</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4A4A4A', fontFamily: 'Montserrat, sans-serif' }}>{person.bank}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '120px', margin: '0 8px' }}>
            <span style={{ fontSize: '14px', color: '#BDB5A6', marginBottom: '4px', fontFamily: 'Montserrat, sans-serif', fontWeight: '500' }}>계좌번호</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4A4A4A', fontFamily: 'Montserrat, sans-serif' }}>{person.account}</span>
          </div>
          <button
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #87CEEB 0%, #6CB4D8 100%)',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Montserrat, sans-serif',
              border: 'none',
              boxShadow: '0 2px 8px rgba(135, 206, 235, 0.3)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(person.account, person.name);
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #98D7F0 0%, #7BC0E0 100%)';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(135, 206, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #87CEEB 0%, #6CB4D8 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(135, 206, 235, 0.3)';
            }}
          >
            복사
          </button>
        </div>
      </div>
    );
  };

  const renderModal = (sideData, title, isOpen, setIsOpen) => {
    if (!isOpen) return null;

    // Preview 모드에서는 모달 표시하지 않음
    if (mode === 'preview') {
      return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 배경 오버레이 */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        ></div>
        
        {/* 모달 컨텐츠 */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#4A4A4A',
              fontFamily: 'Playfair Display, serif'
            }}>{title}</h3>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 모달 바디 */}
          <div className="p-6">
            {sideData && (
              <div className="space-y-3">
                {title.includes('신랑') && sideData.groom && renderAccountInfo(sideData.groom, '신랑')}
                {title.includes('신랑') && sideData.groomFather && sideData.groomFather.enabled && renderAccountInfo(sideData.groomFather, '신랑 아버지')}
                {title.includes('신랑') && sideData.groomMother && sideData.groomMother.enabled && renderAccountInfo(sideData.groomMother, '신랑 어머니')}
                
                {title.includes('신부') && sideData.bride && renderAccountInfo(sideData.bride, '신부')}
                {title.includes('신부') && sideData.brideFather && sideData.brideFather.enabled && renderAccountInfo(sideData.brideFather, '신부 아버지')}
                {title.includes('신부') && sideData.brideMother && sideData.brideMother.enabled && renderAccountInfo(sideData.brideMother, '신부 어머니')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        //height:'100%',
        padding: '12px',
        borderRadius: 0,
        border: '1px solid #e5e7eb',
        backgroundColor,
        minWidth: '250px',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {title && (
        <h3
          style={{ 
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '16px',
            color: '#4A4A4A',
            whiteSpace: 'pre-wrap',
            fontFamily: 'Playfair Display, serif'
          }}
        >
          {title}
        </h3>
      )}

      {/* 신랑측 모달 버튼 - 스카이블루 */}
      <div className="mb-4">
        <button
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #87CEEB 0%, #87CEEB 50%, #6CB4D8 100%)',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid rgba(135, 206, 235, 0.3)',
            boxShadow: '0 4px 16px rgba(135, 206, 235, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setGroomModalOpen(true);
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #98D7F0 0%, #98D7F0 50%, #7BC0E0 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(135, 206, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #87CEEB 0%, #87CEEB 50%, #6CB4D8 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(135, 206, 235, 0.3)';
          }}
        >
          <svg 
            style={{ width: '20px', height: '20px', flexShrink: 0 }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}>신랑 측 계좌번호</span>
        </button>
      </div>

      {/* 신부측 모달 버튼 - 소프트 핑크 */}
      <div className="mb-4">
        <button
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontWeight: '600',
            border: '1px solid rgba(216, 191, 216, 0.3)',
            boxShadow: '0 4px 16px rgba(216, 191, 216, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setBrideModalOpen(true);
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #E6D3E6 0%, #D4B8D4 50%, #C29FC2 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 24px rgba(216, 191, 216, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #D8BFD8 0%, #C8A2C8 50%, #B794B7 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 16px rgba(216, 191, 216, 0.3)';
          }}
        >
          <svg 
            style={{ width: '20px', height: '20px', flexShrink: 0 }} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'Montserrat, sans-serif', fontWeight: '600' }}>신부 측 계좌번호</span>
        </button>
      </div>

      {/* Preview 모드에서는 계좌 정보를 카드 형태로 표시 */}
      {mode === 'preview' && groomModalOpen && groomSide && (
        <div style={{ 
          marginTop: '12px', 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4A4A4A',
            fontFamily: 'Playfair Display, serif',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            신랑 측 계좌번호
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groomSide.groom && renderAccountInfo(groomSide.groom, '신랑')}
            {groomSide.groomFather && groomSide.groomFather.enabled && renderAccountInfo(groomSide.groomFather, '신랑 아버지')}
            {groomSide.groomMother && groomSide.groomMother.enabled && renderAccountInfo(groomSide.groomMother, '신랑 어머니')}
          </div>
        </div>
      )}

      {mode === 'preview' && brideModalOpen && brideSide && (
        <div style={{ 
          marginTop: '12px', 
          padding: '16px', 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#4A4A4A',
            fontFamily: 'Playfair Display, serif',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            신부 측 계좌번호
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {brideSide.bride && renderAccountInfo(brideSide.bride, '신부')}
            {brideSide.brideFather && brideSide.brideFather.enabled && renderAccountInfo(brideSide.brideFather, '신부 아버지')}
            {brideSide.brideMother && brideSide.brideMother.enabled && renderAccountInfo(brideSide.brideMother, '신부 어머니')}
          </div>
        </div>
      )}

      {/* 모달들 */}
      {renderModal(groomSide, '신랑 측 계좌번호', groomModalOpen, setGroomModalOpen)}
      {renderModal(brideSide, '신부 측 계좌번호', brideModalOpen, setBrideModalOpen)}
    </div>
  );
}

export default BankAccountRenderer;