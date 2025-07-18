import React, { useCallback, useState } from 'react';

function SlidoEditor({ selectedComp, onUpdate }) {
  // 로컬 상태로 입력값 관리
  const [localQuestion, setLocalQuestion] = useState(selectedComp.props?.question || '');
  const [localPlaceholder, setLocalPlaceholder] = useState(selectedComp.props?.placeholder || '');
  const [localBackgroundColor, setLocalBackgroundColor] = useState(selectedComp.props?.backgroundColor || '#ffffff');
  const [isComposing, setIsComposing] = useState(false);

  // 외부 props가 변경될 때만 로컬 상태 동기화
  React.useEffect(() => {
    if (!isComposing) {
      setLocalQuestion(selectedComp.props?.question || '');
      setLocalPlaceholder(selectedComp.props?.placeholder || '');
      setLocalBackgroundColor(selectedComp.props?.backgroundColor || '#ffffff');
    }
  }, [selectedComp.props, isComposing]);

  // 속성 업데이트 함수 - 즉시 실행
  const handlePropChange = useCallback((propName, value) => {
    // IME 조합 중이 아닐 때만 상위로 전달
    if (!isComposing) {
      onUpdate({
        ...selectedComp,
        props: {
          ...selectedComp.props,
          [propName]: value
        }
      });
    }
  }, [selectedComp, onUpdate, isComposing]);

  // Composition 이벤트 핸들러
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
    
    // 조합 완료 후 상위로 전달
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        question: localQuestion,
        placeholder: localPlaceholder,
        backgroundColor: localBackgroundColor
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 컴포넌트 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '8px 12px',
        backgroundColor: '#f0f2f5',
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>💭</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            실시간 의견 수집
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            Slido 스타일의 실시간 의견 수집 컴포넌트
          </div>
        </div>
      </div>

      {/* 질문 내용 */}
      <div>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 8
        }}>
          질문 내용
        </label>
        <input
          type="text"
          value={localQuestion}
          onChange={(e) => {
            setLocalQuestion(e.target.value);
            if (!isComposing) {
              handlePropChange('question', e.target.value);
            }
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="여러분의 의견을 들려주세요"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #dddfe2',
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: '#ffffff'
          }}
        />
        <div style={{ fontSize: 11, color: '#65676b', marginTop: 4 }}>
          참여자들에게 보여질 질문을 입력하세요
        </div>
      </div>

      {/* 입력 플레이스홀더 */}
      <div>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 8
        }}>
          입력 안내 문구
        </label>
        <input
          type="text"
          value={localPlaceholder}
          onChange={(e) => {
            setLocalPlaceholder(e.target.value);
            if (!isComposing) {
              handlePropChange('placeholder', e.target.value);
            }
          }}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="의견을 입력해보세요!"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #dddfe2',
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: '#ffffff'
          }}
        />
        <div style={{ fontSize: 11, color: '#65676b', marginTop: 4 }}>
          입력창에 표시될 안내 문구
        </div>
      </div>

      {/* 배경색 */}
      <div>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 8
        }}>
          배경색
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={localBackgroundColor}
            onChange={(e) => {
              setLocalBackgroundColor(e.target.value);
              handlePropChange('backgroundColor', e.target.value);
            }}
            style={{
              width: 40,
              height: 32,
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={localBackgroundColor}
            onChange={(e) => {
              setLocalBackgroundColor(e.target.value);
              if (!isComposing) {
                handlePropChange('backgroundColor', e.target.value);
              }
            }}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #dddfe2',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace'
            }}
          />
        </div>
      </div>

      {/* 애니메이션 효과 */}
      <div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={selectedComp.props?.animation ?? true}
            onChange={(e) => {
              handlePropChange('animation', e.target.checked);
            }}
            style={{ cursor: 'pointer' }}
          />
          새 의견 애니메이션 효과
        </label>
        <div style={{ fontSize: 11, color: '#65676b', marginTop: 4, marginLeft: 20 }}>
          새로운 의견이 추가될 때 애니메이션을 표시합니다
        </div>
      </div>

      {/* 사용 안내 */}
      <div style={{
        padding: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 6,
        border: '1px solid #bbdefb'
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0d47a1', marginBottom: 4 }}>
          💡 사용 안내
        </div>
        <div style={{ fontSize: 11, color: '#1565c0', lineHeight: 1.4 }}>
          • 게시 후 실시간으로 의견이 수집됩니다<br/>
        </div>
      </div>
    </div>
  );
}

export default SlidoEditor;