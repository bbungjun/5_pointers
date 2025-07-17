import React, { useState, useEffect, useRef } from 'react';
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

// --- Helper Functions (배포 페이지와 동일한 로직) ---
const getComponentDefaultSize = (componentType) => {
  const defaultSizes = {
    slido: { width: 400, height: 300 },
    button: { width: 150, height: 50 },
    text: { width: 200, height: 50 },
    image: { width: 200, height: 150 },
    map: { width: 400, height: 300 },
    attend: { width: 300, height: 200 },
    dday: { width: 250, height: 100 },
    default: { width: 200, height: 100 },
  };
  return defaultSizes[componentType] || defaultSizes.default;
};

// 컴포넌트 타입별 렌더러 매핑 함수
const getRendererByType = (type) => {
  const renderers = {
    button: ButtonRenderer,
    text: TextRenderer,
    link: LinkRenderer,
    attend: AttendRenderer,
    image: ImageRenderer,
    mapInfo: MapInfoRenderer,
    dday: DdayRenderer,
    weddingContact: WeddingContactRenderer,
    gridGallery: GridGalleryRenderer,
    slideGallery: SlideGalleryRenderer,
    calendar: CalendarRenderer,
    bankAccount: BankAccountRenderer,
    comment: CommentRenderer,
    slido: SlidoRenderer,
    weddingInvite: WeddingInviteRenderer,
    map: MapView,
    musicPlayer: MusicRenderer,
    kakaotalkShare: KakaoTalkShareRenderer,
    page: PageRenderer,
    music: MusicRenderer,
    kakaoTalkShare: KakaoTalkShareRenderer,
    pageButton: PageButtonRenderer,
    linkCopy: LinkCopyRenderer,
  };

  return renderers[type] || null;
};

const PreviewRenderer = ({
  components = [],
  forcedViewport,
  editingViewport,
  pageId,
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileScale, setMobileScale] = useState(1);
  const [desktopScale, setDesktopScale] = useState(1);
  const BASE_DESKTOP_WIDTH = 1920;
  const BASE_MOBILE_WIDTH = 375;

  // 컨테이너 너비를 측정하여 상태에 저장
  useEffect(() => {
    if (containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          setContainerWidth(entries[0].contentRect.width);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  // 스케일 계산 로직 (window 대신 containerWidth 사용)
  useEffect(() => {
    if (containerWidth === 0) return;

    const currentWidth = containerWidth;
    const isMobile = forcedViewport === 'mobile';
    setIsMobileView(isMobile);

    if (isMobile) {
      const newScale = currentWidth / BASE_MOBILE_WIDTH;
      setMobileScale(newScale);
    } else {
      if (editingViewport === 'desktop') {
        const newScale = currentWidth / BASE_DESKTOP_WIDTH;
        setDesktopScale(newScale);
      }
    }
  }, [containerWidth, forcedViewport, editingViewport]);

  // --- 렌더링 함수들 (배포 페이지와 100% 동일한 로직) ---

  const renderDesktopLayout = () => {
    const contentHeight =
      Math.max(
        0,
        ...components.map(
          (c) =>
            (c.y || 0) + (c.height || getComponentDefaultSize(c.type).height)
        )
      ) + 50;
    return (
      <div
        style={{ width: '100%', height: `${contentHeight * desktopScale}px` }}
      >
        <div
          style={{
            width: `${BASE_DESKTOP_WIDTH}px`,
            height: `${contentHeight}px`,
            transform: `scale(${desktopScale})`,
            transformOrigin: 'top left',
          }}
        >
          {components.map((comp) => {
            const RendererComponent = getRendererByType(comp.type);
            if (!RendererComponent) return null;
            const originalWidth =
              comp.width || getComponentDefaultSize(comp.type).width;
            const originalHeight =
              comp.height || getComponentDefaultSize(comp.type).height;
            return (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: `${comp.x || 0}px`,
                  top: `${comp.y || 0}px`,
                  width: `${originalWidth}px`,
                  height: `${originalHeight}px`,
                }}
              >
                <RendererComponent
                  {...comp.props}
                  comp={{
                    ...comp,
                    width: originalWidth,
                    height: originalHeight,
                  }}
                  mode="preview"
                  isEditor={false}
                  pageId={pageId}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMobileScalingLayout = (componentsToRender) => {
    const contentHeight =
      Math.max(
        0,
        ...componentsToRender.map((c) => (c.y || 0) + (c.height || 0))
      ) + 50;
    return (
      <div
        style={{ width: '100%', height: `${contentHeight * mobileScale}px` }}
      >
        <div
          style={{
            width: `${BASE_MOBILE_WIDTH}px`,
            height: `${contentHeight}px`,
            transform: `scale(${mobileScale})`,
            transformOrigin: 'top left',
          }}
        >
          {componentsToRender.map((comp) => {
            const RendererComponent = getRendererByType(comp.type);
            if (!RendererComponent) return null;
            return (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: `${comp.x || 0}px`,
                  top: `${comp.y || 0}px`,
                  width: `${comp.width}px`,
                  height: `${comp.height}px`,
                }}
              >
                <RendererComponent
                  {...comp.props}
                  comp={{ ...comp }}
                  mode="preview"
                  isEditor={false}
                  pageId={pageId}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMobileLayout = () => {
    if (editingViewport === 'mobile') {
      return renderMobileScalingLayout(components);
    } else {
      const sortedComponents = [...components].sort(
        (a, b) => (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0)
      );
      const repositionedComponents = [];
      let currentY = 0;
      const mobileCanvasContentWidth = BASE_MOBILE_WIDTH;

      for (const comp of sortedComponents) {
        const originalWidth =
          comp.width || getComponentDefaultSize(comp.type).width;
        const originalHeight =
          comp.height || getComponentDefaultSize(comp.type).height;
        const aspectRatio = originalHeight / originalWidth;
        const newHeight =
          originalWidth > 0
            ? mobileCanvasContentWidth * aspectRatio
            : originalHeight;

        repositionedComponents.push({
          ...comp,
          x: 0,
          y: currentY,
          width: mobileCanvasContentWidth,
          height: newHeight,
        });
        currentY += newHeight; // ❗️ 컴포넌트 사이 간격을 0으로 하여 겹치지 않게 붙임
      }
      return renderMobileScalingLayout(repositionedComponents);
    }
  };

  // --- 최종 return 문 ---
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {containerWidth > 0
        ? isMobileView
          ? renderMobileLayout()
          : renderDesktopLayout()
        : null}
    </div>
  );
};

export default PreviewRenderer;
