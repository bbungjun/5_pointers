import React, { useState, useEffect, useRef } from 'react';
import {
  groupComponentsIntoRows,
  getComponentDimensions,
} from './utils/editorUtils';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentRenderers/MapView';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';
import WeddingInviteRenderer from './ComponentRenderers/WeddingInviteRenderer';
import ImageRenderer from './ComponentRenderers/ImageRenderer';
import GridGalleryRenderer from './ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from './ComponentRenderers/SlideGalleryRenderer';
import { MapInfoRenderer } from './ComponentRenderers';
import CalendarRenderer from './ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './ComponentRenderers/BankAccountRenderer';
import CommentRenderer from './ComponentRenderers/CommentRenderer';
import SlidoRenderer from './ComponentRenderers/SlidoRenderer';
import MusicRenderer from './ComponentRenderers/MusicRenderer';
import PageRenderer from './ComponentRenderers/PageRenderer';
import KakaoTalkShareRenderer from './ComponentRenderers/KakaoTalkShareRenderer';
import PageButtonRenderer from './ComponentRenderers/PageButtonRenderer';
import LinkCopyRenderer from './ComponentRenderers/LinkCopyRenderer';

// 컴포넌트 렌더링 헬퍼
const ComponentRenderer = ({ component, editingViewport, pageId }) => {
  const props = { comp: component, mode: 'preview', isEditor: false, editingViewport, pageId };
  
  switch (component.type) {
    case 'button':
      return <ButtonRenderer {...props} />;
    case 'text':
      return <TextRenderer {...props} />;
    case 'link':
      return <LinkRenderer {...props} />;
    case 'attend':
      return <AttendRenderer {...props} />;
    case 'map':
      return <MapView {...(component.props || {})} comp={component} mode="preview" />;
    case 'dday':
      return <DdayRenderer {...props} />;
    case 'weddingContact':
      return <WeddingContactRenderer {...props} />;
    case 'weddingInvite':
      return <WeddingInviteRenderer {...props} />;
    case 'image':
      return <ImageRenderer {...props} />;
    case 'gridGallery':
      return <GridGalleryRenderer {...props} />;
    case 'slideGallery':
      return <SlideGalleryRenderer {...props} />;
    case 'mapInfo':
      return <MapInfoRenderer {...props} />;
    case 'calendar':
      return <CalendarRenderer {...props} />;
    case 'bankAccount':
      return <BankAccountRenderer {...props} />;
    case 'comment':
      return <CommentRenderer {...props} />;
    case 'slido':
      return <SlidoRenderer {...props} />;
    case 'musicPlayer':
      return <MusicRenderer {...props} />;
    case 'kakaotalkShare':
      return <KakaoTalkShareRenderer {...props} />;
    case 'page':
      return <PageRenderer component={component} mode="preview" />;
    case 'pageButton':
      return <PageButtonRenderer {...props} isPreview={true} />;
    case 'linkCopy': // 추가
      return <LinkCopyRenderer {...props} />;
    default:
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            border: '1px solid #ccc',
            ...component.props?.style,
          }}
        >
          {component.type}
        </div>
      );
  }
};

const PreviewRenderer = ({ components = [], forcedViewport = null, editingViewport = 'desktop', pageId }) => {
  const [scale, setScale] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef(null);
  const [actualCanvasWidth, setActualCanvasWidth] = useState(375);
  const isMobileView = forcedViewport === 'mobile';
  
  // 컴포넌트들의 실제 영역을 기반으로 캔버스 크기 계산
  const calculateCanvasSize = () => {
    if (isMobileView) {
      return { width: 375, height: 667 }; // 모바일은 고정 크기
    }
    
    // Desktop 모드에서는 에디터와 동일한 크기 사용
    const editorCanvasWidth = 1920; // 에디터와 동일한 크기
    
    if (!components || components.length === 0) {
      return { width: editorCanvasWidth, height: 1080 };
    }

    let maxY = 0;

    components.forEach((component) => {
      const y = component.y || 0;
      const height = component.height || getComponentDimensions(component.type).defaultHeight;
      maxY = Math.max(maxY, y + height);
    });

    // 에디터와 동일한 최소 높이 보장
    const actualHeight = Math.max(1080, maxY + 20);

    return { width: editorCanvasWidth, height: actualHeight };
  };

  const canvasSize = calculateCanvasSize();
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;

  // 데스크톱 모드에서는 스케일 계산 제거 (원본 크기로 표시)
  useEffect(() => {
    // 모바일 모드에서는 스케일 계산 불필요
    if (isMobileView) {
      setScale(1);
      return;
    }

    // 데스크톱 모드에서도 스케일 1로 고정 (원본 크기)
    setScale(1);
  }, [isMobileView, canvasWidth, canvasHeight]);

  // 데스크톱 편집 기준 → 모바일 미리보기: 재배치 적용
  if (forcedViewport === 'mobile' && editingViewport === 'desktop') {
    const rows = groupComponentsIntoRows(components);

    return (
      <div
        className="page-container"
        style={{
          width: `${canvasWidth}px`,
          minHeight: `${canvasHeight}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: 0,
          margin: 0,
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row-wrapper" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            {row.map((component) => {
              const originalWidth = component.width || getComponentDimensions(component.type).defaultWidth;
              const originalHeight = component.height || getComponentDimensions(component.type).defaultHeight;
              const finalWidth = Math.min(originalWidth, canvasWidth - 40);

              // bankAccount는 모바일 preview에서도 버튼만 보이도록 강제
              if (component.type === 'bankAccount') {
                return (
                  <div
                    key={component.id}
                    className="component-wrapper"
                    style={{
                      width: `${finalWidth}px`,
                      height: `${originalHeight}px`
                    }}
                  >
                    <BankAccountRenderer comp={component} mode="preview" isEditor={false} editingViewport={editingViewport} />
                  </div>
                );
              }

              return (
                <div
                  key={component.id}
                  className="component-wrapper"
                  style={{
                    width: `${finalWidth}px`,
                    height: `${originalHeight}px`
                  }}
                >
                  <ComponentRenderer component={component} editingViewport={editingViewport} pageId={pageId} setModalOpen={setIsModalOpen} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // 컨테이너 스타일 설정
  const containerStyle = {
    background: '#ffffff',
    transformOrigin: 'top left',
    width: isMobileView ? `${canvasWidth}px` : `${canvasWidth}px`, // 고정 픽셀 크기 사용
    height: isMobileView ? 'auto' : `${canvasHeight}px`,
    minHeight: isMobileView ? '812px' : `${canvasHeight}px`,
    maxWidth: isMobileView ? `${canvasWidth}px` : `${canvasWidth}px`, // 최대 너비도 고정
    // Desktop 모드에서는 스케일링 제거하여 원본 크기로 표시
    transform: isMobileView ? 'none' : 'none',
    overflow: 'hidden', // 모든 오버플로우 숨김
    position: 'relative',
    margin: '0 auto', // 중앙 정렬
    padding: 0,
    boxSizing: 'border-box',
    display: 'block',
  };

  return (
    <div
      ref={containerRef}
      className="page-container"
      style={containerStyle}
    >
      {components.map((component) => {
        // 에디터와 동일한 컴포넌트 크기 계산
        const componentWidth = component.width || getComponentDimensions(component.type).defaultWidth;
        const componentHeight = component.height || getComponentDimensions(component.type).defaultHeight;
        
        return (
          <div
            key={component.id}
            className="desktop-absolute-wrapper"
            style={{
              position: 'absolute',
              left: component.x || 0, // 에디터와 동일한 위치 사용
              top: component.y || 0,
              width: componentWidth,
              height: componentHeight,
            }}
          >
            <ComponentRenderer component={component} editingViewport={editingViewport} pageId={pageId} setModalOpen={setIsModalOpen} />
          </div>
        );
      })}
    </div>
  );
};

export default PreviewRenderer;

