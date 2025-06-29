import React from 'react';

function AttendRenderer({ comp, isEditor = false }) {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm px-6 py-12 pt-12 pb-8 text-center">
      <div className="text-gray-400 text-xl font-medium mb-9">
        {comp.props.title || '참석 의사 전달'}
      </div>
      <div className="text-gray-700 text-lg leading-relaxed mb-10 whitespace-pre-line">
        {comp.props.description || (
          <>
            축하의 마음으로 참석해 주실<br />
            모든 분을 정중히 모시고자 하오니,<br />
            참석 여부를 알려주시면 감사하겠습니다.
          </>
        )}
      </div>
      <button
        className="w-full py-4 text-white text-2xl font-bold border-none rounded-lg cursor-pointer tracking-wide"
        style={{
          background: comp.props.buttonColor || '#aeb8fa',
        }}
        onClick={e => {
          e.stopPropagation();
          if (isEditor) {
            alert('참석 기능은 배포 모드에서 사용 가능합니다.');
          }
        }}
      >
        {comp.props.buttonText || '전달하기'}
      </button>
    </div>
  );
}

export default AttendRenderer; 