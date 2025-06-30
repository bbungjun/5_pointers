import React from 'react';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentEditors/MapView';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';
import ImageRenderer from './ComponentRenderers/ImageRenderer';

/**
 * PreviewRenderer - iframe 내부에서 실제 페이지를 렌더링하는 순수 컴포넌트
 * 
 * 이 컴포넌트는:
 * 1. 편집 기능이 완전히 제거된 순수한 렌더링만 담당
 * 2. 실제 배포 환경과 동일한 모습을 보여줌
 * 3. 드래그, 선택, 편집 등의 에디터 기능은 포함하지 않음
 */
const PreviewRenderer = ({ pageContent }) => {
  // 컴포넌트 타입별 렌더링 함수
  const renderComponent = (comp) => {
    const baseStyle = {
      position: 'absolute',
      left: comp.x,
      top: comp.y,
      width: comp.width || 'auto',
      height: comp.height || 'auto',
      // 편집 관련 스타일 제거 (border, cursor 등)
    };

    const componentContent = (() => {
      switch (comp.type) {
        case 'button':
          return <ButtonRenderer comp={comp} isEditor={false} />;
        case 'text':
          return <TextRenderer comp={comp} isEditor={false} />;
        case 'link':
          return <LinkRenderer comp={comp} isEditor={false} />;
        case 'attend':
          return <AttendRenderer comp={comp} isEditor={false} />;
        case 'map':
          return <MapView {...comp.props} isEditor={false} />;
        case 'dday':
          return <DdayRenderer comp={comp} isEditor={false} />;
        case 'weddingContact':
          return <WeddingContactRenderer comp={comp} isEditor={false} />;
        case 'image':
          return <ImageRenderer comp={comp} isEditor={false} />;
        case 'bankAccount':
          return (
            <div style={{
              padding: '16px',
              background: '#ffffff',
              border: '1px solid #e1e5e9',
              borderRadius: 8,
              fontFamily: 'inherit'
            }}>
              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1d2129',
                marginBottom: 12
              }}>
                💒 축의금 계좌 안내
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#495057',
                    marginBottom: 4
                  }}>
                    신랑 측 계좌
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#6c757d'
                  }}>
                    {comp.props?.groomAccount || '계좌번호를 입력해주세요'}
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#495057',
                    marginBottom: 4
                  }}>
                    신부 측 계좌
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#6c757d'
                  }}>
                    {comp.props?.brideAccount || '계좌번호를 입력해주세요'}
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div style={{
              padding: '8px 12px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: 4,
              fontSize: 14,
              color: '#6c757d'
            }}>
              {comp.props?.text || comp.type}
            </div>
          );
      }
    })();

    return (
      <div
        key={comp.id}
        style={baseStyle}
        data-component-type={comp.type}
        data-component-id={comp.id}
      >
        {componentContent}
      </div>
    );
  };

  if (!pageContent || !Array.isArray(pageContent)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: 16,
        color: '#6c757d',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지에 컴포넌트를 추가해보세요</div>
          <div style={{ fontSize: 14, marginTop: 8, opacity: 0.7 }}>
            좌측 컴포넌트 라이브러리에서 원하는 컴포넌트를 드래그해서 추가할 수 있습니다
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative',
      width: '1920px', // 캔버스 고정 크기
      height: '1080px',
      background: '#ffffff',
      margin: '0 auto',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* 모든 컴포넌트 렌더링 */}
      {pageContent.map(renderComponent)}
      
      {/* 페이지 하단 여백 (필요시) */}
      <div style={{ 
        height: 100, 
        width: '100%',
        position: 'absolute',
        bottom: 0,
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default PreviewRenderer; 