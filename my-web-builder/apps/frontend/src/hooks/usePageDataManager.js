import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import useAutoSave from './useAutoSave';

/**
 * 페이지 데이터 관리 훅
 * - 서버로부터 페이지 데이터 로딩
 * - components, designMode 상태 관리
 * - 자동 저장 기능
 */
export function usePageDataManager(roomId) {
  const [components, setComponents] = useState([]);
  const [designMode, setDesignMode] = useState('desktop');
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canvasHeight, setCanvasHeight] = useState(1080);

  // 자동 저장 훅
  const autoSave = useAutoSave(roomId, components);

  // JWT Base64URL 디코딩 함수 (한글 지원)
  const decodeJWTPayload = (token) => {
    try {
      // Base64URL을 Base64로 변환
      let base64 = token.split('.')[1];
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }

      // UTF-8로 안전하게 디코딩
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const utf8String = new TextDecoder('utf-8').decode(bytes);
      const payload = JSON.parse(utf8String);

      console.log('JWT 디코딩 성공:', payload);
      return payload;
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  };

  // 서버로부터 페이지 데이터 로딩
  useEffect(() => {
    if (!roomId) return;

    const loadPageData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('로그인 토큰이 없습니다.');
          setIsLoading(false);
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        };

        console.log(`🔄 페이지 데이터 로딩 시작: ${roomId}`);
        const response = await fetch(`${API_BASE_URL}/users/pages/${roomId}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const pageData = await response.json();
          console.log('📄 페이지 데이터 로딩 성공:', pageData);

          // 데이터 구조 단순화 (새로운 시스템에 맞게)
          const simpleComponents = (pageData.content || []).map((comp) => ({
            id: comp.id,
            type: comp.type,
            x: comp.x || 0,
            y: comp.y || 0,
            width: comp.width,
            height: comp.height,
            props: comp.props || {},
          }));

          setComponents(simpleComponents);
          setDesignMode(pageData.designMode || 'desktop');
          setPageTitle(pageData.title || 'Untitled Page');

          // 초기 캔버스 높이 설정
          const initialHeight = pageData.designMode === 'mobile' ? 667 : 1080;
          setCanvasHeight(initialHeight);

          console.log('✅ 페이지 데이터 설정 완료:', {
            componentsCount: simpleComponents.length,
            designMode: pageData.designMode || 'desktop',
            title: pageData.title,
          });
        } else {
          console.error(
            '페이지 데이터 로딩 실패:',
            response.status,
            response.statusText
          );
          // 빈 페이지로 초기화
          setComponents([]);
          setDesignMode('desktop');
          setPageTitle('새 페이지');
        }
      } catch (error) {
        console.error('페이지 데이터 로딩 오류:', error);
        // 빈 페이지로 초기화
        setComponents([]);
        setDesignMode('desktop');
        setPageTitle('새 페이지');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
  }, [roomId]);

  // designMode 변경 시 캔버스 높이 조정
  useEffect(() => {
    const newHeight = designMode === 'mobile' ? 667 : 1080;
    setCanvasHeight(newHeight);
  }, [designMode]);

  return {
    // 상태
    components,
    setComponents, // 협업 훅이 Y.js 데이터를 React 상태에 반영할 수 있도록 setter 전달
    designMode,
    setDesignMode,
    pageTitle,
    setPageTitle,
    canvasHeight,
    setCanvasHeight,
    isLoading,

    // 유틸리티
    autoSave,
    decodeJWTPayload,
  };
}
