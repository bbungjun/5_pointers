import React from 'react';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentEditors/MapView';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';
import ImageRenderer from './ComponentRenderers/ImageRenderer';
import GridGalleryRenderer from './ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from './ComponentRenderers/SlideGalleryRenderer';
import MapInfoRenderer from './ComponentRenderers/MapInfoRenderer';
import CalendarRenderer from './ComponentRenderers/CalendarRenderer';

// 컴포넌트 definitions import
import buttonDef from '../components/definitions/button.json';
import textDef from '../components/definitions/text.json';
import linkDef from '../components/definitions/link.json';
import mapDef from '../components/definitions/map.json';
import attendDef from '../components/definitions/attend.json';
import imageDef from '../components/definitions/image.json';
import ddayDef from '../components/definitions/d-day.json';
import weddingContactDef from '../components/definitions/wedding-contact.json';
import bankAccountDef from '../components/definitions/bank-account.json';
import gridGalleryDef from '../components/definitions/grid-gallery.json';
import slideGalleryDef from '../components/definitions/slide-gallery.json';
import mapInfoDef from '../components/definitions/map_info.json';
import calendarDef from '../components/definitions/calendar.json';

// 컴포넌트 정의들을 맵으로 구성
const componentDefinitions = {
  button: buttonDef,
  text: textDef,
  link: linkDef,
  map: mapDef,
  attend: attendDef,
  image: imageDef,
  dday: ddayDef,
  weddingContact: weddingContactDef,
  bankAccount: bankAccountDef,
  gridGallery: gridGalleryDef,
  slideGallery: slideGalleryDef,
  mapInfo: mapInfoDef,
  calendar: calendarDef
};

/**
 * PreviewRenderer - iframe 내부에서 실제 페이지를 렌더링하는 순수 컴포넌트
 * 
 * 이 컴포넌트는:
 * 1. 편집 기능이 완전히 제거된 순수한 렌더링만 담당
 * 2. 실제 배포 환경과 동일한 모습을 보여줌
 * 3. 드래그, 선택, 편집 등의 에디터 기능은 포함하지 않음
 */
const PreviewRenderer = ({ pageContent }) => {
  // 컴포넌트의 props와 defaultProps를 병합하는 함수
  const getMergedProps = (comp) => {
    const definition = componentDefinitions[comp.type];
    const defaultProps = definition?.defaultProps || {};
    return { ...defaultProps, ...(comp.props || {}) };
  };

  // 컴포넌트 타입별 렌더링 함수
  const renderComponent = (comp) => {
    const mergedProps = getMergedProps(comp);
    
    const baseStyle = {
      position: 'absolute',
      left: comp.x,
      top: comp.y,
      width: comp.width || 'auto',
      height: comp.height || 'auto',
      // 편집 관련 스타일 제거 (border, cursor 등)
    };

    // 병합된 props로 새로운 comp 객체 생성
    const compWithMergedProps = {
      ...comp,
      props: mergedProps
    };

    const componentContent = (() => {
      switch (comp.type) {
        case 'button':
          return <ButtonRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'text':
          return <TextRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'link':
          return <LinkRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'attend':
          return <AttendRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'map':
          return <MapView {...mergedProps} isEditor={true} />;
        case 'dday':
          return <DdayRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'weddingContact':
          return <WeddingContactRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'image':
          return <ImageRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'gridGallery':
          return <GridGalleryRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'slideGallery':
          return <SlideGalleryRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'mapInfo':
          return <MapInfoRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'calendar':
          return <CalendarRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'comment':
          return <CommentRenderer comp={compWithMergedProps} isEditor={true} />;
        case 'bankAccount':
          return (
            <div style={{
              padding: '16px',
              background: mergedProps.backgroundColor || '#ffffff',
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
                💒 {mergedProps.title || '축의금 계좌 안내'}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                {/* 신랑 측 계좌들 */}
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#495057',
                  marginBottom: 8
                }}>
                  신랑 측
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    {mergedProps.groomSide?.groom?.name || '신랑'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6c757d' }}>
                    {mergedProps.groomSide?.groom?.bank || '은행'} {mergedProps.groomSide?.groom?.account || '계좌번호'}
                  </div>
                </div>
                {mergedProps.groomSide?.groomFather?.enabled && (
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: 6,
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {mergedProps.groomSide?.groomFather?.name || '신랑 아버지'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {mergedProps.groomSide?.groomFather?.bank || '은행'} {mergedProps.groomSide?.groomFather?.account || '계좌번호'}
                    </div>
                  </div>
                )}
                {mergedProps.groomSide?.groomMother?.enabled && (
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: 6,
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {mergedProps.groomSide?.groomMother?.name || '신랑 어머니'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {mergedProps.groomSide?.groomMother?.bank || '은행'} {mergedProps.groomSide?.groomMother?.account || '계좌번호'}
                    </div>
                  </div>
                )}

                {/* 신부 측 계좌들 */}
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#495057',
                  marginBottom: 8,
                  marginTop: 16
                }}>
                  신부 측
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8f9fa',
                  borderRadius: 6,
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    {mergedProps.brideSide?.bride?.name || '신부'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6c757d' }}>
                    {mergedProps.brideSide?.bride?.bank || '은행'} {mergedProps.brideSide?.bride?.account || '계좌번호'}
                  </div>
                </div>
                {mergedProps.brideSide?.brideFather?.enabled && (
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: 6,
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {mergedProps.brideSide?.brideFather?.name || '신부 아버지'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {mergedProps.brideSide?.brideFather?.bank || '은행'} {mergedProps.brideSide?.brideFather?.account || '계좌번호'}
                    </div>
                  </div>
                )}
                {mergedProps.brideSide?.brideMother?.enabled && (
                  <div style={{
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: 6,
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                      {mergedProps.brideSide?.brideMother?.name || '신부 어머니'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {mergedProps.brideSide?.brideMother?.bank || '은행'} {mergedProps.brideSide?.brideMother?.account || '계좌번호'}
                    </div>
                  </div>
                )}
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
              {mergedProps.text || comp.type}
            </div>
          );
      }
    })();

    return (
      <div
        key={comp.id}
        data-component-type={comp.type}
        data-component-id={comp.id}
        // 미리보기에서는 모든 편집 이벤트 차단
        onDoubleClick={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          ...baseStyle,
          pointerEvents: 'none', // 모든 마우스 이벤트 차단
          userSelect: 'none'     // 텍스트 선택 차단
        }}
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