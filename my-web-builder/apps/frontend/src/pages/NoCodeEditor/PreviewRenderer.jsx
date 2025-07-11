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

// 컴포넌트 렌더링 헬퍼
const ComponentRenderer = ({ component }) => {
  switch (component.type) {
    case 'button':
      return <ButtonRenderer comp={component} isEditor={false} />;
    case 'text':
      return <TextRenderer comp={component} isEditor={false} />;
    case 'link':
      return <LinkRenderer comp={component} isEditor={false} />;
    case 'attend':
      return <AttendRenderer comp={component} isEditor={false} />;
    case 'map':
      return <MapView {...(component.props || {})} comp={component} />;
    case 'dday':
      return <DdayRenderer comp={component} isEditor={false} />;
    case 'weddingContact':
      return <WeddingContactRenderer comp={component} isEditor={false} />;
    case 'weddingInvite':
      return <WeddingInviteRenderer comp={component} isEditor={false} />;
    case 'image':
      return <ImageRenderer comp={component} isEditor={false} />;
    case 'gridGallery':
      return <GridGalleryRenderer comp={component} isEditor={false} />;
    case 'slideGallery':
      return <SlideGalleryRenderer comp={component} isEditor={false} />;
    case 'mapInfo':
      return <MapInfoRenderer comp={component} isEditor={false} />;
    case 'calendar':
      return <CalendarRenderer comp={component} isEditor={false} />;
    case 'bankAccount':
      return <BankAccountRenderer comp={component} isEditor={false} />;
    case 'comment':
      return <CommentRenderer comp={component} isEditor={false} />;
    case 'slido':
      return <SlidoRenderer comp={component} isEditor={false} />;
    case 'musicPlayer':
      return <MusicRenderer comp={component} isEditor={false} />;
    case 'kakaotalkShare':
      return <KakaoTalkShareRenderer comp={component} isEditor={false} />;
    case 'page':
      return <PageRenderer component={component} isEditor={false} />;
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

// 컴포넌트들의 실제 영역 계산
const calculateActualDimensions = (components) => {
  if (!components || components.length === 0) {
    return { width: 400, height: 300, offsetX: 0, offsetY: 0 };
  }

  let maxX = 0;
  let maxY = 0;
  let minX = Infinity;
  let minY = Infinity;

  components.forEach((component) => {
    const x = component.x || 0;
    const y = component.y || 0;
    const width =
      component.width || getComponentDimensions(component.type).defaultWidth;
    const height =
      component.height || getComponentDimensions(component.type).defaultHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  const actualWidth = Math.max(400, maxX - minX + 40); // 최소 400px + 여백 40px
  const actualHeight = Math.max(300, maxY - minY + 40); // 최소 300px + 여백 40px

  return {
    width: actualWidth,
    height: actualHeight,
    offsetX: Math.max(0, minX - 20), // 왼쪽 여백 20px
    offsetY: Math.max(0, minY - 20), // 위쪽 여백 20px
  };
};

const PreviewRenderer = ({ components = [], forcedViewport = null }) => {
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  
  // 캔버스 에디터와 동일한 고정 크기 사용
  const canvasWidth = forcedViewport === 'mobile' ? 375 : 1920;
  const canvasHeight = forcedViewport === 'mobile' ? 667 : 1080;

  // 데스크톱 모드에서만 스케일 계산
  useEffect(() => {
    if (forcedViewport !== 'desktop' || !containerRef.current) {
      return;
    }

    const calculateScale = () => {
      const parentElement = containerRef.current.parentElement;
      if (!parentElement) return;

      const availableWidth = parentElement.clientWidth;
      const availableHeight = parentElement.clientHeight;

      const scaleX = availableWidth / canvasWidth;
      const scaleY = availableHeight / canvasHeight;

      setScale(Math.min(scaleX, scaleY));
    };

    calculateScale();

    const iframeWindow = containerRef.current.ownerDocument.defaultView;
    iframeWindow.addEventListener('resize', calculateScale);

    return () => {
      iframeWindow.removeEventListener('resize', calculateScale);
    };
  }, [forcedViewport, canvasWidth, canvasHeight]);

  if (forcedViewport === 'mobile') {
    const rows = groupComponentsIntoRows(components);

    return (
      <div
        className="page-container"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row-wrapper">
            {row.map((component) => (
              <div
                key={component.id}
                className="component-wrapper"
                style={{
                  order: Math.floor((component.x || 0) / 10),
                  width: `${component.width || getComponentDimensions(component.type).defaultWidth}px`,
                }}
              >
                <ComponentRenderer component={component} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 데스크톱 모드: 자동 스케일링으로 iframe에 맞게 표시
  return (
    <div
      ref={containerRef}
      className="page-container"
      style={{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        position: 'relative',
        background: '#ffffff',
        margin: 0,
        padding: 0,
        overflow: 'visible',
        boxSizing: 'border-box',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {components.map((component) => (
        <div
          key={component.id}
          className="desktop-absolute-wrapper"
          style={{
            position: 'absolute',
            left: component.x || 0,
            top: component.y || 0,
            width:
              component.width ||
              getComponentDimensions(component.type).defaultWidth,
            height:
              component.height ||
              getComponentDimensions(component.type).defaultHeight,
          }}
        >
          <ComponentRenderer component={component} />
        </div>
      ))}
    </div>
  );
};

export default PreviewRenderer;
