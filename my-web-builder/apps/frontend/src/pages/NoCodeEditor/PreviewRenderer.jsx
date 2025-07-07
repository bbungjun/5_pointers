import React, { useState, useEffect } from 'react';
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
import {
  getFinalStyles,
  VIEWPORT_CONFIGS,
  CANVAS_SIZES,
} from './utils/editorUtils';

// 컴포넌트 definitions import
import buttonDef from '../components/definitions/button.json';
import textDef from '../components/definitions/text.json';
import linkDef from '../components/definitions/link.json';
import mapDef from '../components/definitions/map.json';
import attendDef from '../components/definitions/attend.json';
import imageDef from '../components/definitions/image.json';
import ddayDef from '../components/definitions/d-day.json';
import weddingContactDef from '../components/definitions/wedding-contact.json';
import weddingInviteDef from '../components/definitions/wedding-invite.json';
import bankAccountDef from '../components/definitions/bank-account.json';
import gridGalleryDef from '../components/definitions/grid-gallery.json';
import slideGalleryDef from '../components/definitions/slide-gallery.json';
import mapInfoDef from '../components/definitions/map_info.json';
import calendarDef from '../components/definitions/calendar.json';
import commentDef from '../components/definitions/comment.json';

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
  weddingInvite: weddingInviteDef,
  bankAccount: bankAccountDef,
  gridGallery: gridGalleryDef,
  slideGallery: slideGalleryDef,
  mapInfo: mapInfoDef,
  calendar: calendarDef,
  comment: commentDef,
};

/**
 * PreviewRenderer - iframe 내부에서 실제 페이지를 렌더링하는 순수 컴포넌트
 *
 * 이 컴포넌트는:
 * 1. 편집 기능이 완전히 제거된 순수한 렌더링만 담당
 * 2. 실제 배포 환경과 동일한 모습을 보여줌
 * 3. 드래그, 선택, 편집 등의 에디터 기능은 포함하지 않음
 * 4. 실제 화면 크기에 따른 반응형 렌더링 지원
 */
const PreviewRenderer = ({
  pageContent,
  isEditor = false,
  editingViewport = 'desktop',
}) => {
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

  // 컴포넌트 렌더링 함수
  const renderComponent = (comp) => {
    const componentContent = (() => {
      switch (comp.type) {
        case 'button':
          return <ButtonRenderer comp={comp} isEditor={isEditor} />;
        case 'text':
          return <TextRenderer comp={comp} isEditor={isEditor} />;
        case 'link':
          return <LinkRenderer comp={comp} isEditor={isEditor} />;
        case 'attend':
          return <AttendRenderer comp={comp} isEditor={isEditor} />;
        case 'map':
          return <MapView {...comp} isEditor={isEditor} />;
        case 'dday':
          return <DdayRenderer comp={comp} isEditor={isEditor} />;
        case 'weddingContact':
          return <WeddingContactRenderer comp={comp} isEditor={isEditor} />;
        case 'weddingInvite':
          return <WeddingInviteRenderer comp={comp} isEditor={isEditor} />;
        case 'image':
          return <ImageRenderer comp={comp} isEditor={isEditor} />;
        case 'gridGallery':
          return <GridGalleryRenderer comp={comp} isEditor={isEditor} />;
        case 'slideGallery':
          return <SlideGalleryRenderer comp={comp} isEditor={isEditor} />;
        case 'mapInfo':
          return <MapInfoRenderer comp={comp} isEditor={isEditor} />;
        case 'calendar':
          return <CalendarRenderer comp={comp} isEditor={isEditor} />;
        case 'comment':
          return <CommentRenderer comp={comp} isEditor={isEditor} />;
        case 'bankAccount':
          return <BankAccountRenderer comp={comp} isEditor={isEditor} />;
        default:
          return null;
      }
    })();

    if (!componentContent) return null;

    // 편집 모드: absolute positioning 사용
    if (isEditor) {
      return (
        <div
          key={comp.id}
          className="editor-component"
          style={{
            position: 'absolute',
            left: comp.x,
            top: comp.y,
            width: comp.width,
            height: comp.height,
          }}
        >
          {componentContent}
        </div>
      );
    }

    // 미리보기/배포 모드: 일반 CSS 레이아웃 사용
    return (
      <div key={comp.id} className={`preview-component ${comp.type}`}>
        {componentContent}
      </div>
    );
  };

  // 편집 모드: 고정된 캔버스 크기
  if (isEditor) {
    const canvasSize = CANVAS_SIZES[editingViewport];
    return (
      <div
        className="editor-canvas"
        style={{
          position: 'relative',
          width: canvasSize.width,
          height: canvasSize.height,
          background: '#ffffff',
          margin: '0 auto',
          overflow: 'visible',
        }}
      >
        {pageContent.map(renderComponent)}
      </div>
    );
  }

  // 미리보기/배포 모드: 반응형 레이아웃
  return (
    <div className="preview-container">{pageContent.map(renderComponent)}</div>
  );
};

export default PreviewRenderer;
