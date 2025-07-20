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
    link: { width: 200, height: 50 },
    attend: { width: 300, height: 200 },
    dday: { width: 350, height: 150 },
    default: { width: 200, height: 100 },
  };
  return defaultSizes[componentType] || defaultSizes.default;
};

// --- 새로운 Helper 함수 ---

// 두 컴포넌트의 경계 상자가 겹치는지 확인하는 함수
const doComponentsOverlap = (compA, compB, defaultSizeGetter) => {
  const getRect = (comp) => {
    const defaultSize = defaultSizeGetter(comp.type);
    return {
      x: comp.x || 0,
      y: comp.y || 0,
      width: comp.width || defaultSize.width,
      height: comp.height || defaultSize.height,
    };
  };

  const rectA = getRect(compA);
  const rectB = getRect(compB);

  if (
    rectA.x + rectA.width <= rectB.x ||
    rectB.x + rectB.width <= rectA.x ||
    rectA.y + rectA.height <= rectB.y ||
    rectB.y + rectB.height <= rectA.y
  ) {
    return false;
  }
  return true;
};

// 겹치는 컴포넌트들을 그룹으로 묶는 함수
const groupOverlappingComponents = (components, defaultSizeGetter) => {
  if (!components || components.length === 0) return [];

  const sorted = [...components].sort(
    (a, b) => (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0)
  );
  const groups = [];
  const visited = new Set();

  for (let i = 0; i < sorted.length; i++) {
    if (visited.has(sorted[i].id)) continue;

    const currentGroup = [sorted[i]];
    visited.add(sorted[i].id);
    const queue = [sorted[i]];

    while (queue.length > 0) {
      const currentComp = queue.shift();
      for (let j = 0; j < sorted.length; j++) {
        // 전체를 다시 순회하여 모든 겹침 가능성 확인
        if (i === j || visited.has(sorted[j].id)) continue;
        if (doComponentsOverlap(currentComp, sorted[j], defaultSizeGetter)) {
          visited.add(sorted[j].id);
          currentGroup.push(sorted[j]);
          queue.push(sorted[j]);
        }
      }
    }
    groups.push(currentGroup);
  }
  return groups;
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
    const PAGE_VERTICAL_PADDING = 16; // 상수를 공유하거나 동일한 값 사용
    // 맨 마지막 컴포넌트 하단에 여백을 주기 위해 높이 계산 시 패딩 추가
    const contentHeight =
      Math.max(
        0,
        ...componentsToRender.map((c) => (c.y || 0) + (c.height || 0))
      ) + PAGE_VERTICAL_PADDING; // 하단 여백 추가
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

  // ✅ 메인 모바일 렌더링 함수: 그룹화 파이프라인 추가
  const renderMobileLayout = () => {
    if (editingViewport === 'mobile') {
      return renderMobileScalingLayout(components);
    } else {
      // 1. 겹치는 컴포넌트들을 먼저 그룹화합니다.
      const componentGroups = groupOverlappingComponents(
        components,
        getComponentDefaultSize
      );

      const repositionedComponents = [];
      const PAGE_VERTICAL_PADDING = 16;
      let currentY = PAGE_VERTICAL_PADDING;

      // 2. 개별 컴포넌트가 아닌, '그룹' 단위로 순회합니다.
      for (const group of componentGroups) {
        // 3. 그룹의 전체 경계 상자(Bounding Box)를 계산합니다.
        let minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;
        group.forEach((comp) => {
          const defaultSize = getComponentDefaultSize(comp.type);
          const x = comp.x || 0;
          const y = comp.y || 0;
          const width = comp.width || defaultSize.width;
          const height = comp.height || defaultSize.height;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        });
        const groupWidth = maxX - minX;
        const groupHeight = maxY - minY;

        // 4. 그룹 전체를 하나의 컴포넌트처럼 취급하여 조건부 리사이징을 적용합니다.
        let newGroupWidth = groupWidth;
        let newGroupHeight = groupHeight;
        let newGroupX = 0;
        let scaleRatio = 1;

        if (groupWidth > BASE_MOBILE_WIDTH) {
          newGroupWidth = BASE_MOBILE_WIDTH;
          scaleRatio = groupWidth > 0 ? newGroupWidth / groupWidth : 1;
          newGroupHeight = groupHeight * scaleRatio;
          newGroupX = 0;
        } else {
          newGroupX = (BASE_MOBILE_WIDTH - groupWidth) / 2;
        }

        // 5. 그룹 내의 각 컴포넌트 위치와 크기를 그룹의 변환에 맞춰 재계산합니다.
        group.forEach((comp) => {
          const defaultSize = getComponentDefaultSize(comp.type);
          const originalX = comp.x || 0;
          const originalY = comp.y || 0;
          const originalWidth = comp.width || defaultSize.width;
          const originalHeight = comp.height || defaultSize.height;

          const relativeX = originalX - minX;
          const relativeY = originalY - minY;

          // ❗️ 2. 새로운 props 객체를 만들어 dynamicScale을 주입합니다.
          const newProps = {
            ...comp.props,
            dynamicScale: scaleRatio, // 축소 비율을 props에 전달
          };

          repositionedComponents.push({
            ...comp,
            props: newProps, // ❗️ 수정된 props로 교체
            x: newGroupX + relativeX * scaleRatio,
            y: currentY + relativeY * scaleRatio,
            width: originalWidth * scaleRatio,
            height: originalHeight * scaleRatio,
          });
        });

        // ❗️ 3. 다음 그룹의 Y 위치를 업데이트할 때 여백을 추가합니다.
        currentY += newGroupHeight + PAGE_VERTICAL_PADDING;
      }

      // 6. 최종적으로 재배치된 컴포넌트들을 렌더링합니다.
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
