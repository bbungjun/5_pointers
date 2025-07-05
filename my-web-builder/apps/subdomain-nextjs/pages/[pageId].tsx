import { getRendererByType } from '@my-project/ui';
import React, { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';

// API 기본 URL 설정
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const DynamicPageRenderer = ({
  components,
  pageId,
}: {
  components: ComponentData[];
  pageId: string;
}) => {
  if (!components || components.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: 16,
          color: '#6c757d',
          background: '#f8f9fa',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지를 찾을 수 없습니다</div>
        </div>
      </div>
    );
  }

    // 뷰포트 감지 (모바일/데스크톱)
  const [viewport, setViewport] = useState('desktop');
  
  useEffect(() => {
    const checkViewport = () => {
      setViewport(window.innerWidth <= 768 ? 'mobile' : 'desktop');
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 반응형 스타일 계산 함수
  const getFinalStyles = (comp: ComponentData, currentViewport: string) => {
    const responsive = comp.responsive || {};
    const viewportData = responsive[currentViewport] || {};

    return {
      x: viewportData.x !== undefined ? viewportData.x : comp.x,
      y: viewportData.y !== undefined ? viewportData.y : comp.y,
      width: viewportData.width !== undefined ? viewportData.width : comp.width,
      height:
        viewportData.height !== undefined ? viewportData.height : comp.height,
      props: { ...comp.props, ...(viewportData.props || {}) },
    };
  };

  const calculateCanvasSize = () => {
    let maxX = viewport === 'mobile' ? 375 : 1920;
    let maxY = viewport === 'mobile' ? 667 : 1080;

    components.forEach((comp) => {
      const finalStyles = getFinalStyles(comp, viewport);
      maxX = Math.max(maxX, finalStyles.x + (finalStyles.width || 200));
      maxY = Math.max(maxY, finalStyles.y + (finalStyles.height || 100) + 100);
    });
    return { width: maxX, height: maxY };
  };

  const canvasSize = calculateCanvasSize();

  return (
    <div
      style={{
        position: 'relative',
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
        background: '#ffffff',
        margin: '0 auto',
        minHeight: '100vh',
        overflow: 'visible',
      }}
    >
             {components.map((comp) => {
         try {
           const finalStyles = getFinalStyles(comp, viewport);
           const RendererComponent = getRendererByType(comp.type);
           
           if (!RendererComponent) {
             return (
               <div
                 key={comp.id}
                 style={{
                   position: 'absolute',
                   left: finalStyles.x,
                   top: finalStyles.y,
                   padding: '8px 12px',
                   background: '#f8f9fa',
                   border: '1px solid #e9ecef',
                   borderRadius: 4,
                   fontSize: 14,
                   color: '#6c757d',
                 }}
               >
                 {finalStyles.props?.text || comp.type}
               </div>
             );
           }

           // 반응형 스타일이 적용된 컴포넌트 객체 생성
           const componentWithFinalStyles = {
             ...comp,
             x: finalStyles.x,
             y: finalStyles.y,
             width: finalStyles.width,
             height: finalStyles.height,
             props: finalStyles.props,
             pageId
           };

           return (
             <div
               key={comp.id}
               style={{
                 position: 'absolute',
                 left: finalStyles.x,
                 top: finalStyles.y,
                 width: finalStyles.width || 'auto',
                 height: finalStyles.height || 'auto',
               }}
             >
               <RendererComponent
                 comp={componentWithFinalStyles}
                 isEditor={false}
                 onUpdate={() => {}}
                 onPropsChange={() => {}}
                 viewport={viewport}
               />
             </div>
           );
         } catch (error) {
           console.error('Error rendering component:', comp.type, error);
           const finalStyles = getFinalStyles(comp, viewport);
           return (
             <div
               key={comp.id}
               style={{
                 position: 'absolute',
                 left: finalStyles.x,
                 top: finalStyles.y,
                 padding: '8px 12px',
                 background: '#ffe6e6',
                 border: '1px solid #ff9999',
                 borderRadius: 4,
                 fontSize: 14,
                 color: '#cc0000',
               }}
             >
               Error: {comp.type}
             </div>
           );
         }
       })}
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
  responsive?: {
    mobile?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      props?: any;
    };
    desktop?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      props?: any;
    };
  };
}

interface PageProps {
  pageData: {
    components: ComponentData[];
    pageId?: string;
  } | null;
  pageId: string;
}

const RenderedPage = ({ pageData, pageId }: PageProps) => {
  if (!pageData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div>페이지를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <DynamicPageRenderer
      components={pageData.components}
      pageId={pageData.pageId || pageId}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { pageId } = context.params!;
  const { req } = context;

  try {
    // 호스트 헤더에서 서브도메인 추출
    const host = req.headers.host || '';
    console.log('Host header:', host);

    // subdomain 추출 (예: mysite.localhost:3001 -> mysite)
    let subdomain = pageId as string;
    if (host.includes('.localhost')) {
      subdomain = host.split('.')[0];
    }

    console.log('Extracted subdomain:', subdomain);

    // 서버에서 백엔드 API 호출 (subdomain으로 조회)
    const res = await fetch(`${API_BASE_URL}/generator/subdomain/${subdomain}`);

    console.log('API response status:', res.status);

    if (!res.ok) {
      console.log('API response not ok, returning 404');
      return {
        notFound: true,
      };
    }

    const pageData = await res.json();
    console.log('Page data received:', pageData);

    return {
      props: {
        pageData,
        pageId: subdomain,
      },
    };
  } catch (error) {
    console.error('Failed to fetch page data:', error);
    return {
      notFound: true,
    };
  }
};

export default RenderedPage;
