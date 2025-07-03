import React from 'react';
import AttendRenderer from '../../ComponentRenderers/AttendRenderer';

function AttendThumbnail() {
  // 썸네일용 축소된 props
  const thumbnailProps = {
    props: {
      title: '참석 의사 전달',
      description: '축하의 마음으로 참석해 주실\n모든 분을 정중히 모시고자 하오니,\n참석 여부를 알려주시면 감사하겠습니다.',
      buttonText: '전달하기',
      buttonColor: '#aeb8fa'
    }
  };

  return (
    <div style={{
      width: 80,
      height: 60,
      overflow: 'hidden',
      borderRadius: 4,
      position: 'relative'
    }}>
      <div style={{
        width: 320,
        height: 240,
        transform: 'scale(0.25)', // 25% 축소 (80/320 = 0.25)
        transformOrigin: 'top left'
      }}>
        <AttendRenderer comp={thumbnailProps} isEditor={false} />
      </div>
    </div>
  );
}

export default AttendThumbnail;
