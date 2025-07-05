import { getRendererByType } from '@my-project/ui';
import React from 'react';
import { GetServerSideProps } from 'next';

// API 기본 URL 설정
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

const DynamicPageRenderer = ({ components, pageId }: { components: ComponentData[], pageId: string }) => {
  if (!components || components.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: 16,
        color: '#6c757d',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div>페이지를 찾을 수 없습니다</div>
        </div>
      </div>
    );
  }

  const calculateCanvasSize = () => {
    let maxX = 1920;
    let maxY = 1080;
    components.forEach(comp => {
      maxX = Math.max(maxX, comp.x + (comp.width || 200));
      maxY = Math.max(maxY, comp.y + (comp.height || 100) + 100);
    });
    return { width: maxX, height: maxY };
  };

  const canvasSize = calculateCanvasSize();

  return (
    <div style={{
      position: 'relative',
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
      background: '#ffffff',
      margin: '0 auto',
      minHeight: '100vh',
      overflow: 'visible'
    }}>
      {components.map(comp => {
        try {
          const RendererComponent = getRendererByType(comp.type);
          
          if (!RendererComponent) {
            return (
              <div
                key={comp.id}
                style={{
                  position: 'absolute',
                  left: comp.x,
                  top: comp.y,
                  padding: '8px 12px',
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: 4,
                  fontSize: 14,
                  color: '#6c757d'
                }}
              >
                {comp.props?.text || comp.type}
              </div>
            );
          }

          return (
            <div
              key={comp.id}
              style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                width: comp.width || 'auto',
                height: comp.height || 'auto'
              }}
            >
              <RendererComponent comp={{...comp, pageId}} isEditor={false} onUpdate={() => {}} />
            </div>
          );
        } catch (error) {
          console.error('Error rendering component:', comp.type, error);
          return (
            <div
              key={comp.id}
              style={{
                position: 'absolute',
                left: comp.x,
                top: comp.y,
                padding: '8px 12px',
                background: '#ffe6e6',
                border: '1px solid #ff9999',
                borderRadius: 4,
                fontSize: 14,
                color: '#cc0000'
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div>페이지를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return <DynamicPageRenderer components={pageData.components} pageId={pageData.pageId || pageId} />;
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
        notFound: true
      };
    }
    
    const pageData = await res.json();
    console.log('Page data received:', pageData);
    
    return {
      props: {
        pageData,
        pageId: subdomain
      }
    };
  } catch (error) {
    console.error('Failed to fetch page data:', error);
    return {
      notFound: true
    };
  }
};



export default RenderedPage;