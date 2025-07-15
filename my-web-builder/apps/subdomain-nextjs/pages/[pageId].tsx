import React, { useState, useEffect, useRef } from 'react';
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
    'linkCopy': LinkCopyRenderer,
  };

  console.log(`🎯 Getting renderer for type: ${type}`, renderers[type] ? 'Found' : 'Not found');
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
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null); // 컨테이너 참조 추가

  useEffect(() => {
    setIsMounted(true);
    
    const checkViewport = () => {
      const isMobile = window.innerWidth <= 768;
      setIsMobileView(isMobile);
      
      // 모바일 화면 + 모바일 편집 페이지인 경우에만 스케일링 적용
      if (isMobile && editingMode === 'mobile') {
        // 실제 컨테이너 너비 측정
        const actualWidth = containerRef.current 
          ? containerRef.current.offsetWidth 
          : window.innerWidth;
        
        const baseWidth = 375;
        const newScaleFactor = actualWidth / baseWidth;
        setScaleFactor(newScaleFactor);
      } else {
        setScaleFactor(1);
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, [editingMode]);

  if (!isMounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            페이지를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 모바일에서 행 기반 레이아웃 사용
  const groupComponentsIntoRows = (components: ComponentData[]) => {
    if (!components || components.length === 0) return [];

    const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
    const rows: ComponentData[][] = [];
    
    for (const component of sortedComponents) {
      const compTop = component.y || 0;
      const compBottom = compTop + (component.height || getComponentDefaultSize(component.type).height);
      
      let targetRow = null;
      
      for (const row of rows) {
        const hasOverlap = row.some(existingComp => {
          const existingTop = existingComp.y || 0;
          const existingBottom = existingTop + (existingComp.height || getComponentDefaultSize(existingComp.type).height);
          return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
        });
        
        if (hasOverlap) {
          targetRow = row;
          break;
        }
      }
      
      if (targetRow) {
        targetRow.push(component);
      } else {
        rows.push([component]);
      }
    }
    
    return rows.map(row => 
      [...row].sort((a, b) => (a.x || 0) - (b.x || 0))
    );
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/ddukddak-logo2.png" />
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
          maxWidth: '100vw',
          minHeight: '100vh',
          background: '#ffffff',
          overflowX: 'hidden', // 가로 스크롤만 방지
          overflowY: 'auto', // 세로 스크롤 허용
          padding: isMobileView ? '0' : 'unset'
        }}
      >
        <div 
          ref={containerRef}
          style={{
            position: 'relative',
            zIndex: 1,
            minHeight: isMobileView ? '100vh' : 'auto', // 데스크톱에서는 자동 높이
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            overflow: 'visible', // 스크롤 허용
            padding: '0', // 패딩 완전 제거
          }}>
          {components && components.length > 0 ? (
            isMobileView ? (
              // 모바일 화면에서의 조건부 렌더링
              editingMode === 'mobile' ? (
                // 모바일 편집 페이지: CSS Transform 스케일링
                (() => {
                  // 컨테이너 높이 계산 (가장 아래 컴포넌트 기준)
                  const maxY = Math.max(...components.map(comp => {
                    const defaultSize = getComponentDefaultSize(comp.type);
                    return (comp.y || 0) + (comp.height || defaultSize.height);
                  }));
                  const containerHeight = Math.max(maxY + 50, 600); // 최소 높이 600px
                  
                  return (
                    <div style={{
                      width: '100%', // 화면에 꽉 참
                      height: `${containerHeight}px`,
                      position: 'relative',
                    }}>
                      {components.map((comp) => {
                        const RendererComponent = getRendererByType(comp.type);
                        if (!RendererComponent) {
                          console.warn('❌ No renderer found for type:', comp.type);
                          return null;
                        }
                        
                        // 화면 너비에 맞춰 컴포넌트 크기 및 위치 조정
                        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
                        const baseWidth = 375;
                        const scaleFactor = screenWidth / baseWidth;
                        
                        // 화면에 꽉 차도록 컴포넌트 크기 조정
                        const originalWidth = screenWidth;
                        const originalHeight = comp.height || defaultSize.height;
                        
                        return (
                          <div key={comp.id} className="component-wrapper" style={{
                            position: 'absolute',
                            left: '0', // 왼쪽 끝에 배치
                            top: `${(comp.y || 0) * scaleFactor}px`, // Y 좌표도 스케일링 적용
                            width: `${originalWidth}px`, // 화면 너비와 동일
                            height: `${originalHeight}px`,
                          }}>
                            {(() => {
                              try {
                                return (
                                  <RendererComponent
                                    {...comp.props}
                                    comp={{ ...comp, width: originalWidth, height: originalHeight }}
                                    mode="live"
                                    isEditor={false}
                                    pageId={pageId}
                                  />
                                );
                              } catch (error) {
                                console.error('❌ Error rendering mobile component:', comp.type, comp.id, error);
                                return (
                                  <div style={{ 
                                    padding: '10px', 
                                    border: '2px dashed #ff6b6b', 
                                    color: '#ff6b6b',
                                    textAlign: 'center',
                                    fontSize: '12px'
                                  }}>
                                    Error: {comp.type}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : (
                // 데스크톱 편집 페이지: 기존 행 그룹화 방식
                rows?.map((row, rowIndex) => (
                  <div key={rowIndex} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}>
                    {row.map((comp) => {
                      console.log('🔍 Rendering desktop-edited component:', comp.type, comp.id);
                      const RendererComponent = getRendererByType(comp.type);
                      if (!RendererComponent) {
                        console.warn('❌ No renderer found for type:', comp.type);
                        return null;
                      }
                      
                      const defaultSize = getComponentDefaultSize(comp.type);
                      const originalWidth = comp.width || defaultSize.width;
                      const originalHeight = comp.height || defaultSize.height;
                      
                      return (
                        <div key={comp.id} className="component-wrapper" style={{
                          width: `min(${originalWidth}px, 90vw)`,
                          height: `${originalHeight}px`,
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: 'center'
                        }}>
                          {(() => {
                            try {
                              return (
                                <RendererComponent
                                  {...comp.props}
                                  comp={{ ...comp, width: originalWidth, height: originalHeight }}
                                  mode="live"
                                  isEditor={false}
                                  pageId={pageId}
                                />
                              );
                            } catch (error) {
                              console.error('❌ Error rendering component:', comp.type, comp.id, error);
                              return (
                                <div style={{ 
                                  padding: '20px', 
                                  border: '2px dashed #ff6b6b', 
                                  color: '#ff6b6b',
                                  textAlign: 'center'
                                }}>
                                  Error rendering {comp.type}
                                </div>
                              );
                            }
                          })()}
                        </div>
                      );
                    })}
                  </div>
                ))
              )
            ) : (
              sortedComponents?.map((comp) => {
                console.log('🔍 Desktop rendering component:', comp.type, comp.id);
                const RendererComponent = getRendererByType(comp.type);
                if (!RendererComponent) {
                  console.warn('❌ Desktop: No renderer found for type:', comp.type);
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
                      pageId={pageId}
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
    editingMode?: 'desktop' | 'mobile';
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
      editingMode={pageData.editingMode}
    />
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
    if (subdomain === 'test123' || subdomain === 'demo' || subdomain === 'test') {
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
              color: '#fff'
            }
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
              color: '#333'
            }
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
              alt: '테스트 이미지'
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
              color: '#fff'
            }
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

    const res = await fetch(`${API_BASE_URL}/generator/subdomain/${subdomain}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return {
        props: {
          pageData: null,
          pageId: subdomain,
          subdomain,
          error: 'PAGE_NOT_FOUND'
        },
      };
    }

    const pageData = await res.json();

    if (!Array.isArray(pageData.components)) {
      pageData.components = [];
    }

    // 컴포넌트 크기 데이터 확인
    console.log('🔧 API에서 받은 컴포넌트 데이터:', pageData.components.map(comp => ({
      id: comp.id,
      type: comp.type,
      width: comp.width,
      height: comp.height,
      x: comp.x,
      y: comp.y
    })));

    return {
      props: {
        pageData: {
          components: pageData.components,
          pageId: pageData.pageId || subdomain,
          editingMode: pageData.editingMode || 'desktop' // editingMode 추가
        },
        pageId: subdomain,
        subdomain,
      },
    };
  } catch (error) {
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