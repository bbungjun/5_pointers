import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

// Next.js 서브도메인 서버용 API 설정
const API_BASE_URL = process.env.API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'http://jungle-backend-prod-env.eba-ftfwcygq.ap-northeast-2.elasticbeanstalk.com/api'
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

// API 설정을 전역으로 설정 (컴포넌트들이 사용할 수 있도록)
if (typeof window !== 'undefined') {
  (window as any).API_BASE_URL = API_BASE_URL;
  console.log('🔧 Next.js 서버 - API_BASE_URL 설정됨:', API_BASE_URL);
  console.log('🔧 Next.js 서버 - NODE_ENV:', process.env.NODE_ENV);
}

// 컴포넌트 타입별 렌더러 매핑 함수
const getRendererByType = (type: string) => {
  const renderers: { [key: string]: React.ComponentType<any> } = {
    'button': ButtonRenderer,
    'text': TextRenderer,
    'link': LinkRenderer,
    'attend': AttendRenderer,
    'image': ImageRenderer,
    'mapInfo': MapInfoRenderer,
    'dday': DdayRenderer,
    'weddingContact': WeddingContactRenderer,
    'gridGallery': GridGalleryRenderer,
    'slideGallery': SlideGalleryRenderer,
    'calendar': CalendarRenderer,
    'bankAccount': BankAccountRenderer,
    'comment': CommentRenderer,
    'slido': SlidoRenderer,
    'weddingInvite': WeddingInviteRenderer,
    'map': MapView,
    'musicPlayer': MusicRenderer,
    'kakaotalkShare': KakaoTalkShareRenderer,
    'page': PageRenderer,
    'music': MusicRenderer,
    'kakaoTalkShare': KakaoTalkShareRenderer,
    'pageButton': PageButtonRenderer,
  };

  console.log(`🎯 Getting renderer for type: ${type}`, renderers[type] ? 'Found' : 'Not found');
  return renderers[type] || null;
};

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid rgba(255,255,255,0.3)',
        borderTop: '4px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }} />
      <div style={{ fontSize: '18px', fontWeight: '600' }}>
        페이지를 불러오는 중...
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

const DynamicPageRenderer = ({
  components,
  pageId,
  subdomain,
}: {
  components: ComponentData[];
  pageId: string;
  subdomain?: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkViewport = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (!isMounted) {
    return <LoadingSpinner />;
  }

  // 모바일에서 행 기반 레이아웃 사용
  const groupComponentsIntoRows = (components: ComponentData[]) => {
    const rows: ComponentData[][] = [];
    const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
    
    sortedComponents.forEach(component => {
      const componentY = component.y || 0;
      let addedToRow = false;
      
      for (let row of rows) {
        const rowY = row[0].y || 0;
        if (Math.abs(componentY - rowY) < 30) { // 30px 이내면 같은 행
          row.push(component);
          addedToRow = true;
          break;
        }
      }
      
      if (!addedToRow) {
        rows.push([component]);
      }
    });
    
    return rows;
  };

  const getComponentDefaultSize = (componentType: string) => {
    const defaultSizes: { [key: string]: { width: number; height: number } } = {
      slido: { width: 400, height: 300 },
      button: { width: 150, height: 50 },
      text: { width: 200, height: 50 },
      image: { width: 200, height: 150 },
      map: { width: 400, height: 300 },
      attend: { width: 300, height: 200 },
      dday: { width: 250, height: 100 },
      default: { width: 200, height: 100 }
    };
    return defaultSizes[componentType] || defaultSizes.default;
  };

  const rows = isMobileView ? groupComponentsIntoRows(components) : null;
  const sortedComponents = !isMobileView ? [...components].sort((a, b) => (a.y || 0) - (b.y || 0)) : null;

  return (
    <>
      <Head>
        <title>{subdomain ? `${subdomain} - My Web Builder` : 'My Web Builder'}</title>
        <meta name="description" content={`${subdomain || pageId}에서 만든 웹사이트입니다.`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            scroll-behavior: smooth;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            width: 100%;
            overflow-x: auto;
          }
          
          body {
            line-height: 1.6;
            color: #333;
          }
          
          @media (max-width: 768px) {
            .page-container {
              width: 100vw !important;
              min-width: 100vw !important;
              transform-origin: top left;
            }
            
            .component-container {
              max-width: calc(100vw - 20px);
            }
          }
          
          .component-container {
            transition: all 0.2s ease;
          }
          
          .component-container:hover {
            z-index: 10;
          }
        `}</style>
      </Head>
      
      <div
        className="page-container"
        style={{
          position: isMobileView ? 'static' : 'relative',
          display: isMobileView ? 'flex' : 'block',
          flexDirection: isMobileView ? 'column' : 'unset',
          alignItems: isMobileView ? 'center' : 'unset',
          justifyContent: isMobileView ? 'flex-start' : 'unset',
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          overflowX: 'hidden'
        }}
      >
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        <div style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          width: '100%',
          display: isMobileView ? 'flex' : 'block',
          flexDirection: isMobileView ? 'column' : 'unset',
          alignItems: isMobileView ? 'center' : 'unset',
        }}>
          {components && components.length > 0 ? (
            isMobileView ? (
              rows?.map((row, rowIndex) => (
                <div key={rowIndex} style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {row.map((comp) => {
                    const RendererComponent = getRendererByType(comp.type);
                    if (!RendererComponent) return null;
                    
                    const defaultSize = getComponentDefaultSize(comp.type);
                    const originalWidth = comp.width || defaultSize.width;
                    const originalHeight = comp.height || defaultSize.height;
                    
                    return (
                      <div key={comp.id} style={{
                        width: `min(${originalWidth}px, 90vw)`,
                      }}>
                        <RendererComponent
                          {...comp.props}
                          comp={{ ...comp, width: originalWidth, height: originalHeight }}
                          mode="live"
                          isEditor={false}
                        />
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              sortedComponents?.map((comp) => {
                const RendererComponent = getRendererByType(comp.type);
                if (!RendererComponent) return null;

                const defaultSize = getComponentDefaultSize(comp.type);
                const originalWidth = comp.width || defaultSize.width;
                const originalHeight = comp.height || defaultSize.height;

                return (
                  <div
                    key={comp.id}
                    className="component-container"
                    style={{
                      position: 'absolute',
                      left: comp.x || 0,
                      top: comp.y || 0,
                      width: `${originalWidth}px`,
                      height: `${originalHeight}px`,
                      zIndex: 2
                    }}
                  >
                    <RendererComponent
                      {...comp.props}
                      comp={{ ...comp, width: originalWidth, height: originalHeight }}
                      mode="live"
                      isEditor={false}
                    />
                  </div>
                );
              })
            )
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              textAlign: 'center',
              padding: '40px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '60px 40px',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎨</div>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '12px'
                }}>
                  빈 페이지입니다
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#718096',
                  lineHeight: '1.6'
                }}>
                  아직 컴포넌트가 추가되지 않았습니다.<br />
                  에디터에서 컴포넌트를 추가해보세요!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
  } | null;
  pageId: string;
}

const ErrorPage = ({ message, subdomain }: { message: string; subdomain?: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '60px 40px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '20px'
    }}>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p>{message}</p>
    </div>
  </div>
);

const RenderedPage = ({ pageData, pageId, subdomain }: PageProps & { subdomain?: string }) => {
  if (!pageData) {
    return <ErrorPage message="요청하신 페이지가 존재하지 않습니다." subdomain={subdomain} />;
  }

  return (
    <DynamicPageRenderer
      components={pageData.components}
      pageId={pageData.pageId || pageId}
      subdomain={subdomain}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params!;
  const { req } = context;

  try {
    const host = req.headers.host || '';
    console.log('🌐 Host header:', host);
    console.log('📄 PageId from params:', pageId);

    let subdomain = pageId as string;
    
    if (host.includes('.localhost')) {
      subdomain = host.split('.')[0];
    } else if (host.includes('.')) {
      const parts = host.split('.');
      if (parts.length > 2) {
        subdomain = parts[0];
      }
    }

    console.log('🎯 Extracted subdomain:', subdomain);

    // 테스트용 mock 데이터
    if (subdomain === 'test123' || subdomain === 'demo' || subdomain === 'test') {
      console.log('🧪 Using mock data for testing');
      const mockPageData = {
        pageId: subdomain,
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
              color: '#fff'
            }
          },
          {
            id: 'test-text-1',
            type: 'text',
            x: 250,
            y: 50,
            width: 200,
            height: 50,
            props: {
              text: '테스트 텍스트',
              fontSize: 16,
              color: '#333'
            }
          }
        ]
      };

      return {
        props: {
          pageData: mockPageData,
          pageId: subdomain,
          subdomain,
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

    console.log('🚀 API 요청 시작:', `${API_BASE_URL}/generator/subdomain/${subdomain}`);

    const res = await fetch(`${API_BASE_URL}/generator/subdomain/${subdomain}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000),
    });

    console.log('📡 API response status:', res.status);

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('❌ API 응답 에러:', {
        status: res.status,
        statusText: res.statusText,
        body: errorText
      });

      if (res.status === 404) {
        return {
          props: {
            pageData: null,
            pageId: subdomain,
            subdomain,
            error: 'PAGE_NOT_FOUND'
          },
        };
      }

      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'SERVER_ERROR'
        },
      };
    }

    const pageData = await res.json();
    console.log('✅ Page data received:', {
      pageId: pageData.pageId,
      componentsCount: pageData.components?.length || 0,
      hasComponents: !!pageData.components
    });

    if (!pageData || typeof pageData !== 'object') {
      console.error('❌ Invalid page data format:', pageData);
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'INVALID_DATA'
        },
      };
    }

    if (!Array.isArray(pageData.components)) {
      console.warn('⚠️ Components is not an array, initializing as empty array');
      pageData.components = [];
    }

    return {
      props: {
        pageData: {
          components: pageData.components,
          pageId: pageData.pageId || subdomain
        },
        pageId: subdomain,
        subdomain,
      },
    };
  } catch (error) {
    console.error('💥 Failed to fetch page data:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subdomain: pageId
    });

    return {
      props: {
        pageData: null,
        pageId: pageId as string,
        subdomain: pageId as string,
        error: 'NETWORK_ERROR'
      },
    };
  }
};

export default RenderedPage;