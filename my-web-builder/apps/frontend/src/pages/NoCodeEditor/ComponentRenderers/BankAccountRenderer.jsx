import React, { useState, useRef, useEffect } from 'react';

function BankAccountRenderer({ comp, mode = 'editor', onUpdate }) {
  const { title, groomSide, brideSide, backgroundColor } = comp.props;
  const [groomOpen, setGroomOpen] = useState(false);
  const [brideOpen, setBrideOpen] = useState(false);
  const ref = useRef();

  // 드롭다운 상태, props 변경, 마운트 시마다 높이 측정
  useEffect(() => {
    if (ref.current && onUpdate) {
      const newHeight = ref.current.offsetHeight;
      if (comp.height !== newHeight) {
        onUpdate({ ...comp, height: newHeight });
      }
    }
  }, [groomOpen, brideOpen, comp.props, onUpdate]);

  const copyToClipboard = (account, name) => {
    navigator.clipboard.writeText(account);
    alert(`${name}의 계좌번호가 복사되었습니다.`);
  };

  const renderAccountInfo = (person, label) => {
    if (!person.enabled && label !== '신랑' && label !== '신부') return null;

    return (
      <div className="bg-white rounded-lg p-3 mb-2 shadow-sm border">
        <div className="mb-2">
          <span
            className="font-medium text-gray-800"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {label} {person.name}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-gray-600"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {person.bank} {person.account}
          </span>
          <button
            className="ml-3 px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(person.account, person.name);
            }}
          >
            복사
          </button>
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
        flexDirection: 'column'
      }}
    >
      {title && (
        <h3
          className="text-lg font-semibold text-center mb-4 text-gray-800"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {title}
        </h3>
      )}

      {/* 신랑측 드롭다운 */}
      <div className="mb-4">
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${groomOpen
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setGroomOpen(!groomOpen);
          }}
        >
          <span style={{ whiteSpace: 'pre-wrap' }}>신랑 측 계좌번호</span>
          <span className={`transform transition-transform duration-200 ${groomOpen ? 'rotate-180' : 'rotate-0'
            }`}>
            ▼
          </span>
        </button>

        {groomOpen && groomSide && (
          <div className="mt-2 space-y-2 pl-4">
            {groomSide.groom && renderAccountInfo(groomSide.groom, '신랑')}
            {groomSide.groomFather && groomSide.groomFather.enabled && renderAccountInfo(groomSide.groomFather, '신랑 아버지')}
            {groomSide.groomMother && groomSide.groomMother.enabled && renderAccountInfo(groomSide.groomMother, '신랑 어머니')}
          </div>
        )}
      </div>

      {/* 신부측 드롭다운 */}
      <div className="mb-4">
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${brideOpen
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setBrideOpen(!brideOpen);
          }}
        >
          <span style={{ whiteSpace: 'pre-wrap' }}>신부 측 계좌번호</span>
          <span className={`transform transition-transform duration-200 ${brideOpen ? 'rotate-180' : 'rotate-0'
            }`}>
            ▼
          </span>
        </button>

        {brideOpen && brideSide && (
          <div className="mt-2 space-y-2 pl-4">
            {brideSide.bride && renderAccountInfo(brideSide.bride, '신부')}
            {brideSide.brideFather && brideSide.brideFather.enabled && renderAccountInfo(brideSide.brideFather, '신부 아버지')}
            {brideSide.brideMother && brideSide.brideMother.enabled && renderAccountInfo(brideSide.brideMother, '신부 어머니')}
          </div>
        )}
      </div>
    </div>
  );
}

export default BankAccountRenderer;