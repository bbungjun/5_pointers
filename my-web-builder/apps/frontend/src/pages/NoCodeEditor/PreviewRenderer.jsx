import React from 'react';
import { groupComponentsIntoRows, getComponentDimensions } from './utils/editorUtils';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import MapView from './ComponentEditors/MapView';
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
      return <MapView {...(component.props || {})} />;
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
        <div style={{ width: '100%', height: '100%', border: '1px solid #ccc', ...component.props?.style }}>
          {component.type}
        </div>
      );
  }
};

const DESKTOP_CANVAS_WIDTH = 1920;
const DESKTOP_CANVAS_HEIGHT = 1080;

const PreviewRenderer = ({ components = [], forcedViewport = null }) => {
  if (forcedViewport === 'desktop') {
    return (
      <div 
        className="page-container"
        style={{
          width: `${DESKTOP_CANVAS_WIDTH}px`,
          height: `${DESKTOP_CANVAS_HEIGHT}px`,
          position: 'relative',
          background: '#ffffff',
        }}
      >
        {components.map(component => (
          <div
            key={component.id}
            className="desktop-absolute-wrapper"
            style={{
              left: component.x || 0,
              top: component.y || 0,
              width: component.width || getComponentDimensions(component.type).defaultWidth,
              height: component.height || getComponentDimensions(component.type).defaultHeight,
            }}
          >
            <ComponentRenderer component={component} />
          </div>
        ))}
      </div>
    );
  }

  if (forcedViewport === 'mobile') {
    const rows = groupComponentsIntoRows(components);
    
    return (
      <div 
        className="page-container desktop" 
        style={{ 
          position: 'relative',
          width: '1945px',
          height: `${maxHeight}px`,
          background: '#fff',
          border: '1px solid #e1e5e9',
          borderRadius: 12,
          margin: 0,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'visible',
        }}
      >
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="row-wrapper">
            {row.map(component => (
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

  return (
    <div 
      className="page-container"
      style={{
        width: `${DESKTOP_CANVAS_WIDTH}px`,
        height: `${DESKTOP_CANVAS_HEIGHT}px`,
        position: 'relative',
        background: '#ffffff',
      }}
    >
      {components.map(component => (
        <div
          key={component.id}
          className="desktop-absolute-wrapper"
          style={{
            left: component.x || 0,
            top: component.y || 0,
            width: component.width || getComponentDimensions(component.type).defaultWidth,
            height: component.height || getComponentDimensions(component.type).defaultHeight,
          }}
        >
          <ComponentRenderer component={component} />
        </div>
      ))}
    </div>
  );
};

export default PreviewRenderer;