import React, { useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

// Next.js 서브도메인 서버용 API 설정
const API_BASE_URL =
  process.env.API_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://ddukddak.org/api'
    : 'http://localhost:3000/api');

// 실제 프론트엔드 컴포넌트들을 import
import ButtonRenderer from '../components/renderers/ButtonRenderer.jsx';
import TextRenderer from '../components/renderers/TextRenderer.jsx';
import LinkRenderer from '../components/renderers/LinkRenderer.jsx';
import AttendRenderer from '../components/renderers/AttendRenderer.jsx';
import ImageRenderer from '../components/renderers/ImageRenderer.jsx';
import MapInfoRenderer from '../components/renderers/MapInfoRenderer.jsx';
import DdayRenderer from '../components/renderers/DdayRenderer.jsx';
import WeddingContactRenderer from '../components/renderers/WeddingContactRenderer.jsx';
import GridGalleryRenderer from '../components/renderers/GridGalleryRenderer.jsx';
import SlideGalleryRenderer from '../components/renderers/SlideGalleryRenderer.jsx';
import CalendarRenderer from '../components/renderers/CalendarRenderer.jsx';
import BankAccountRenderer from '../components/renderers/BankAccountRenderer.jsx';
import CommentRenderer from '../components/renderers/CommentRenderer.jsx';
import SlidoRenderer from '../components/renderers/SlidoRenderer.jsx';
import WeddingInviteRenderer from '../components/renderers/WeddingInviteRenderer.jsx';
import MusicRenderer from '../components/renderers/MusicRenderer.jsx';
import KakaoTalkShareRenderer from '../components/renderers/KakaoTalkShareRenderer.jsx';
import MapView from '../components/renderers/MapView.jsx';
import PageRenderer from '../components/renderers/PageRenderer.jsx';
import PageButtonRenderer from '../components/renderers/PageButtonRenderer.jsx';
import LinkCopyRenderer from '../components/renderers/LinkCopyRenderer.jsx';

// API 설정을 전역으로 설정 (컴포넌트들이 사용할 수 있도록)
if (typeof window !== 'undefined') {
  (window as any).API_BASE_URL = API_BASE_URL;
  console.log('🔧 Next.js 서버 - API_BASE_URL 설정됨:', API_BASE_URL);
  console.log('🔧 Next.js 서버 - NODE_ENV:', process.env.NODE_ENV);
}

// 컴포넌트 타입별 렌더러 매핑 함수
const getRendererByType = (type: string) => {
  const renderers: { [key: string]: React.ComponentType<any> } = {
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

  console.log(
    `🎯 Getting renderer for type: ${type}`,
    renderers[type] ? 'Found' : 'Not found'
  );
  return renderers[type] || null;
};

const DynamicPageRenderer = ({
  components,
  pageId,
  subdomain,
  editingMode = 'desktop',
}: {
  components: ComponentData[];
  pageId: string;
  subdomain?: string;
  editingMode?: 'desktop' | 'mobile';
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileScale, setMobileScale] = useState(1);
  const [desktopScale, setDesktopScale] = useState(1);
  const BASE_DESKTOP_WIDTH = 1920;
  const BASE_MOBILE_WIDTH = 375;

  useEffect(() => {
    const checkViewport = () => {
      const currentWidth = window.innerWidth;
      const isMobile = currentWidth <= 768;
      setIsMobileView(isMobile);

      if (isMobile) {
        const newScale = currentWidth / BASE_MOBILE_WIDTH;
        setMobileScale(newScale);
      } else {
        if (editingMode === 'desktop') {
          const newScale = currentWidth / BASE_DESKTOP_WIDTH;
          setDesktopScale(newScale);
        }
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, [editingMode]);

  const getComponentDefaultSize = (componentType: string) => {
    const defaultSizes: { [key: string]: { width: number; height: number } } = {
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

  // 3. renderDesktopLayout 함수 정의
  const renderDesktopLayout = () => {
    // (a) 콘텐츠 높이 계산
    const contentHeight =
      Math.max(
        0, // components가 비어있을 경우를 대비
        ...components.map((comp) => {
          const defaultSize = getComponentDefaultSize(comp.type);
          return (comp.y || 0) + (comp.height || defaultSize.height);
        })
      ) + 50; // 하단 여백 50px 추가

    return (
      // 바깥 래퍼: 스케일링된 높이만 적용. 포지셔닝 관련 스타일은 모두 제거
      <div
        style={{
          width: '100%',
          height: `${contentHeight * desktopScale}px`,
        }}
      >
        {/* 안쪽 스테이지: 포지셔닝을 모두 제거하고, transform과 transform-origin만 남김 */}
        <div
          style={{
            width: `${BASE_DESKTOP_WIDTH}px`,
            height: `${contentHeight}px`,
            // position, left 속성 모두 제거!
            transform: `scale(${desktopScale})`,
            transformOrigin: 'top left', // 기준점을 좌측 상단으로 고정
          }}
        >
          {components.map((comp) => {
            const RendererComponent = getRendererByType(comp.type);
            if (!RendererComponent) {
              console.warn(
                '❌ Desktop: No renderer found for type:',
                comp.type
              );
              return null;
            }

            const defaultSize = getComponentDefaultSize(comp.type);
            const originalWidth = comp.width || defaultSize.width;
            const originalHeight = comp.height || defaultSize.height;

            return (
              <div
                key={comp.id}
                className="component-container"
                style={{
                  position: 'absolute',
                  left: `${comp.x || 0}px`,
                  top: `${comp.y || 0}px`,
                  width: `${originalWidth}px`,
                  height: `${originalHeight}px`,
                  zIndex: 2,
                }}
              >
                <RendererComponent
                  {...comp.props}
                  comp={{
                    ...comp,
                    width: originalWidth,
                    height: originalHeight,
                  }}
                  mode="live"
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

  // ✅ 스케일링 전용 렌더링 함수: 이제 인자를 받도록 수정
  const renderMobileScalingLayout = (componentsToRender: ComponentData[]) => {
    const PAGE_VERTICAL_PADDING = 16; // 상수를 공유하거나 동일한 값 사용
    // 맨 마지막 컴포넌트 하단에 여백을 주기 위해 높이 계산 시 패딩 추가
    const contentHeight =
      Math.max(
        0,
        ...componentsToRender.map(
          (c: ComponentData) => (c.y || 0) + (c.height || 0)
        )
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
          {componentsToRender.map((comp: ComponentData) => {
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
                  mode="live"
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

  // ✅ 메인 모바일 렌더링 함수: 데이터 변환 후 스케일링 함수를 호출하는 역할
  const renderMobileLayout = () => {
    if (editingMode === 'mobile') {
      // 시나리오 1: mobile 편집 -> mobile 뷰. 원본 데이터 그대로 스케일링
      return renderMobileScalingLayout(components);
    } else {
      // 시나리오 2: desktop 편집 -> mobile 뷰.
      // 1. 먼저 데이터를 모바일용으로 재배치합니다.
      const sortedComponents = [...components].sort(
        (a, b) => (a.y || 0) - (b.y || 0) || (a.x || 0) - (b.x || 0)
      );

      const repositionedComponents = [];

      const PAGE_VERTICAL_PADDING = 16; // 상단 여백
      let currentY = PAGE_VERTICAL_PADDING;

      for (const comp of sortedComponents) {
        const originalWidth =
          comp.width || getComponentDefaultSize(comp.type).width;
        const originalHeight =
          comp.height || getComponentDefaultSize(comp.type).height;

        let newWidth = originalWidth;
        let newHeight = originalHeight;
        let newX = 0;

        if (originalWidth > BASE_MOBILE_WIDTH) {
          newWidth = BASE_MOBILE_WIDTH;
          if (originalWidth > 0) {
            const aspectRatio = originalHeight / originalWidth;
            newHeight = newWidth * aspectRatio;
          }
          newX = 0;
        } else {
          newX = (BASE_MOBILE_WIDTH - originalWidth) / 2;
        }

        repositionedComponents.push({
          ...comp,
          x: newX,
          y: currentY,
          width: newWidth,
          height: newHeight,
        });

        // ❗️ 컴포넌트 간 여백 없이 y좌표 업데이트
        currentY += newHeight;
      }

      // 2. 재배치된 새로운 데이터를 스케일링 함수에 전달하여 렌더링합니다.
      return renderMobileScalingLayout(repositionedComponents);
    }
  };

  return (
      <div
        className="page-container"
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#ffffff',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {components && components.length > 0 ? (
          isMobileView ? (
            renderMobileLayout()
          ) : (
            renderDesktopLayout()
          )
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '60px 40px',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎨</div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '12px',
                }}
              >
                빈 페이지입니다
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6',
                }}
              >
                아직 컴포넌트가 추가되지 않았습니다.
                <br />
                에디터에서 컴포넌트를 추가해보세요!
              </p>
            </div>
          </div>
        )}
      </div>
  );
};

interface ComponentData {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  props: any;
}

interface PageProps {
  pageData: {
    components: ComponentData[];
    pageId?: string;
    editingMode?: 'desktop' | 'mobile';
  } | null;
  pageId: string;
  subdomain?: string;
  pageTitle?: string;
  pageDescription?: string;
  pageImageUrl?: string;
  currentUrl?: string;
}

const ErrorPage = ({
  message,
  subdomain,
}: {
  message: string;
  subdomain?: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        padding: '60px 40px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
      }}
    >
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>{message}</p>
    </div>
  </div>
);

const RenderedPage = ({
  pageData,
  pageId,
  subdomain,
  pageTitle,
  pageDescription,
  pageImageUrl,
  currentUrl,
}: PageProps) => {
  if (!pageData) {
    return (
      <ErrorPage
        message="요청하신 페이지가 존재하지 않습니다."
        subdomain={subdomain}
      />
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle || `${subdomain || '페이지'} - My Web Builder`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph 메타태그 */}
        <meta property="og:title" content={pageTitle || `${subdomain || '페이지'}`} />
        <meta property="og:description" content={pageDescription || '개인화된 웹페이지입니다.'} />
        {pageImageUrl && <meta property="og:image" content={pageImageUrl} />}
        <meta property="og:url" content={currentUrl || `https://${subdomain}.ddukddak.org`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ddukddak" />
        
        {/* Twitter Card 메타태그 */}
        <meta name="twitter:card" content={pageImageUrl ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={pageTitle || `${subdomain || '페이지'}`} />
        <meta name="twitter:description" content={pageDescription || '개인화된 웹페이지입니다.'} />
        {pageImageUrl && <meta name="twitter:image" content={pageImageUrl} />}
        
        {/* 추가 메타태그 */}
        <meta name="description" content={pageDescription || '개인화된 웹페이지입니다.'} />
        <meta name="keywords" content="웹페이지, 개인화, 커스텀" />
        
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DynamicPageRenderer
        components={pageData.components}
        pageId={pageData.pageId || pageId}
        subdomain={subdomain}
        editingMode={pageData.editingMode}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params!;
  const { req } = context;

  try {
    const host = req.headers.host || '';
    let subdomain = pageId as string;

    if (host.includes('.localhost')) {
      subdomain = host.split('.')[0];
    } else if (host.includes('.')) {
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    // 테스트용 mock 데이터
    if (
      subdomain === 'test123' ||
      subdomain === 'demo' ||
      subdomain === 'test'
    ) {
      const mockPageData = {
        pageId: subdomain,
        editingMode: 'mobile', // 테스트를 위해 mobile로 설정
        components: [
          {
            id: 'test-button-1',
            type: 'button',
            x: 50,
            y: 50,
            width: 150,
            height: 50,
            props: {
              text: '테스트 버튼',
              bg: '#3B4EFF',
              color: '#fff',
            },
          },
          {
            id: 'test-text-1',
            type: 'text',
            x: 50,
            y: 120,
            width: 275,
            height: 40,
            props: {
              text: '모바일 편집 테스트 텍스트입니다',
              fontSize: 16,
              color: '#333',
            },
          },
          {
            id: 'test-image-1',
            type: 'image',
            x: 50,
            y: 180,
            width: 275,
            height: 200,
            props: {
              src: 'https://via.placeholder.com/275x200/FF6B6B/FFFFFF?text=Test+Image',
              alt: '테스트 이미지',
            },
          },
        ],
      };

      // 테스트 데이터에서 메타 정보 추출
      const titleComponent = mockPageData.components.find((comp: any) => comp.type === 'text');
      const pageTitle = titleComponent?.props?.text || `${subdomain || '페이지'}`;
      
      const imageComponent = mockPageData.components.find((comp: any) => comp.type === 'image');
      const pageImageUrl = (imageComponent?.props as any)?.src || '';
      
      const currentUrl = `https://${subdomain}.ddukddak.org`;

      return {
        props: {
          pageData: mockPageData,
          pageId: subdomain,
          subdomain,
          pageTitle,
          pageImageUrl,
          currentUrl,
        },
      };
    }

    // 데스크톱 편집 테스트용 mock 데이터
    if (subdomain === 'desktop-test') {
      const mockPageData = {
        pageId: subdomain,
        editingMode: 'desktop', // 데스크톱 편집 테스트
        components: [
          {
            id: 'desktop-button-1',
            type: 'button',
            x: 100,
            y: 50,
            width: 200,
            height: 60,
            props: {
              text: '데스크톱 버튼',
              bg: '#FF6B6B',
              color: '#fff',
            },
          },
          {
            id: 'desktop-text-1',
            type: 'text',
            x: 100,
            y: 130,
            width: 400,
            height: 50,
            props: {
              text: '데스크톱 편집 테스트 텍스트입니다',
              fontSize: 18,
              color: '#333',
            },
          },
        ],
      };

      // 데스크톱 테스트 데이터에서 메타 정보 추출
      const titleComponent = mockPageData.components.find((comp: any) => comp.type === 'text');
      const pageTitle = titleComponent?.props?.text || `${subdomain || '페이지'}`;
      const pageDescription = '개인화된 웹페이지입니다.';
      
      const imageComponent = mockPageData.components.find((comp: any) => comp.type === 'image');
      const pageImageUrl = (imageComponent?.props as any)?.src || '';
      
      const currentUrl = `https://${subdomain}.ddukddak.org`;

      return {
        props: {
          pageData: mockPageData,
          pageId: subdomain,
          subdomain,
          pageTitle,
          pageDescription,
          pageImageUrl,
          currentUrl,
        },
      };
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'SubdomainNextJS/1.0',
    };

    if (req.headers['x-forwarded-for']) {
      headers['X-Forwarded-For'] = req.headers['x-forwarded-for'] as string;
    }

    const res = await fetch(
      `${API_BASE_URL}/generator/subdomain/${subdomain}`,
      {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'PAGE_NOT_FOUND',
        },
      };
    }

    const pageData = await res.json();

    if (!Array.isArray(pageData.components)) {
      pageData.components = [];
    }

    // 메타 정보 추출
    const titleComponent = pageData.components.find((comp: ComponentData) => comp.type === 'text');
    const pageTitle = titleComponent?.props?.text || `${subdomain || '페이지'}`;
    const pageDescription = titleComponent?.props?.description || '개인화된 웹페이지입니다.';
    
    const imageComponent = pageData.components.find((comp: ComponentData) => comp.type === 'image');
    const pageImageUrl = imageComponent?.props?.src || '';
    
    const currentUrl = `https://${subdomain}.ddukddak.org`;

    // 컴포넌트 크기 데이터 확인
    console.log(
      '🔧 API에서 받은 컴포넌트 데이터:',
      pageData.components.map((comp: ComponentData) => ({
        id: comp.id,
        type: comp.type,
        width: comp.width,
        height: comp.height,
        x: comp.x,
        y: comp.y,
      }))
    );

    return {
      props: {
        pageData: {
          components: pageData.components,
          pageId: pageData.pageId || subdomain,
          editingMode: pageData.editingMode || 'desktop', // editingMode 추가
        },
        pageId: subdomain,
        subdomain,
        // 메타 정보 추가
        pageTitle,
        pageDescription,
        pageImageUrl,
        currentUrl,
      },
    };
  } catch (error) {
    return {
      props: {
        pageData: null,
        pageId: pageId as string,
        subdomain: pageId as string,
        error: 'NETWORK_ERROR',
        // 기본 메타 정보 추가
        pageTitle: `${pageId} - My Web Builder`,
        pageDescription: '개인화된 웹페이지입니다.',
        pageImageUrl: '',
        currentUrl: `https://${pageId}.ddukddak.org`,
      },
    };
  }
};

export default RenderedPage;
