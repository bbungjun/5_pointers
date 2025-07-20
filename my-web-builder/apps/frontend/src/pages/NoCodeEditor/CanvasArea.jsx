// frontend/src/pages/NoCodeEditor/CanvasArea.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useCallback,
} from 'react';
import {
  LiveCursors,
  CollaborativeSelections,
} from '../../components/collaboration/LiveCursors';

// 그리드 크기 상수 import 또는 선언
const GRID_SIZE = 50;

// 섹션 추가 버튼 컴포넌트
function AddSectionButton({ canvasHeight, viewport, onAddSection }) {
  // Toast Context를 안전하게 사용
  let showSuccess = null;
  try {
    const { useToastContext } = require('../../contexts/ToastContext');
    const toastContext = useToastContext();
    showSuccess = toastContext?.showSuccess;
  } catch (error) {
    // ToastProvider가 없는 경우 기본 alert 사용
    showSuccess = (message) => alert(message);
  }

  // 현재 캔버스의 높이 사용 (더미 컴포넌트 필요 없음)
  const currentMaxY = canvasHeight;

  // 캔버스 너비 계산
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: currentMaxY + 50,
        width: canvasWidth,
        zIndex: 10,
        padding: '0 20px', // 좌우 여백
        boxSizing: 'border-box',
      }}
    >
      <button
        onClick={() => {
          if (onAddSection) {
            // 새 섹션의 시작 위치 (현재 최대 Y + 여백)
            const newSectionY = currentMaxY + 100;

            // 부모 컴포넌트에 새 섹션 추가 요청
            onAddSection(newSectionY);
          } else {
            // onAddSection이 없는 경우 기본 동작
            showSuccess(
              '캔버스가 확장되었습니다! 새로운 영역에 컴포넌트를 추가해보세요.'
            );
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px',
          backgroundColor: 'white',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#6b7280',
          transition: 'all 0.2s ease',
          width: '100%', // 캔버스 너비에 맞게 확장
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#3B4EFF';
          e.target.style.color = '#3B4EFF';
          e.target.style.backgroundColor = '#f8faff';
          e.target.style.boxShadow = '0 4px 12px rgba(59, 78, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.color = '#6b7280';
          e.target.style.backgroundColor = 'white';
          e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
        title="새로운 섹션을 추가하여 캔버스를 확장합니다"
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>+</span>
        <span>섹션 추가</span>
      </button>
    </div>
  );
}

const CanvasArea = forwardRef(
  (
    {
      canvasRef: externalCanvasRef,
      components,
      selectedId,
      selectedIds, // 다중 선택된 컴포넌트 ID 배열
      users,
      nickname,
      snapLines,
      setSnapLines,
      onDrop,
      onDragOver,
      onClick,
      onMouseMove,
      onMouseUp,
      onSelect,
      onMultiSelect, // 다중 선택 핸들러
      onUpdate,
      onDelete,
      onAddSection,
      CanvasComponent,
      UserCursor,
      zoom = 100,
      onZoomChange,
      viewport = 'desktop',
      canvasHeight,
      isInspectorOpen = false,
      isLibraryOpen = true,
      updateCursorPosition,
      otherCursors = [],
      otherSelections = [],
      getComponentDimensions,
      onPageChange,
      containerRef, // NoCodeEditor로부터 받음
      pageId, // 페이지 ID prop 추가
      collaboration, // 협업 객체 추가
      openChatInput, // 채팅 입력 열기 함수
      cursorChatMessages = {}, // 커서 채팅 메시지 추가
      syncComponentAfterDrag, // 드래그 종료 후 동기화 함수 추가
    },
    ref
  ) => {
    // 협업 객체에서 드래그 상태 관리 함수들 추출
    const {
      setComponentDragging,
      isComponentDragging: checkComponentDragging,
    } = collaboration || {};

    // 내부 canvasRef 생성 (외부에서 전달된 ref가 없는 경우를 대비)
    const internalCanvasRef = useRef(null);
    const canvasRefToUse = externalCanvasRef || internalCanvasRef;

    const [localZoom, setLocalZoom] = useState(zoom);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [showGrid, setShowGrid] = useState(true);

    // 패닝(캔버스 드래그 이동) 관련 상태
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({
      x: 0,
      y: 0,
      scrollLeft: 0,
      scrollTop: 0,
    });

    // 로컬 컴포넌트 드래그 상태 감지 (이름 변경으로 충돌 방지)
    const [isLocalComponentDragging, setIsLocalComponentDragging] =
      useState(false);

    // 다중 선택 관련 상태
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);
    const [selectionStart, setSelectionStart] = useState(null);

    const LIBRARY_WIDTH = 240; // 좌측 패널(컴포넌트 라이브러리) width와 동일하게!

    // 줌 핸들러
    const handleZoom = useCallback(
      (delta) => {
        const newZoom = Math.max(60, Math.min(150, localZoom + delta));
        setLocalZoom(newZoom);
        if (onZoomChange) onZoomChange(newZoom);
      },
      [localZoom, onZoomChange]
    );

    // 마우스 휠로 줌 또는 스크롤
    const handleWheel = useCallback(
      (e) => {
        if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd + 휠: 줌
          e.preventDefault();
          const delta = e.deltaY > 0 ? -10 : 10;
          handleZoom(delta);
        } else if (isLocalComponentDragging) {
          // 컴포넌트 드래그 중일 때는 스크롤 차단
          e.preventDefault();
        }
      },
      [isLocalComponentDragging, handleZoom]
    );

    useEffect(() => {
      const element = canvasRefToUse?.current;
      if (element) {
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
          element.removeEventListener('wheel', handleWheel);
        };
      }
    }, [canvasRefToUse, handleWheel]);

    // 협업 커서 위치 업데이트 핸들러
    const handleCanvasMouseMove = (e) => {
      if (updateCursorPosition) {
        updateCursorPosition(e.clientX, e.clientY, localZoom, viewport);
      }

      // 다중 선택 업데이트
      if (isSelecting) {
        handleSelectionMove(e);
      }

      onMouseMove(e);
    };

    // 마우스가 캔버스를 벗어날 때 커서 숨기기
    const handleCanvasMouseLeave = () => {
      if (updateCursorPosition) {
        // 커서 위치를 null로 설정하여 숨김
        updateCursorPosition(null, null, localZoom, viewport);
      }
    };

    // 패닝 시작
    const handleMouseDown = (e) => {
      if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
        // 중간 버튼 또는 스페이스바 + 좌클릭
        e.preventDefault();
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    // 다중 선택 시작
    const handleSelectionStart = (e) => {
      // 컴포넌트 위에서 클릭한 경우 다중 선택 시작하지 않음
      const isClickOnComponent =
        e.target.closest('[data-component-id]') !== null ||
        e.target.closest('.canvas-component') !== null;

      // console.log('선택 시작 시도:', {
      //   button: e.button,
      //   ctrlKey: e.ctrlKey,
      //   metaKey: e.metaKey,
      //   isClickOnComponent,
      //   target: e.target.className,
      //   targetTagName: e.target.tagName
      // });

      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !isClickOnComponent) {
        // 빈 공간 클릭 시 선택 해제
        if (onSelect) {
          onSelect(null);
        }

        const rect = canvasRefToUse.current.getBoundingClientRect();
        const scale = localZoom / 100;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        // console.log('선택 영역 시작:', { x, y, scale, rect });
        setSelectionStart({ x, y });
        setIsSelecting(true);
        setSelectionBox({ x, y, width: 0, height: 0 });
      } else {
        console.log('선택 시작 조건 불만족:', {
          button: e.button,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          isClickOnComponent,
        });
      }
    };

    // 다중 선택 업데이트
    const handleSelectionMove = (e) => {
      if (isSelecting && selectionStart) {
        const rect = canvasRefToUse.current.getBoundingClientRect();
        const scale = localZoom / 100;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        const width = x - selectionStart.x;
        const height = y - selectionStart.y;

        const newSelectionBox = {
          x: width < 0 ? x : selectionStart.x,
          y: height < 0 ? y : selectionStart.y,
          width: Math.abs(width),
          height: Math.abs(height),
        };

        // console.log('선택 영역 업데이트:', newSelectionBox);
        setSelectionBox(newSelectionBox);
      }
    };

    // 다중 선택 완료
    const handleSelectionEnd = () => {
      // console.log('선택 완료 시도:', { isSelecting, selectionBox: !!selectionBox, onMultiSelect: !!onMultiSelect });

      if (isSelecting && selectionBox && onMultiSelect) {
        // 최소 선택 영역 크기 (너무 작은 선택은 무시)
        const minSize = 5;
        if (selectionBox.width < minSize || selectionBox.height < minSize) {
          // console.log('선택 영역이 너무 작음:', selectionBox);
          setIsSelecting(false);
          setSelectionBox(null);
          setSelectionStart(null);
          return;
        }

        // 선택 영역 내의 컴포넌트들 찾기 (캔버스 경계 무시)
        const selectedComponents = components.filter((comp) => {
          const compWidth = comp.width || 120;
          const compHeight = comp.height || 40;
          const compRight = comp.x + compWidth;
          const compBottom = comp.y + compHeight;
          const boxRight = selectionBox.x + selectionBox.width;
          const boxBottom = selectionBox.y + selectionBox.height;

          // 컴포넌트가 선택 영역과 겹치는지 확인 (경계 제한 없음)
          const isSelected =
            comp.x < boxRight &&
            compRight > selectionBox.x &&
            comp.y < boxBottom &&
            compBottom > selectionBox.y;

          return isSelected;
        });

        if (selectedComponents.length > 0) {
          onMultiSelect(selectedComponents.map((comp) => comp.id));
        }
      }

      setIsSelecting(false);
      setSelectionBox(null);
      setSelectionStart(null);
    };

    // 드롭 시 snapLines 항상 초기화
    const handleDrop = (e) => {
      if (onDrop) onDrop(e);
      if (setSnapLines) {
        setSnapLines({ vertical: [], horizontal: [] });
      }
    };

    // 마우스업
    const handleMouseUp = (e) => {
      setIsDragging(false);

      // 다중 선택 완료
      if (isSelecting) {
        // console.log('캔버스에서 선택 완료');
        handleSelectionEnd();
      }

      // 드래그 종료 시 동기화 호출
      if (isLocalComponentDragging && syncComponentAfterDrag) {
        // 현재 선택된 컴포넌트가 있다면 해당 컴포넌트 동기화
        if (selectedId) {
          console.log('🔄 드래그 종료, 컴포넌트 동기화 호출:', selectedId);
          syncComponentAfterDrag(selectedId);
        }
        // 다중 선택된 컴포넌트들도 동기화
        if (selectedIds && selectedIds.length > 0) {
          selectedIds.forEach(id => {
            console.log('🔄 드래그 종료, 다중 선택 컴포넌트 동기화 호출:', id);
            syncComponentAfterDrag(id);
          });
        }
      }

      if (onMouseUp) onMouseUp(e);
      if (setSnapLines) {
        setSnapLines({ vertical: [], horizontal: [] });
      }
    };

    // 캔버스 컨테이너에서 마우스 드래그로 스크롤 이동 (중간 버튼 또는 스페이스바와 함께)
    const handleContainerMouseDown = (e) => {
      if (!ref || !ref.current) return;
      // 컴포넌트 드래그 중이면 패닝하지 않음
      if (isLocalComponentDragging) {
        return;
      }

      // 캔버스 밖 영역 클릭 시 선택 해제
      if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
        const canvasElement = canvasRefToUse.current;
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();
          const clickX = e.clientX;
          const clickY = e.clientY;

          // 클릭 위치가 캔버스 영역 밖인지 확인
          if (
            clickX < canvasRect.left ||
            clickX > canvasRect.right ||
            clickY < canvasRect.top ||
            clickY > canvasRect.bottom
          ) {
            // 캔버스 밖 클릭 시 선택 해제
            if (onSelect) {
              onSelect(null);
            }
            return;
          }
        }
      }

      // 중간 버튼이나 스페이스바와 함께 클릭한 경우에만 패닝
      if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
        console.log('패닝 시작');
        setIsPanning(true);
        setPanStart({
          x: e.clientX,
          y: e.clientY,
          scrollLeft: ref.current.scrollLeft,
          scrollTop: ref.current.scrollTop,
        });
      }
    };

    const handleContainerMouseMove = (e) => {
      if (isPanning && !isLocalComponentDragging) {
        if (!ref || !ref.current) return;
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        ref.current.scrollLeft = panStart.scrollLeft - dx;
        ref.current.scrollTop = panStart.scrollTop - dy;
      } else if (isLocalComponentDragging) {
        // 컴포넌트 드래그 중이면 패닝 중지
        setIsPanning(false);
      }
    };

    const handleContainerMouseUp = () => setIsPanning(false);

    useEffect(() => {
      if (isPanning) {
        window.addEventListener('mousemove', handleContainerMouseMove);
        window.addEventListener('mouseup', handleContainerMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleContainerMouseMove);
          window.removeEventListener('mouseup', handleContainerMouseUp);
        };
      }
    }, [isPanning, panStart, isLocalComponentDragging]);

    // 컴포넌트 드래그 상태 감지 - 더 강력한 방법
    useEffect(() => {
      const handleMouseDown = (e) => {
        const componentElement =
          e.target.closest('[data-component-id]') ||
          e.target.closest('.canvas-component');
        if (componentElement) {
          setIsLocalComponentDragging(true);

          // 컨테이너의 모든 스크롤 관련 속성 차단
          if (ref && ref.current) {
            const container = ref.current;
            // 현재 스크롤 위치 저장
            const currentScrollLeft = container.scrollLeft;
            const currentScrollTop = container.scrollTop;

            // 스크롤 차단
            container.style.overflow = 'hidden';
            container.style.pointerEvents = 'none';

            // 스크롤 위치 고정
            const preventScroll = () => {
              container.scrollLeft = currentScrollLeft;
              container.scrollTop = currentScrollTop;
            };

            // 스크롤 이벤트 리스너 추가
            container.addEventListener('scroll', preventScroll);

            // cleanup 함수를 위해 저장
            componentElement._preventScroll = preventScroll;
            componentElement._currentScrollLeft = currentScrollLeft;
            componentElement._currentScrollTop = currentScrollTop;
          }
        }
      };

      const handleMouseUp = () => {
        setIsLocalComponentDragging(false);

        // 컨테이너의 스크롤을 다시 활성화
        if (ref && ref.current) {
          const container = ref.current;
          container.style.overflow = 'auto';
          container.style.pointerEvents = 'auto';

          // 모든 컴포넌트에서 스크롤 이벤트 리스너 제거
          const allComponents = document.querySelectorAll(
            '[data-component-id]'
          );
          allComponents.forEach((comp) => {
            if (comp._preventScroll) {
              container.removeEventListener('scroll', comp._preventScroll);
              delete comp._preventScroll;
              delete comp._currentScrollLeft;
              delete comp._currentScrollTop;
            }
          });
        }
      };

      // 전역 이벤트로 더 확실하게 감지
      window.addEventListener('mousedown', handleMouseDown, { capture: true });
      window.addEventListener('mouseup', handleMouseUp, { capture: true });

      return () => {
        window.removeEventListener('mousedown', handleMouseDown, {
          capture: true,
        });
        window.removeEventListener('mouseup', handleMouseUp, { capture: true });
      };
    }, []);

    // 다중 선택 전역 마우스 이벤트 리스너 (제거 - 캔버스 내에서만 처리)
    // useEffect(() => {
    //   if (isSelecting) {
    //     console.log('전역 마우스 이벤트 리스너 등록');

    //     const handleGlobalMouseMove = (e) => {
    //       console.log('전역 마우스 이동:', e.clientX, e.clientY);
    //       handleSelectionMove(e);
    //     };

    //     const handleGlobalMouseUp = (e) => {
    //       console.log('전역 마우스 업 - 선택 완료');
    //       // 약간의 지연을 두어 캔버스의 onMouseUp이 먼저 처리되도록 함
    //       setTimeout(() => {
    //         handleSelectionEnd();
    //       }, 10);
    //     };

    //     window.addEventListener('mousemove', handleGlobalMouseMove);
    //     window.addEventListener('mouseup', handleGlobalMouseUp);

    //     return () => {
    //       console.log('전역 마우스 이벤트 리스너 제거');
    //       window.removeEventListener('mousemove', handleGlobalMouseMove);
    //       window.removeEventListener('mouseup', handleGlobalMouseUp);
    //     };
    //   }
    // }, [isSelecting, selectionStart]);

    // 키보드 이벤트
    useEffect(() => {
      const handleKeyDown = (e) => {
        // 🔥 텍스트 입력 중이면 키보드 이벤트 무시
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return; // 텍스트 입력 중에는 CanvasArea에서 처리하지 않음
        }

        if (e.code === 'Space') {
          e.preventDefault();
          document.body.style.cursor = 'grab';
        }
        // Ctrl+G 키로 그리드 토글
        if (e.code === 'KeyG' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          setShowGrid((prev) => !prev);
        }

        // 화살표 키로 캔버스 스크롤
        if (containerRef.current && !e.ctrlKey && !e.metaKey) {
          const scrollAmount = 50;
          let scrolled = false;

          switch (e.code) {
            case 'ArrowUp':
              e.preventDefault();
              containerRef.current.scrollTop -= scrollAmount;
              scrolled = true;
              break;
            case 'ArrowDown':
              e.preventDefault();
              containerRef.current.scrollTop += scrollAmount;
              scrolled = true;
              break;
            case 'ArrowLeft':
              e.preventDefault();
              containerRef.current.scrollLeft -= scrollAmount;
              scrolled = true;
              break;
            case 'ArrowRight':
              e.preventDefault();
              containerRef.current.scrollLeft += scrollAmount;
              scrolled = true;
              break;
          }
        }
      };

      const handleKeyUp = (e) => {
        // 🔥 텍스트 입력 중이면 키보드 이벤트 무시
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
          return;
        }

        if (e.code === 'Space') {
          document.body.style.cursor = 'default';
        }
      };

      const handleGlobalWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      };

      const handleGlobalKeyDown = (e) => {
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.key === '+' || e.key === '-' || e.key === '=')
        ) {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('wheel', handleGlobalWheel, { passive: false });
      window.addEventListener('keydown', handleGlobalKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('wheel', handleGlobalWheel);
        window.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }, []);

    // 중앙으로 스크롤 (초기 로딩 시에만)
    // 뷰포트 변경 시 자동 스크롤 제거 - 사용자가 직접 조작할 수 있도록 함
    // useEffect(() => {
    //   const scrollToCenter = () => {
    //     if (ref?.current && canvasRefToUse?.current) {
    //       const container = ref.current;
    //       const canvas = canvasRefToUse.current;

    //       // 중앙으로 스크롤 (부드럽게)
    //       container.scrollTo({
    //         left: Math.max(0, (canvas.scrollWidth - container.clientWidth) / 2),
    //         top: Math.max(
    //           0,
    //           (canvas.scrollHeight - container.clientHeight) / 2
    //         ),
    //         behavior: 'smooth',
    //       });
    //     }
    //   };

    //   // 약간의 딜레이를 두고 스크롤 (DOM이 완전히 렌더링된 후)
    //   const timeoutId = setTimeout(scrollToCenter, 300);

    //   return () => clearTimeout(timeoutId);
    // }, [viewport]);

    // 줌 레벨 동기화
    useEffect(() => {
      setLocalZoom(zoom);
    }, [zoom]);

    // 줌 레벨 동기화 (부모 컴포넌트의 줌 상태와 동기화)
    useEffect(() => {
      setLocalZoom(zoom);
    }, [zoom]);

    // 스타일링 변수들
    const zoomScale = localZoom / 100;

    // 슬라이더 핸들러
    const handleSliderChange = (e) => {
      const newZoom = parseInt(e.target.value);
      setLocalZoom(newZoom);
      if (onZoomChange) onZoomChange(newZoom);
    };

    const getCanvasStyles = () => {
      // canvasHeight prop을 사용하여 동적 높이 설정 (더미 컴포넌트 불필요)
      const effectiveHeight =
        canvasHeight || (viewport === 'mobile' ? 667 : 1080);

      return {
        position: 'relative',
        width: viewport === 'mobile' ? 375 : 1920,
        height: effectiveHeight,
        background: showGrid
          ? `linear-gradient(to right, #e1e5e9 1px, transparent 1px),
       linear-gradient(to bottom, #e1e5e9 1px, transparent 1px)`
          : '#fff',
        backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
        backgroundPosition: showGrid ? '0 0' : 'initial',
        imageRendering: 'pixelated', // 줌 상태에서 그리드 선명도 개선
        border: '1px solid #e1e5e9',
        borderRadius: 12,
        margin: 0,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        transform: `scale(${zoomScale})`,
        transformOrigin: 'top left',
        overflow: 'visible',
        cursor: isPanning ? 'grabbing' : 'default',
      };
    };

    // 확장된 캔버스의 실제 크기 계산 (섹션 추가 버튼으로만 확장)
    const getActualCanvasSize = () => {
      const baseCanvasWidth = viewport === 'mobile' ? 375 : 1920;

      // canvasHeight prop을 사용하여 캔버스 높이 계산 (더미 컴포넌트 불필요)
      const effectiveHeight =
        canvasHeight || (viewport === 'mobile' ? 667 : 1080);

      return { width: baseCanvasWidth, height: effectiveHeight };
    };

    const actualCanvasSize = getActualCanvasSize();
    // 좌측 패딩(라이브러리 상태에 따라) + 우측 패딩(60px) + 여유 공간을 포함
    const leftPadding = isLibraryOpen ? 80 : 40; // 라이브러리 열림/닫힘에 따라 (축소)
    const containerWidth =
      actualCanvasSize.width + (viewport === 'mobile' ? 40 : leftPadding + 60); // 모바일: 40px, 데스크톱: 동적
    const containerHeight = actualCanvasSize.height + 240; // 상하 패딩 축소

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: '#ffffff',
          cursor: isPanning ? 'grabbing' : 'default',
          overflowX: viewport === 'mobile' ? 'hidden' : 'auto',
          overflowY: 'auto',
          paddingTop: '20px',
          display: viewport === 'mobile' ? 'flex' : 'block',
          justifyContent: viewport === 'mobile' ? 'center' : 'initial',
        }}
        ref={ref}
        onMouseDown={handleContainerMouseDown}
        onMouseMove={handleContainerMouseMove}
        onMouseUp={handleContainerMouseUp}
        onClick={(e) => {
          // 캔버스 밖 영역 클릭 시 선택 해제
          const canvasElement = canvasRefToUse.current;
          if (canvasElement) {
            const canvasRect = canvasElement.getBoundingClientRect();
            const clickX = e.clientX;
            const clickY = e.clientY;

            // 클릭 위치가 캔버스 영역 밖인지 확인
            if (
              clickX < canvasRect.left ||
              clickX > canvasRect.right ||
              clickY < canvasRect.top ||
              clickY > canvasRect.bottom
            ) {
              // 캔버스 밖 클릭 시 선택 해제
              if (onSelect) {
                onSelect(null);
              }
              return;
            }
          }

          if (onClick) {
            onClick(e);
          }
        }}
        onScroll={(e) => {
          if (isLocalComponentDragging) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* ===== OUTER WRAPPER: 캔버스 컨테이너 ===== */}
        <div
          style={{
            width: `${containerWidth}px`, // 동적 너비 설정
            height: `${containerHeight}px`, // 동적 높이 설정
            minWidth: '100%', // 최소 너비는 부모 컨테이너 크기
            display: 'flex',
            justifyContent: 'center', // 중앙 정렬로 변경
            alignItems: 'flex-start',
            // 뷰포트별 패딩 조정 (좌측은 컴포넌트 라이브러리 상태에 따라 동적 조정)
            padding:
              viewport === 'mobile'
                ? '0px'
                : `20px 40px 120px ${isLibraryOpen ? '40px' : '20px'}`, // 좌측 여백 축소
            boxSizing: 'border-box',
          }}
        >
          {/* ===== INNER WRAPPER: 실제 캔버스 프레임 ===== */}
          <div
            ref={canvasRefToUse}
            className={`canvas-frame viewport-${viewport}`}
            style={getCanvasStyles()}
            onDrop={handleDrop}
            onDragOver={onDragOver}
            onClick={(e) => {
              // 컴포넌트 위에서 클릭한 경우가 아니라면 선택 해제
              const isClickOnComponent =
                e.target.closest('[data-component-id]') !== null ||
                e.target.closest('.canvas-component') !== null;

              if (!isClickOnComponent && onSelect) {
                onSelect(null);
              }

              if (onClick) {
                onClick(e);
              }
            }}
            onMouseDown={(e) => {
              // console.log('캔버스 마우스 다운:', e.target.className);
              handleMouseDown(e);
              handleSelectionStart(e);
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={(e) => {
              handleMouseUp(e);
              handleCanvasMouseLeave();
            }}
          >
            {/* snapLines 렌더링 (정렬/간격/그리드/중앙선 타입별 색상) */}
            {snapLines.vertical.map((line, index) => (
              <div
                key={`v-${index}`}
                style={{
                  position: 'absolute',
                  left: line.x,
                  top: 0,
                  width: 1,
                  height: '100%',
                  background: '#FF0000',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  boxShadow: 'none',
                  opacity: 1,
                }}
              />
            ))}

            {snapLines.horizontal.map((line, index) => (
              <div
                key={`h-${index}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: line.y,
                  width: '100%',
                  height: 1,
                  background: '#FF0000',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  boxShadow: 'none',
                  opacity: 1,
                }}
              />
            ))}

            {/* 캔버스 내 컴포넌트 렌더링 (더미 컴포넌트 제외) */}
            {components
              .filter((comp, index, arr) => {
                // 중복 ID 제거: 같은 ID를 가진 첫 번째 컴포넌트만 유지
                const firstIndex = arr.findIndex((c) => c.id === comp.id);
                return firstIndex === index;
              })
              .map((comp) => {
                const isSelected = selectedId === comp.id;
                const isMultiSelected =
                  selectedIds && selectedIds.includes(comp.id);
                const isAnySelected = isSelected || isMultiSelected;

                return (
                  <CanvasComponent
                    key={comp.id}
                    comp={comp}
                    selected={isAnySelected}
                    selectedIds={selectedIds}
                    onSelect={onSelect}
                    onUpdate={onUpdate}
                    onMultiUpdate={onUpdate} // 다중 선택된 컴포넌트들 업데이트
                    onDelete={onDelete}
                    setSnapLines={setSnapLines}
                    zoom={localZoom}
                    viewport={viewport}
                    components={components}
                    getComponentDimensions={getComponentDimensions}
                    canvasHeight={canvasHeight} // 확장된 캔버스 높이 전달
                    updateCursorPosition={updateCursorPosition} // 협업 커서 위치 업데이트 함수 전달
                    pageId={pageId} // 페이지 ID 전달
                    setComponentDragging={setComponentDragging} // 드래그 상태 설정 함수 전달
                    isComponentDragging={checkComponentDragging} // 드래그 상태 확인 함수 전달 (이름 변경)
                  />
                );
              })}

            {/* 실시간 커서 표시 */}
            {Object.entries(users).map(([nick, u]) =>
              nick !== nickname ? (
                <UserCursor
                  key={nick}
                  x={u.x}
                  y={u.y}
                  color={u.color}
                  nickname={nick}
                />
              ) : null
            )}

            {/* 다중 선택 영역 표시 */}
            {selectionBox && (
              <div
                style={{
                  position: 'absolute',
                  left: selectionBox.x,
                  top: selectionBox.y,
                  width: selectionBox.width,
                  height: selectionBox.height,
                  border: '2px dashed #3B4EFF',
                  backgroundColor: 'rgba(59, 78, 255, 0.15)',
                  pointerEvents: 'none',
                  zIndex: 1001,
                  boxShadow: '0 0 8px rgba(59, 78, 255, 0.3)',
                  // 캔버스 경계를 넘어서도 표시되도록 설정
                  overflow: 'visible',
                }}
              />
            )}

            {/* 선택 영역 표시 */}
            {selectedId && (
              <div
                style={{
                  position: 'absolute',
                  border: '2px solid #3B4EFF',
                  borderRadius: 4,
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              />
            )}

            {/* 섹션 추가 버튼 - 캔버스 내부 하단에 위치 */}
            <AddSectionButton
              canvasHeight={canvasHeight}
              viewport={viewport}
              onAddSection={onAddSection}
            />

            {/* 협업 기능: 라이브 커서 */}
            <LiveCursors
              cursors={otherCursors}
              zoom={localZoom}
              viewport={viewport}
              cursorChatMessages={cursorChatMessages}
            />

            {/* 협업 기능: 다른 사용자 선택 영역 */}
            <CollaborativeSelections
              selections={otherSelections}
              components={components}
              zoom={localZoom}
              viewport={viewport}
              getComponentDimensions={getComponentDimensions}
            />
          </div>
        </div>

        {/* 글로벌 스크롤바 스타일 적용 */}
        <style>{`
      /* 캔버스 컨테이너에서 글로벌 스크롤바 스타일 사용 */
      ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
      }
      ::-webkit-scrollbar-track {
        background: var(--color-primary-50) !important;
      }
      ::-webkit-scrollbar-thumb {
        background: var(--color-primary-100) !important;
        border-radius: 4px !important;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--color-primary-200) !important;
      }
      ::-webkit-scrollbar-corner {
        background: var(--color-primary-50) !important;
      }
      
      /* Firefox 스크롤바 스타일 */
      * {
        scrollbar-width: thin !important;
        scrollbar-color: var(--color-primary-100) var(--color-primary-50) !important;
      }
    `}</style>
      </div>
    );
  }
);

export default CanvasArea;
