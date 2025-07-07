import { useCallback } from 'react';

export function usePageComponentSync() {
  // 배포 결과를 받아서 페이지 컴포넌트들의 deployedUrl 업데이트
  const syncPageComponentUrls = useCallback((components, deployResults) => {
    if (!deployResults || !deployResults.deployedPages) {
      return components;
    }

    // 배포된 페이지들의 URL 매핑 생성
    const pageUrlMap = {};
    deployResults.deployedPages.forEach(deployedPage => {
      pageUrlMap[deployedPage.pageId] = deployedPage.url;
    });

    // 컴포넌트들 중 page 타입인 것들의 deployedUrl 업데이트
    const updatedComponents = components.map(component => {
      if (component.type === 'page') {
        const targetPageId = component.props.targetPageId || component.props.pageId;
        if (targetPageId && pageUrlMap[targetPageId]) {
          return {
            ...component,
            props: {
              ...component.props,
              deployedUrl: pageUrlMap[targetPageId]
            }
          };
        }
      }
      return component;
    });

    return updatedComponents;
  }, []);

  // 특정 페이지의 URL 업데이트
  const updatePageComponentUrl = useCallback((components, pageId, deployedUrl) => {
    return components.map(component => {
      if (component.type === 'page') {
        const targetPageId = component.props.targetPageId || component.props.pageId;
        if (targetPageId === pageId) {
          return {
            ...component,
            props: {
              ...component.props,
              deployedUrl
            }
          };
        }
      }
      return component;
    });
  }, []);

  // 페이지 컴포넌트 생성 시 기본값 설정
  const createPageComponent = useCallback((pageId, pageName, deployedUrl = '') => {
    return {
      id: `page-${Date.now()}`,
      type: 'page',
      x: 100,
      y: 100,
      width: 300,
      height: 150,
      props: {
        pageName: pageName || '새 페이지',
        targetPageId: pageId,
        deployedUrl,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        borderStyle: 'solid',
        borderWidth: '2px',
        borderColor: '#007bff',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500'
      }
    };
  }, []);

  // 페이지 컴포넌트 유효성 검사
  const validatePageComponent = useCallback((component) => {
    if (component.type !== 'page') return { isValid: false, error: '페이지 컴포넌트가 아닙니다.' };
    
    const { pageName, targetPageId } = component.props;
    
    if (!pageName || pageName.trim() === '') {
      return { isValid: false, error: '페이지 이름이 필요합니다.' };
    }
    
    if (!targetPageId) {
      return { isValid: false, error: '대상 페이지 ID가 필요합니다.' };
    }
    
    return { isValid: true };
  }, []);

  // 페이지 컴포넌트들의 상태 요약
  const getPageComponentsSummary = useCallback((components) => {
    const pageComponents = components.filter(comp => comp.type === 'page');
    
    return {
      total: pageComponents.length,
      withUrl: pageComponents.filter(comp => comp.props.deployedUrl).length,
      withoutUrl: pageComponents.filter(comp => !comp.props.deployedUrl).length,
      components: pageComponents.map(comp => ({
        id: comp.id,
        pageName: comp.props.pageName,
        targetPageId: comp.props.targetPageId,
        deployedUrl: comp.props.deployedUrl,
        hasUrl: !!comp.props.deployedUrl
      }))
    };
  }, []);

  return {
    syncPageComponentUrls,
    updatePageComponentUrl,
    createPageComponent,
    validatePageComponent,
    getPageComponentsSummary
  };
} 