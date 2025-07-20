import React, { useRef, useState, useEffect, useCallback } from 'react';
import ButtonRenderer from '../ComponentRenderers/ButtonRenderer';
import TextRenderer from '../ComponentRenderers/TextRenderer';
import LinkRenderer from '../ComponentRenderers/LinkRenderer';
import AttendRenderer from '../ComponentRenderers/AttendRenderer';
import MapView from '../ComponentRenderers/MapView';
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
import SlidoRenderer from '../ComponentRenderers/SlidoRenderer';
import PageButtonRenderer from '../ComponentRenderers/PageButtonRenderer';
import LinkCopyRenderer from '../ComponentRenderers/LinkCopyRenderer';

import {
  clamp,
  resolveCollision,
  calculateSnapPosition,
  calculateSnapLines,
  getFinalStyles,
} from '../utils/editorUtils';
import MusicRenderer from '../ComponentRenderers/MusicRenderer';
import PageRenderer from '../ComponentRenderers/PageRenderer';
import KakaoTalkShareRenderer from '../ComponentRenderers/KakaoTalkShareRenderer';

// 그리드 크기 상수
const GRID_SIZE = 50;

// 캔버스 내 드래그 가능한 컴포넌트
function CanvasComponent({
  comp,
  selected,
  selectedIds, // 다중 선택된 컴포넌트 ID 배열
  onSelect,
  onUpdate,
  onMultiUpdate, // 다중 선택된 컴포넌트들 업데이트
  onDelete,
  setSnapLines,
  zoom = 100,
  viewport = 'desktop',
  components = [],
  getComponentDimensions,
  canvasHeight, // 확장된 캔버스 높이
  updateCursorPosition, // 협업 커서 위치 업데이트 함수
  pageId, // 페이지 ID prop 추가
  setComponentDragging, // 드래그 상태 설정 함수
  isComponentDragging, // 드래그 상태 확인 함수
}) {
  const ref = useRef();

  const handleComponentUpdate = (updatedComp) => {
    if (onUpdate) {
      // 협업 시스템을 통한 업데이트
      onUpdate(updatedComp);
    }
  };

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
  const dragUpdateTimeoutRef = useRef(null);

  // 줌 레벨에 따른 그리드 크기 계산
  const scale = zoom / 100;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기

  const componentDimensions = getComponentDimensions(comp.type);

  // 단일 좌표계에서 직접 값 사용
  const currentX = comp.x || 0;
  const currentY = comp.y || 0;
  const finalWidth = comp.width;
  const finalHeight = comp.height;
  const finalProps = comp.props || {};

  // 확장된 캔버스 크기 계산 공통 함수
  const getExtendedCanvasSize = () => {
    const baseWidth = viewport === 'mobile' ? 375 : 1920;

    // canvasHeight prop을 사용하여 확장된 캔버스 높이 계산 (더미 컴포넌트 불필요)
    const effectiveHeight =
      canvasHeight || (viewport === 'mobile' ? 667 : 1080);

    return { width: baseWidth, height: effectiveHeight };
  };

  // 컴포넌트별 실제 크기 계산 (finalStyles 기반으로 수정)
  const getActualSize = () => {
    // 이미지 컴포넌트의 경우 props에서 크기를 가져옴
    if (comp.type === 'image') {
      return {
        width:
          comp.props?.width || comp.width || componentDimensions.defaultWidth,
        height:
          comp.props?.height ||
          comp.height ||
          componentDimensions.defaultHeight,
      };
    }

    // 기본 컴포넌트들
    return {
      width: comp.width || componentDimensions.defaultWidth,
      height: comp.height || componentDimensions.defaultHeight,
    };
  };

  const actualSize = getActualSize();
  const currentWidth = actualSize.width;
  const currentHeight = actualSize.height;

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  // 구 반응형 시스템의 클래스 생성 함수 제거됨
  // 새로운 단일 좌표계에서는 CSS 클래스 기반 반응형 불필요

  const renderContent = () => {
    // 컴포넌트 객체 생성
    const componentWithFinalStyles = {
      ...comp,
      props: comp.props || {},
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
            // 단일 좌표계로 텍스트 업데이트
            onUpdate({
              ...comp,
              props: {
                ...comp.props,
                text: editValue,
              },
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditing(false);
              // 단일 좌표계로 텍스트 업데이트
              onUpdate({
                ...comp,
                props: {
                  ...comp.props,
                  text: editValue,
                },
              });
            }
          }}
          style={{
            fontSize: comp.props?.fontSize,
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
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'text':
        return (
          <TextRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            isPreview={false}
            isSelected={selected}
            onUpdate={onUpdate}
          />
        );

      case 'link':
        return (
          <LinkRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'attend':
        return (
          <AttendRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
            pageId={pageId}
          />
        );
      case 'map':
        return (
          <MapView
            {...(comp.props || {})}
            comp={componentWithFinalStyles}
            mode="editor"
          />
        );
      case 'dday':
        return (
          <DdayRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'weddingContact':
        return (
          <WeddingContactRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'weddingInvite':
        return (
          <WeddingInviteRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'image':
        return (
          <ImageRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'gridGallery':
        return (
          <GridGalleryRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'slideGallery':
        return (
          <SlideGalleryRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'mapInfo':
        return (
          <MapInfoRenderer comp={componentWithFinalStyles} mode="editor" />
        );
      case 'calendar':
        return (
          <CalendarRenderer comp={componentWithFinalStyles} mode="editor" />
        );
      case 'bankAccount':
        return (
          <BankAccountRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={handleComponentUpdate}
          />
        );
      case 'comment':
        return (
          <CommentRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            viewport={viewport}
          />
        );
      case 'slido':
        return (
          <SlidoRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
            viewport={viewport}
          />
        );
      case 'musicPlayer':
        return (
          <MusicRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
            viewport={viewport}
          />
        );
      case 'kakaotalkShare':
        return (
          <KakaoTalkShareRenderer
            comp={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
            viewport={viewport}
          />
        );

      case 'page':
        return (
          <PageRenderer
            component={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );

      case 'pageButton':
        return (
          <PageButtonRenderer
            component={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );
      case 'linkCopy':
        return (
          <LinkCopyRenderer
            component={componentWithFinalStyles}
            mode="editor"
            onUpdate={onUpdate}
          />
        );

      default:
        return <span>{comp.props?.text || ''}</span>;
    }
  };

  // 리사이즈 핸들러
  const handleResizeStart = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: currentWidth,
      height: currentHeight,
      corner: corner,
    });
  };

  const handleResize = useCallback(
    (e) => {
      if (!isResizing) return;

      // 리사이즈 중에도 커서 위치 업데이트
      if (updateCursorPosition) {
        updateCursorPosition(e.clientX, e.clientY, zoom, viewport);
      }

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

      // 단일 좌표계로 크기 업데이트
      const updatedComp = {
        ...comp,
        width: newWidth,
        height: newHeight,
      };

      // 컴포넌트 타입에 따라 다르게 업데이트
      if (comp.type === 'image') {
        // 이미지 컴포넌트는 props에도 크기 저장
        updatedComp.props = {
          ...comp.props,
          width: newWidth,
          height: newHeight,
        };
      }

      // 협업 시스템을 통한 업데이트
      onUpdate(updatedComp);
    },
    [
      isResizing,
      updateCursorPosition,
      zoom,
      viewport,
      resizeStart,
      currentWidth,
      currentHeight,
      setSnapLines,
      onUpdate,
    ]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // 리사이즈가 끝나면 스냅라인 숨기기
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  }, [setSnapLines]);

  // 드래그 핸들러
  const handleDragStart = (e) => {
    if (isResizing) return;

    e.stopPropagation();
    console.log('드래그 시작:', comp.id, '현재 위치:', currentX, currentY);

    // 🔧 드래그 상태 설정 (다른 사용자의 업데이트 방지)
    if (setComponentDragging) {
      setComponentDragging(comp.id, true);
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      compX: currentX,
      compY: currentY,
    });
  };

  const handleDrag = useCallback(
    (e) => {
      if (!isDragging) return;

      // 드래그 중에도 커서 위치 업데이트
      if (updateCursorPosition) {
        updateCursorPosition(e.clientX, e.clientY, zoom, viewport);
      }

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
      const tempComp = { ...comp, x: newX, y: newY };
      const otherComponents = components?.filter((c) => c.id !== comp.id) || [];

      // 스냅라인 계산
      const snapResult = calculateSnapPosition(
        tempComp,
        otherComponents,
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
        otherComponents,
        getComponentDimensions
      );
      newX = collisionResult.x;
      newY = collisionResult.y;

      // 경계 제한 적용
      newX = clamp(newX, 0, maxX);
      newY = clamp(newY, 0, maxY);

      // 스냅라인 업데이트 (드래그 중에 실시간으로)
      if (setSnapLines) {
        const lines = calculateSnapLines(
          { ...comp, x: newX, y: newY },
          otherComponents,
          zoom,
          viewport,
          getComponentDimensions
        );
        setSnapLines(lines);
      }

      // 🔧 실시간 Y.js 동기화 (협업 개선)
      if (newX !== currentX || newY !== currentY) {
        // 드래그 중에도 실시간으로 Y.js 동기화
        const updatedComponent = {
          ...comp,
          x: newX,
          y: newY,
        };

        // 쓰로틀링을 적용하여 성능 최적화 (더 빠른 업데이트)
        if (!dragUpdateTimeoutRef.current) {
          dragUpdateTimeoutRef.current = setTimeout(() => {
            onUpdate(updatedComponent);
            dragUpdateTimeoutRef.current = null;
          }, 8); // 120fps로 제한 (더 부드러운 동기화)
        }
      }

      // 임시 위치도 업데이트 (시각적 피드백)
      setDragStart((prev) => ({
        ...prev,
        tempX: newX,
        tempY: newY,
      }));
    },
    [
      isDragging,
      updateCursorPosition,
      zoom,
      viewport,
      dragStart,
      currentX,
      currentY,
      setSnapLines,
      onUpdate,
      setComponentDragging,
      comp,
    ]
  );

  // 드래그 종료 핸들러 (snapLines 항상 초기화)
  const handleDragEnd = useCallback(() => {
    // 🔧 드래그 상태 해제 (다른 사용자의 업데이트 허용)
    if (setComponentDragging) {
      setComponentDragging(comp.id, false);
    }

    // 드래그 업데이트 타임아웃 정리
    if (dragUpdateTimeoutRef.current) {
      clearTimeout(dragUpdateTimeoutRef.current);
      dragUpdateTimeoutRef.current = null;
    }

    // 최종 위치 계산
    const finalX = dragStart.tempX !== undefined ? dragStart.tempX : currentX;
    const finalY = dragStart.tempY !== undefined ? dragStart.tempY : currentY;

    // 🔧 드래그 완료 시 최종 동기화 (실시간 업데이트와 중복 방지)
    if (finalX !== currentX || finalY !== currentY) {
      // 다중 선택된 컴포넌트들과 함께 이동
      if (
        selectedIds &&
        selectedIds.length > 1 &&
        selectedIds.includes(comp.id)
      ) {
        const deltaX = finalX - currentX;
        const deltaY = finalY - currentY;

        selectedIds.forEach((selectedId) => {
          if (selectedId !== comp.id) {
            const selectedComp = components.find((c) => c.id === selectedId);
            if (selectedComp) {
              onMultiUpdate({
                ...selectedComp,
                x: selectedComp.x + deltaX,
                y: selectedComp.y + deltaY,
              });
            }
          }
        });
      }

      // 메인 컴포넌트 최종 위치 업데이트
      const updatedComponent = {
        ...comp,
        x: finalX,
        y: finalY,
      };

      onUpdate(updatedComponent);
    }

    setIsDragging(false);

    // 드래그가 끝나면 snapLines를 항상 초기화 (숨김)
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  }, [
    comp.id,
    setComponentDragging,
    dragStart,
    currentX,
    currentY,
    selectedIds,
    components,
    onUpdate,
    onMultiUpdate,
    setSnapLines,
  ]);

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
  }, [isResizing]);

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
  }, [isDragging]);

  // 컴포넌트 정리 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (dragUpdateTimeoutRef.current) {
        clearTimeout(dragUpdateTimeoutRef.current);
        dragUpdateTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className="canvas-component"
      data-component-id={comp.id}
      style={{
        position: 'absolute',
        // 🔧 드래그 중에는 임시 위치 사용, 아니면 실제 위치 사용
        left:
          isDragging && dragStart.tempX !== undefined
            ? dragStart.tempX
            : currentX,
        top:
          isDragging && dragStart.tempY !== undefined
            ? dragStart.tempY
            : currentY,
        width: currentWidth,
        //height: currentHeight,
        height: comp.type === 'bankAccount' ? 'auto' : currentHeight,
        border: selected ? '2px solid #3B4EFF' : '1px solid transparent',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: selected ? 'rgba(59, 78, 255, 0.05)' : 'transparent',
        //zIndex: selected ? 2000 : (comp.type === 'text' ? Math.max(comp.props?.zIndex || 1000, 1000) : (comp.props?.zIndex || 1)),
        zIndex: comp.type === 'text' ? 2000 : 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        // 드래그 중 시각적 피드백
        opacity: isDragging ? 0.8 : 1,
        transition: isDragging ? 'none' : 'all 0.1s ease',
      }}
      data-selected={selected}
      data-selected-ids={selectedIds ? selectedIds.join(',') : ''}
      onMouseDown={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        const isCtrlPressed = e.ctrlKey || e.metaKey;
        onSelect(comp.id, isCtrlPressed);
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
        </>
      )}
    </div>
  );
}

export default CanvasComponent;
