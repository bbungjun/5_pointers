import React, { useRef, useState, useEffect } from 'react';
import ButtonRenderer from '../ComponentRenderers/ButtonRenderer';
import TextRenderer from '../ComponentRenderers/TextRenderer';
import LinkRenderer from '../ComponentRenderers/LinkRenderer';
import AttendRenderer from '../ComponentRenderers/AttendRenderer';
import MapView from '../ComponentEditors/MapView';
import DdayRenderer from '../ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from '../ComponentRenderers/WeddingContactRenderer.jsx';
import WeddingInviteRenderer from '../ComponentRenderers/WeddingInviteRenderer';
import ImageRenderer from '../ComponentRenderers/ImageRenderer';
import GridGalleryRenderer from '../ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from '../ComponentRenderers/SlideGalleryRenderer';
import { MapInfoRenderer } from '../ComponentRenderers';
import CalendarRenderer from '../ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from '../ComponentRenderers/BankAccountRenderer';
import CommentRenderer from '../ComponentRenderers/CommentRenderer';
import {
  clamp,
  resolveCollision,
  calculateSnapPosition,
  calculateSnapLines,
  getFinalStyles,
  getCanvasSize,
} from '../utils/editorUtils';
import MusicRenderer from '../ComponentRenderers/MusicRenderer';
import KakaoTalkShareRenderer from '../ComponentRenderers/KakaoTalkShareRenderer';

// 그리드 크기 상수
const GRID_SIZE = 50;

// 캔버스 내 드래그 가능한 컴포넌트
function CanvasComponent({
  comp,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  setSnapLines,
  zoom = 100,
  viewport = 'desktop',
  components = [],
  getComponentDimensions,
  canvasHeight, // 확장된 캔버스 높이
}) {
  const ref = useRef();

  // 더블클릭 시 텍스트 편집
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props?.text || '');
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    corner: '',
  });
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    compX: 0,
    compY: 0,
  });

  // 줌 레벨에 따른 그리드 크기 계산
  const scale = zoom / 100;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기

  const componentDimensions = getComponentDimensions(comp.type);

  // 현재 뷰포트에 맞는 최종 스타일 계산
  const finalStyles = getFinalStyles(comp, viewport);
  const currentX = finalStyles.x;
  const currentY = finalStyles.y;
  const finalWidth = finalStyles.width;
  const finalHeight = finalStyles.height;
  const finalProps = finalStyles.props;

  // 확장된 캔버스 크기 계산 공통 함수
  const getExtendedCanvasSize = () => {
    const canvasSize = getCanvasSize(viewport);
    const baseWidth = canvasSize.width;

    // canvasHeight prop을 사용하여 확장된 캔버스 높이 계산 (더미 컴포넌트 불필요)
    const effectiveHeight = canvasHeight || canvasSize.height;

    return { width: baseWidth, height: effectiveHeight };
  };

  // 컴포넌트별 실제 크기 계산 (finalStyles 기반으로 수정)
  const getActualSize = () => {
    // 이미지 컴포넌트의 경우 props에서 크기를 가져옴
    if (comp.type === 'image') {
      return {
        width:
          finalProps?.width || finalWidth || componentDimensions.defaultWidth,
        height:
          finalProps?.height ||
          finalHeight ||
          componentDimensions.defaultHeight,
      };
    }

    // 고정 크기 컴포넌트들 (리사이즈가 어려운 컴포넌트들)
    if (
      [
        'attend',
        'dday',
        'weddingContact',
        'weddingInvite',
        'calendar',
        'bankAccount',
        'comment',
      ].includes(comp.type)
    ) {
      // 이런 컴포넌트들은 내부 레이아웃이 복잡하므로 기본 크기를 우선 사용
      return {
        width: finalWidth || componentDimensions.defaultWidth,
        height: finalHeight || componentDimensions.defaultHeight,
      };
    }

    // 갤러리 컴포넌트들 (동적 크기 조정 가능)
    if (['gridGallery', 'slideGallery'].includes(comp.type)) {
      return {
        width: finalWidth || componentDimensions.defaultWidth,
        height: finalHeight || componentDimensions.defaultHeight,
      };
    }

    // 기본 컴포넌트들 (button, text, link 등)
    return {
      width: finalWidth || componentDimensions.defaultWidth,
      height: finalHeight || componentDimensions.defaultHeight,
    };
  };

  const actualSize = getActualSize();
  const currentWidth = actualSize.width;
  const currentHeight = actualSize.height;

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  // ===== 반응형 클래스 생성 =====
  const getResponsiveClasses = (componentType) => {
    const baseClass = `${componentType}-component`;
    const viewportClass = `viewport-${viewport}`;
    return `${baseClass} ${viewportClass}`;
  };

  const renderContent = () => {
    // 현재 뷰포트에 맞는 컴포넌트 객체 생성
    const componentWithFinalStyles = {
      ...comp,
      props: finalProps,
      x: currentX,
      y: currentY,
      width: finalWidth,
      height: finalHeight,
    };

    if (editing) {
      return (
        <input
          ref={ref}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            setEditing(false);
            // responsive 구조로 텍스트 업데이트
            const updatedResponsive = {
              ...comp.responsive,
              [viewport]: {
                ...(comp.responsive?.[viewport] || {}),
                props: {
                  ...(comp.responsive?.[viewport]?.props || {}),
                  text: editValue,
                },
              },
            };
            onUpdate({
              ...comp,
              responsive: updatedResponsive,
              // 호환성 필드 제거: responsive 구조만 사용하여 뷰포트별 독립성 보장
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditing(false);
              // responsive 구조로 텍스트 업데이트
              const updatedResponsive = {
                ...comp.responsive,
                [viewport]: {
                  ...(comp.responsive?.[viewport] || {}),
                  props: {
                    ...(comp.responsive?.[viewport]?.props || {}),
                    text: editValue,
                  },
                },
              };
              onUpdate({
                ...comp,
                responsive: updatedResponsive,
                // 호환성 필드 제거: responsive 구조만 사용하여 뷰포트별 독립성 보장
              });
            }
          }}
          style={{
            fontSize: finalProps?.fontSize,
            width: '100%',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
          }}
        />
      );
    }

    switch (comp.type) {
      case 'button':
        return (
          <ButtonRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'text':
        return (
          <TextRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'link':
        return (
          <LinkRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'attend':
        return (
          <AttendRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'map':
        return <MapView {...(finalProps || {})} />;
      case 'dday':
        return (
          <DdayRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'weddingContact':
        return (
          <WeddingContactRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'weddingInvite':
        return (
          <WeddingInviteRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'image':
        return (
          <ImageRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'gridGallery':
        return (
          <GridGalleryRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'slideGallery':
        return (
          <SlideGalleryRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
          />
        );
      case 'mapInfo':
        return (
          <MapInfoRenderer comp={componentWithFinalStyles} isEditor={true} />
        );
      case 'calendar':
        return (
          <CalendarRenderer comp={componentWithFinalStyles} isEditor={true} />
        );
      case 'bankAccount':
        return (
          <BankAccountRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
          />
        );
      case 'comment':
        return (
          <CommentRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            viewport={viewport}
          />
        );
      case 'musicPlayer':
        return (
          <MusicRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
            viewport={viewport}
          />
        );
      case 'kakaotalkShare':
        return (
          <KakaoTalkShareRenderer
            comp={componentWithFinalStyles}
            isEditor={true}
            onUpdate={onUpdate}
            viewport={viewport}
          />
        );
      default:
        return <span>{finalProps?.text || ''}</span>;
    }
  };

  // 리사이즈 핸들러
  const handleResizeStart = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    console.log(
      '리사이즈 시작:',
      comp.id,
      '뷰포트:',
      viewport,
      '모서리:',
      corner
    );

    // 현재 뷰포트에 스타일이 없으면 먼저 생성
    const wasUpdated = ensureCurrentViewportStyle();
    if (wasUpdated) {
      console.log('📝 현재 뷰포트 스타일 자동 생성 (리사이즈):', viewport);
      // 스타일이 업데이트되면 다음 렌더링에서 리사이즈 시작
      setTimeout(() => {
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: currentWidth,
          height: currentHeight,
          corner: corner,
        });
        setIsResizing(true);
      }, 0);
    } else {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: currentWidth,
        height: currentHeight,
        corner: corner,
      });
    }
  };

  const handleResize = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    // 줌 레벨에 맞는 그리드에 스냅된 크기 계산
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    // 모서리별 리사이즈 로직
    switch (resizeStart.corner) {
      case 'se':
        newWidth = Math.max(
          componentDimensions.minWidth,
          Math.round((resizeStart.width + deltaX) / effectiveGridSize) *
            effectiveGridSize
        );
        newHeight = Math.max(
          componentDimensions.minHeight,
          Math.round((resizeStart.height + deltaY) / effectiveGridSize) *
            effectiveGridSize
        );
        break;
      case 'sw':
        newWidth = Math.max(
          componentDimensions.minWidth,
          Math.round((resizeStart.width - deltaX) / effectiveGridSize) *
            effectiveGridSize
        );
        newHeight = Math.max(
          componentDimensions.minHeight,
          Math.round((resizeStart.height + deltaY) / effectiveGridSize) *
            effectiveGridSize
        );
        break;
      case 'ne':
        newWidth = Math.max(
          componentDimensions.minWidth,
          Math.round((resizeStart.width + deltaX) / effectiveGridSize) *
            effectiveGridSize
        );
        newHeight = Math.max(
          componentDimensions.minHeight,
          Math.round((resizeStart.height - deltaY) / effectiveGridSize) *
            effectiveGridSize
        );
        break;
      case 'nw':
        newWidth = Math.max(
          componentDimensions.minWidth,
          Math.round((resizeStart.width - deltaX) / effectiveGridSize) *
            effectiveGridSize
        );
        newHeight = Math.max(
          componentDimensions.minHeight,
          Math.round((resizeStart.height - deltaY) / effectiveGridSize) *
            effectiveGridSize
        );
        break;
    }

    const canvasSize = getExtendedCanvasSize();

    // 캔버스 경계 제한 (확장된 캔버스 크기 사용)
    const maxWidth = Math.max(0, canvasSize.width - comp.x);
    const maxHeight = Math.max(0, canvasSize.height - comp.y);

    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    // responsive 구조로 크기 업데이트
    const updatedResponsive = {
      ...comp.responsive,
      [viewport]: {
        ...(comp.responsive?.[viewport] || {}),
        width: newWidth,
        height: newHeight,
      },
    };

    // 컴포넌트 타입에 따라 다르게 업데이트
    if (comp.type === 'image') {
      // 이미지 컴포넌트는 props에도 크기 저장
      const updatedResponsiveWithProps = {
        ...updatedResponsive,
        [viewport]: {
          ...updatedResponsive[viewport],
          props: {
            ...(comp.responsive?.[viewport]?.props || {}),
            width: newWidth,
            height: newHeight,
          },
        },
      };

      onUpdate({
        ...comp,
        responsive: updatedResponsiveWithProps,
        // 호환성 필드 제거: responsive 구조만 사용하여 뷰포트별 독립성 보장
      });
    } else {
      // 다른 컴포넌트들도 responsive 구조만 사용
      onUpdate({
        ...comp,
        responsive: updatedResponsive,
        // 호환성 필드 제거: responsive 구조만 사용하여 뷰포트별 독립성 보장
      });
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    // 리사이즈가 끝나면 스냅라인 숨기기
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 현재 뷰포트에 스타일이 없으면 폴백 스타일을 복사하는 함수
  const ensureCurrentViewportStyle = () => {
    if (!comp.responsive || !comp.responsive[viewport]) {
      // 현재 뷰포트에 스타일이 없으면 폴백 스타일을 현재 뷰포트에 복사
      const fallbackStyles = comp.responsive?.desktop || {
        x: comp.x || 0,
        y: comp.y || 0,
        width: comp.width,
        height: comp.height,
        props: comp.props || {},
      };

      const updatedResponsive = {
        ...comp.responsive,
        [viewport]: { ...fallbackStyles },
      };

      onUpdate({
        ...comp,
        responsive: updatedResponsive,
      });

      return true; // 업데이트 발생
    }
    return false; // 업데이트 불필요
  };

  // 드래그 핸들러
  const handleDragStart = (e) => {
    if (isResizing) return;

    e.stopPropagation();
    console.log(
      '드래그 시작:',
      comp.id,
      '현재 위치:',
      currentX,
      currentY,
      '뷰포트:',
      viewport
    );

    // 현재 뷰포트에 스타일이 없으면 먼저 생성
    const wasUpdated = ensureCurrentViewportStyle();
    if (wasUpdated) {
      console.log('📝 현재 뷰포트 스타일 자동 생성:', viewport);
      // 스타일이 업데이트되면 다음 렌더링에서 드래그 시작
      setTimeout(() => {
        setDragStart({
          x: e.clientX,
          y: e.clientY,
          compX: currentX,
          compY: currentY,
        });
        setIsDragging(true);
      }, 0);
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        compX: currentX,
        compY: currentY,
      });
    }
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    const canvasSize = getExtendedCanvasSize();

    // 뷰포트에 따른 드래그 경계 제한 (확장된 캔버스 크기 사용)
    const maxX = Math.max(0, canvasSize.width - currentWidth);
    const maxY = Math.max(0, canvasSize.height - currentHeight);

    // 기본 위치 계산 (그리드 스냅 적용)
    let newX =
      Math.round((dragStart.compX + deltaX) / effectiveGridSize) *
      effectiveGridSize;
    let newY =
      Math.round((dragStart.compY + deltaY) / effectiveGridSize) *
      effectiveGridSize;

    // 다른 컴포넌트들과 스냅라인 계산
    const tempComp = {
      ...comp,
      x: newX,
      y: newY,
      width: currentWidth,
      height: currentHeight,
    };
    const otherComponents = components?.filter((c) => c.id !== comp.id) || [];

    // 다른 컴포넌트들의 현재 뷰포트 위치 계산 (실시간 반영)
    const otherComponentsWithCurrentViewport = otherComponents.map(
      (otherComp) => {
        const otherStyles = getFinalStyles(otherComp, viewport);
        const otherDimensions = getComponentDimensions(otherComp.type);
        return {
          ...otherComp,
          x: otherStyles.x,
          y: otherStyles.y,
          width: otherStyles.width || otherDimensions.defaultWidth,
          height: otherStyles.height || otherDimensions.defaultHeight,
        };
      }
    );

    // 스냅라인 계산
    const snapResult = calculateSnapPosition(
      tempComp,
      otherComponentsWithCurrentViewport,
      effectiveGridSize,
      viewport,
      getComponentDimensions
    );
    if (snapResult.snapped) {
      newX = snapResult.x;
      newY = snapResult.y;
    }

    // 충돌 방지 계산
    const collisionResult = resolveCollision(
      { ...comp, x: newX, y: newY },
      otherComponentsWithCurrentViewport,
      getComponentDimensions
    );
    newX = collisionResult.x;
    newY = collisionResult.y;

    // 경계 제한 적용
    newX = clamp(newX, 0, maxX);
    newY = clamp(newY, 0, maxY);

    // 최종 위치가 결정된 후 스냅라인 계산 (실시간 가이드라인)
    if (setSnapLines) {
      const finalTempComp = {
        ...comp,
        x: newX,
        y: newY,
        width: currentWidth,
        height: currentHeight,
      };

      const lines = calculateSnapLines(
        finalTempComp,
        otherComponentsWithCurrentViewport,
        zoom,
        viewport,
        getComponentDimensions
      );
      setSnapLines(lines);
    }

    console.log(
      '드래그 중:',
      comp.id,
      '새 위치:',
      newX,
      newY,
      '뷰포트:',
      viewport
    );

    // responsive 구조로 업데이트
    const updatedResponsive = {
      ...comp.responsive,
      [viewport]: {
        ...(comp.responsive?.[viewport] || {}),
        x: newX,
        y: newY,
      },
    };

    onUpdate({
      ...comp,
      responsive: updatedResponsive,
      // 호환성 필드 제거: responsive 구조만 사용하여 뷰포트별 독립성 보장
    });
  };

  // 드래그 종료 핸들러 (snapLines 항상 초기화)
  const handleDragEnd = () => {
    setIsDragging(false);
    // 드래그가 끝나면 snapLines를 항상 초기화 (숨김)
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 리사이즈 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = handleResize;
      const handleMouseUp = handleResizeEnd;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeStart]);

  // 드래그 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = handleDrag;
      const handleMouseUp = handleDragEnd;

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [
    isDragging,
    dragStart,
    components,
    viewport,
    getComponentDimensions,
    setSnapLines,
  ]);

  return (
    <div
      ref={ref}
      className={`canvas-component ${getResponsiveClasses(comp.type)}`}
      data-component-id={comp.id}
      style={{
        position: 'absolute',
        left: currentX,
        top: currentY,
        width: currentWidth,
        height: currentHeight,
        border: selected ? '2px solid #3B4EFF' : '1px solid transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'transparent',
        zIndex: selected ? 10 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comp.id);
      }}
    >
      {renderContent()}

      {/* Figma 스타일 선택 핸들 */}
      {selected && (
        <>
          {/* 모서리 리사이즈 핸들 - 실제 컴포넌트 크기에 맞게 배치 */}
          <div
            style={{
              position: 'absolute',
              top: -4 / scale,
              left: -4 / scale,
              width: 8 / scale,
              height: 8 / scale,
              background: '#3B4EFF',
              border: `${2 / scale}px solid #fff`,
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 11,
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            style={{
              position: 'absolute',
              top: -4 / scale,
              left: currentWidth - 4 / scale,
              width: 8 / scale,
              height: 8 / scale,
              background: '#3B4EFF',
              border: `${2 / scale}px solid #fff`,
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 11,
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            style={{
              position: 'absolute',
              top: currentHeight - 4 / scale,
              left: -4 / scale,
              width: 8 / scale,
              height: 8 / scale,
              background: '#3B4EFF',
              border: `${2 / scale}px solid #fff`,
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 11,
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            style={{
              position: 'absolute',
              top: currentHeight - 4 / scale,
              left: currentWidth - 4 / scale,
              width: 8 / scale,
              height: 8 / scale,
              background: '#3B4EFF',
              border: `${2 / scale}px solid #fff`,
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 11,
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />

          {/* 삭제 버튼 - 실제 컴포넌트 크기에 맞게 배치 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(comp.id);
            }}
            style={{
              position: 'absolute',
              top: -20 / scale,
              left: currentWidth + 4 / scale,
              background: '#FF3B3B',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 24 / scale,
              height: 24 / scale,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: 14 / scale,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 ${2 / scale}px ${8 / scale}px rgba(255, 59, 59, 0.3)`,
              transition: 'all 0.2s',
              zIndex: 12,
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.background = '#ff5252';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = '#FF3B3B';
            }}
            title="Delete"
          >
            ×
          </button>
        </>
      )}
    </div>
  );
}

export default CanvasComponent;
