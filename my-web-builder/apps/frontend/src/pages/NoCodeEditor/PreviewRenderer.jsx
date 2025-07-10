import React from 'react';
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
import MapInfoRenderer from './ComponentRenderers/MapInfoRenderer';
import CalendarRenderer from './ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './ComponentRenderers/BankAccountRenderer';
import CommentRenderer from './ComponentRenderers/CommentRenderer';
import { groupComponentsIntoRows } from './utils/editorUtils';
import './styles/preview.css';

const PreviewRenderer = ({ pageContent, forcedViewport }) => {
  if (!pageContent || !Array.isArray(pageContent)) {
    return (
      <div className="empty-page">
        <div>
          <div className="empty-page-icon">📄</div>
          <div>페이지에 컴포넌트를 추가해보세요</div>
        </div>
      </div>
    );
  }

  // 뷰포트 모드 결정
  const isMobileMode = forcedViewport === 'mobile' || (!forcedViewport && window.innerWidth <= 768);
  
  // 개별 컴포넌트 렌더링 함수
  const renderComponent = (comp) => {
    const componentContent = (() => {
      switch (comp.type) {
        case 'button':
          return <ButtonRenderer comp={comp} />;
        case 'text':
          return <TextRenderer comp={comp} />;
        case 'link':
          return <LinkRenderer comp={comp} />;
        case 'attend':
          return <AttendRenderer comp={comp} />;
        case 'map':
          return <MapView {...comp.props} />;
        case 'dday':
          return <DdayRenderer comp={comp} />;
        case 'weddingContact':
          return <WeddingContactRenderer comp={comp} />;
        case 'weddingInvite':
          return <WeddingInviteRenderer comp={comp} />;
        case 'image':
          return <ImageRenderer comp={comp} />;
        case 'gridGallery':
          return <GridGalleryRenderer comp={comp} />;
        case 'slideGallery':
          return <SlideGalleryRenderer comp={comp} />;
        case 'mapInfo':
          return <MapInfoRenderer comp={comp} />;
        case 'calendar':
          return <CalendarRenderer comp={comp} />;
        case 'bankAccount':
          return <BankAccountRenderer comp={comp} />;
        case 'comment':
          return <CommentRenderer comp={comp} />;
        default:
          return null;
      }
    })();

    if (!componentContent) return null;

    // 데스크톱: 절대 위치 유지, 모바일: 세로 정렬
    if (isMobileMode) {
      // 모바일에서는 세로 정렬 + 너비 축소
      return (
        <div
          key={comp.id}
          className="component"
          style={{
            width: comp.width ? `${comp.width}px` : 'auto',
            height: comp.height ? `${comp.height}px` : 'auto',
            marginBottom: '16px',
          }}
        >
          {componentContent}
        </div>
      );
    } else {
      // 데스크톱에서는 절대 위치 유지
      return (
        <div
          key={comp.id}
          style={{
            position: 'absolute',
            left: comp.x || 0,
            top: comp.y || 0,
            width: comp.width || 'auto',
            height: comp.height || 'auto',
          }}
        >
          {componentContent}
        </div>
      );
    }
  };

  if (isMobileMode) {
    // 모바일: 세로 정렬 레이아웃
    const rows = groupComponentsIntoRows(pageContent);
    return (
      <div className="page-container mobile" style={{ padding: '16px' }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {row.map(renderComponent)}
          </div>
        ))}
      </div>
    );
  } else {
    // 데스크톱: 절대 위치 레이아웃
    const maxHeight = Math.max(
      1080,
      ...pageContent.map(comp => (comp.y || 0) + (comp.height || 100))
    );
    
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
        {pageContent.map(renderComponent)}
      </div>
    );
  }
};

export default PreviewRenderer;