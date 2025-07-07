import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../../config';

export function usePageNavigation(currentComponents = []) {
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 기본 페이지 생성
  const createDefaultPage = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/users/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: '새 페이지',
          subdomain: `page-${Date.now()}`
        })
      });
      
      if (response.ok) {
        const newPage = await response.json();
        console.log('기본 페이지 생성 완료:', newPage);
        // 페이지 목록 다시 조회
        setPages([newPage]);
        setCurrentPageId(newPage.id);
      } else {
        console.error('기본 페이지 생성 실패:', response.status);
      }
    } catch (err) {
      console.error('기본 페이지 생성 오류:', err);
    }
  }, []);

  // 현재 페이지의 Page 컴포넌트들에서 필요한 페이지 목록 생성
  const generatePageListFromComponents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 현재 페이지의 Page 컴포넌트들 찾기
      const pageComponents = currentComponents.filter(comp => comp.type === 'page');
      
      if (pageComponents.length === 0) {
        // Page 컴포넌트가 없으면 빈 배열로 설정
        setPages([]);
        return;
      }
      
      // Page 컴포넌트들의 pageId 수집 (targetPageId 대신 pageId 사용)
      const targetPageIds = pageComponents
        .map(comp => comp.props?.pageId || comp.props?.targetPageId)
        .filter(id => id); // null/undefined 제거
      
      if (targetPageIds.length === 0) {
        setPages([]);
        return;
      }
      
      // 중복 제거
      const uniquePageIds = [...new Set(targetPageIds)];
      
      // 각 페이지 ID에 대해 페이지 정보 조회
      const token = localStorage.getItem('token');
      const headers = { 
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const pagePromises = uniquePageIds.map(async (pageId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}`, {
            method: 'GET',
            headers
          });
          
          if (response.ok) {
            return await response.json();
          } else {
            console.warn(`페이지 ${pageId} 조회 실패:`, response.status);
            return null;
          }
        } catch (err) {
          console.error(`페이지 ${pageId} 조회 오류:`, err);
          return null;
        }
      });
      
      const pageResults = await Promise.all(pagePromises);
      const validPages = pageResults.filter(page => page !== null);
      
      setPages(validPages);
      
      // 첫 번째 페이지를 현재 페이지로 설정 (아직 설정되지 않은 경우)
      if (validPages.length > 0 && !currentPageId) {
        setCurrentPageId(validPages[0].id);
      }
      
    } catch (err) {
      console.error('페이지 목록 생성 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentComponents, currentPageId]);

  // 페이지 간 이동
  const navigateToPage = useCallback((pageId) => {
    setCurrentPageId(pageId);
    
    // URL 업데이트 (선택사항)
    const url = new URL(window.location);
    url.searchParams.set('page', pageId);
    window.history.pushState({}, '', url);
  }, []);

  // 페이지 배포 URL 업데이트
  const updatePageDeployUrl = useCallback((pageId, deployUrl) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? { ...page, deployUrl } 
          : page
      )
    );
  }, []);

  // 배포된 모든 페이지의 URL 업데이트
  const updateAllPageDeployUrls = useCallback((deployResults) => {
    if (!deployResults || !deployResults.deployedPages) return;
    
    deployResults.deployedPages.forEach(deployedPage => {
      updatePageDeployUrl(deployedPage.pageId, deployedPage.url);
    });
  }, [updatePageDeployUrl]);

  // 현재 페이지 정보 조회
  const getCurrentPage = useCallback(() => {
    return pages.find(page => page.id === currentPageId);
  }, [pages, currentPageId]);

  // 페이지 컴포넌트의 deployedUrl 업데이트
  const updatePageComponentUrl = useCallback((pageId, deployedUrl) => {
    // 이 함수는 CanvasArea에서 페이지 컴포넌트의 deployedUrl을 업데이트할 때 사용
    return { pageId, deployedUrl };
  }, []);

  // 초기 로드
  useEffect(() => {
    generatePageListFromComponents();
  }, [generatePageListFromComponents]);

  return {
    // 상태
    pages,
    currentPageId,
    loading,
    error,
    
    // 현재 페이지
    currentPage: getCurrentPage(),
    
    // 액션
    generatePageListFromComponents,
    navigateToPage,
    updatePageDeployUrl,
    updateAllPageDeployUrls,
    updatePageComponentUrl,
    createDefaultPage,
    
    // 유틸리티
    hasPages: pages.length > 0,
    pageCount: pages.length
  };
} 