import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import useAutoSave from './useAutoSave';

/**
 * 페이지 데이터 관리 훅
 * - 서버로부터 페이지 데이터 로딩
 * - components, designMode 상태 관리
 * - 자동 저장 기능
 * - 템플릿 시작 시 즉시 컴포넌트 렌더링
 */
export function usePageDataManager(roomId, initialViewport = 'desktop') {
  const [components, setComponents] = useState([]);
  const [designMode, setDesignMode] = useState(initialViewport); // 초기값을 파라미터로 설정
  const [pageTitle, setPageTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [isFromTemplate, setIsFromTemplate] = useState(false); // 템플릿으로부터 생성된 페이지인지 여부
  const [pageCreatorId, setPageCreatorId] = useState(null); // 페이지 생성자 ID 추가

  // 자동 저장 훅
  const autoSave = useAutoSave(roomId, components, canvasHeight);

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

  
      return payload;
    } catch (error) {
      console.error('JWT 디코딩 실패:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      if (!roomId) {
        setIsLoading(false);
        return;
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/users/pages/room/${roomId}/content`
        );

        if (response.ok) {
          const pageData = await response.json();


          // 페이지 생성자 정보 추출
          if (pageData.createdBy || pageData.userId || pageData.ownerId) {
            const creatorId = pageData.createdBy || pageData.userId || pageData.ownerId;
            setPageCreatorId(creatorId);
          } else {
            setPageCreatorId(null);
          }

          // 페이지의 editingMode를 우선적으로 사용하여 편집 기준 설정
          if (pageData.editingMode) {

            setDesignMode(pageData.editingMode);

            // 템플릿으로부터 생성된 페이지인지 판단
            // editingMode가 설정되어 있고, 컴포넌트가 있는 경우 템플릿으로부터 생성된 것으로 간주
            if (
              pageData.content &&
              ((pageData.content.components &&
                pageData.content.components.length > 0) ||
                (Array.isArray(pageData.content) &&
                  pageData.content.length > 0))
            ) {
              setIsFromTemplate(true);
            }
          }

          // content 구조 처리
          if (pageData.content && typeof pageData.content === 'object') {
            // 새로운 형식: { components: [], canvasSettings: {} }
            const loadedComponents = pageData.content.components || [];
            // 템플릿 컴포넌트를 즉시 렌더링
            if (loadedComponents.length > 0) {
              setComponents(loadedComponents);
            }

            // 캔버스 높이 복원 (있는 경우)
            if (pageData.content.canvasSettings?.canvasHeight) {
              setCanvasHeight(pageData.content.canvasSettings.canvasHeight);
            }
          } else if (Array.isArray(pageData.content)) {
            // 이전 형식: content가 직접 배열인 경우
            const loadedComponents = pageData.content || [];
            // 템플릿 컴포넌트를 즉시 렌더링
            if (loadedComponents.length > 0) {
              setComponents(loadedComponents);
            }
          }

          // 기타 페이지 정보 설정
          if (pageData.title) {
            setPageTitle(pageData.title);
          }
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

    // 즉시 로드 실행
    loadPageData();
  }, [roomId]);

  // designMode 변경 시 캔버스 높이 조정
  const prevDesignModeRef = useRef(designMode);
  useEffect(() => {
    // designMode가 실제로 변경된 경우에만 실행
    if (prevDesignModeRef.current !== designMode) {
      const newHeight = designMode === 'mobile' ? 667 : 1080;
      // 현재 캔버스 높이가 기본값(또는 이전 모드 기본값)과 동일한 경우에만 업데이트
      const defaultPrevHeight =
        prevDesignModeRef.current === 'mobile' ? 667 : 1080;
      if (canvasHeight === defaultPrevHeight) {
        setCanvasHeight(newHeight);
      }
      prevDesignModeRef.current = designMode;
    }
  }, [designMode, canvasHeight]);

  // 페이지 제목 업데이트 함수
  const updatePageTitle = useCallback(
    async (newTitle) => {
      if (!roomId || !newTitle.trim()) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('토큰이 없습니다.');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/pages/${roomId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newTitle.trim() }),
        });

        if (response.ok) {
          setPageTitle(newTitle.trim());
          console.log('페이지 제목 업데이트 성공:', newTitle);
        } else {
          console.error('페이지 제목 업데이트 실패:', response.status);
        }
      } catch (error) {
        console.error('페이지 제목 업데이트 오류:', error);
      }
    },
    [roomId]
  );

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
    isFromTemplate, // 템플릿으로부터 생성된 페이지인지 여부
    pageCreatorId, // 페이지 생성자 ID 추가

    // 유틸리티
    autoSave,
    decodeJWTPayload,
    updatePageTitle,
  };
}
