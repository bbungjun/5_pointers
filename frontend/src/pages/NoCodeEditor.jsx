import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams, useLocation } from 'react-router-dom';
import ComponentLibrary from './NoCodeEditor/ComponentLibrary';
import CanvasArea from './NoCodeEditor/CanvasArea';
import Inspector from './NoCodeEditor/Inspector';
import PreviewModal from './NoCodeEditor/PreviewModal';
import { ComponentDefinitions } from './components/definitions';
import ButtonRenderer from './NoCodeEditor/ComponentRenderers/ButtonRenderer';
import TextRenderer from './NoCodeEditor/ComponentRenderers/TextRenderer';
import LinkRenderer from './NoCodeEditor/ComponentRenderers/LinkRenderer';
import AttendRenderer from './NoCodeEditor/ComponentRenderers/AttendRenderer';
import MapView from './NoCodeEditor/ComponentEditors/MapView';
import DdayRenderer from './NoCodeEditor/ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './NoCodeEditor/ComponentRenderers/WeddingContactRenderer.jsx';
import ImageRenderer from './NoCodeEditor/ComponentRenderers/ImageRenderer';
import ViewportController from './NoCodeEditor/ViewportController';
import GridGalleryRenderer from './NoCodeEditor/ComponentRenderers/GridGalleryRenderer';
import SlideGalleryRenderer from './NoCodeEditor/ComponentRenderers/SlideGalleryRenderer';
import CalendarRenderer from './NoCodeEditor/ComponentRenderers/CalendarRenderer';
import BankAccountRenderer from './NoCodeEditor/ComponentRenderers/BankAccountRenderer';
import MapInfoRenderer from './NoCodeEditor/ComponentRenderers/MapInfoRenderer';
import CommentRenderer from './NoCodeEditor/ComponentRenderers/CommentRenderer';


// 그리드 크기 상수
const GRID_SIZE = 50;

// 랜덤 닉네임/색상 생성
function randomNickname() {
  const animals = ['Tiger', 'Bear', 'Fox', 'Wolf', 'Cat', 'Dog', 'Lion', 'Panda', 'Rabbit', 'Eagle'];
  return animals[Math.floor(Math.random() * animals.length)] + Math.floor(Math.random() * 100);
}
function randomColor() {
  const colors = ['#3B4EFF', '#FF3B3B', '#00B894', '#FDCB6E', '#6C5CE7', '#00B8D9', '#FF7675', '#636E72'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// clamp 함수 추가
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 충돌 감지 함수
function checkCollision(comp1, comp2) {
  const comp1Dimensions = getComponentDimensions(comp1.type);
  const comp2Dimensions = getComponentDimensions(comp2.type);
  
  const comp1Width = comp1.width || comp1Dimensions.defaultWidth;
  const comp1Height = comp1.height || comp1Dimensions.defaultHeight;
  const comp2Width = comp2.width || comp2Dimensions.defaultWidth;
  const comp2Height = comp2.height || comp2Dimensions.defaultHeight;
  
  return !(comp1.x + comp1Width <= comp2.x || 
           comp2.x + comp2Width <= comp1.x || 
           comp1.y + comp1Height <= comp2.y || 
           comp2.y + comp2Height <= comp1.y);
}

// 충돌 방지 위치 계산 함수
function resolveCollision(draggedComp, otherComponents) {
  const COLLISION_MARGIN = 10; // 컴포넌트 간 최소 간격
  let resolvedX = draggedComp.x;
  let resolvedY = draggedComp.y;
  
  const draggedDimensions = getComponentDimensions(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  // 각 컴포넌트와의 충돌 검사 및 해결
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;
    
    const tempComp = { ...draggedComp, x: resolvedX, y: resolvedY };
    if (checkCollision(tempComp, other)) {
      const otherDimensions = getComponentDimensions(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;
      
      // 4방향 중 가장 가까운 위치로 이동
      const moveOptions = [
        { x: other.x - draggedWidth - COLLISION_MARGIN, y: resolvedY }, // 왼쪽
        { x: other.x + otherWidth + COLLISION_MARGIN, y: resolvedY },   // 오른쪽
        { x: resolvedX, y: other.y - draggedHeight - COLLISION_MARGIN }, // 위쪽
        { x: resolvedX, y: other.y + otherHeight + COLLISION_MARGIN }   // 아래쪽
      ];
      
      // 원래 위치에서 가장 가까운 옵션 선택
      let bestOption = moveOptions[0];
      let minDistance = Math.sqrt(Math.pow(bestOption.x - draggedComp.x, 2) + Math.pow(bestOption.y - draggedComp.y, 2));
      
      for (const option of moveOptions) {
        const distance = Math.sqrt(Math.pow(option.x - draggedComp.x, 2) + Math.pow(option.y - draggedComp.y, 2));
        if (distance < minDistance && option.x >= 0 && option.y >= 0) {
          minDistance = distance;
          bestOption = option;
        }
      }
      
      resolvedX = Math.max(0, bestOption.x);
      resolvedY = Math.max(0, bestOption.y);
    }
  }
  
  return { x: resolvedX, y: resolvedY };
}

// 컴포넌트 타입별 기본 크기와 최소 크기 정의
function getComponentDimensions(type) {
  const dimensions = {
    button: { defaultWidth: 120, defaultHeight: 48, minWidth: 80, minHeight: 32 },
    text: { defaultWidth: 200, defaultHeight: 30, minWidth: 50, minHeight: 20 },
    image: { defaultWidth: 200, defaultHeight: 150, minWidth: 50, minHeight: 50 },
    map: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 150 },
    link: { defaultWidth: 150, defaultHeight: 30, minWidth: 50, minHeight: 20 },
    attend: { defaultWidth: 300, defaultHeight: 200, minWidth: 200, minHeight: 150 },
    dday: { defaultWidth: 200, defaultHeight: 100, minWidth: 150, minHeight: 80 },
    weddingContact: { defaultWidth: 300, defaultHeight: 250, minWidth: 250, minHeight: 200 },
    gridGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    slideGallery: { defaultWidth: 400, defaultHeight: 300, minWidth: 200, minHeight: 200 },
    mapInfo: { defaultWidth: 300, defaultHeight: 200, minWidth: 200, minHeight: 150 },
    calendar: { defaultWidth: 350, defaultHeight: 400, minWidth: 250, minHeight: 300 },
    bankAccount: { defaultWidth: 300, defaultHeight: 180, minWidth: 250, minHeight: 150 },
    comment: { defaultWidth: 300, defaultHeight: 180, minWidth: 250, minHeight: 150 }
  };
  return dimensions[type] || { defaultWidth: 120, defaultHeight: 40, minWidth: 80, minHeight: 30 };
}

// 캔버스 내 드래그 가능한 컴포넌트
function CanvasComponent({ comp, selected, onSelect, onUpdate, onDelete, setSnapLines, zoom = 100, viewport = 'desktop', components = [] }) {
  const ref = useRef();

  // 더블클릭 시 텍스트 편집
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comp.props.text);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, corner: '' });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, compX: 0, compY: 0 });

  // 줌 레벨에 따른 그리드 크기 계산
  const scale = zoom / 100;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기

  const componentDimensions = getComponentDimensions(comp.type);
  const currentWidth = comp.width || componentDimensions.defaultWidth;
  const currentHeight = comp.height || componentDimensions.defaultHeight;

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
    if (editing) {
      return (
        <input
          ref={ref}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => { setEditing(false); onUpdate({ ...comp, props: { ...comp.props, text: editValue } }); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setEditing(false);
              onUpdate({ ...comp, props: { ...comp.props, text: editValue } });
            }
          }}
          style={{
            fontSize: comp.props.fontSize,
            width: '100%',
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit'
          }}
        />
      );
    }

    switch (comp.type) {
      case 'button':
        return <ButtonRenderer comp={comp} isEditor={true} />;
      case 'text':
        return <TextRenderer comp={comp} isEditor={true} />;
      case 'link':
        return <LinkRenderer comp={comp} isEditor={true} />;
      case 'attend':
        return <AttendRenderer comp={comp} isEditor={true} />;
      case 'map':
        return <MapView {...comp.props} />;
      case 'dday':
        return <DdayRenderer comp={comp} isEditor={true} />;
      case 'weddingContact':
        return <WeddingContactRenderer comp={comp} isEditor={true} />;
      case 'image':
        return <ImageRenderer comp={comp} isEditor={true} onUpdate={onUpdate} />;
      case 'gridGallery':
        return <GridGalleryRenderer comp={comp} isEditor={true} onUpdate={onUpdate} />;
      case 'slideGallery':
        return <SlideGalleryRenderer comp={comp} isEditor={true} onUpdate={onUpdate} />;
      case 'mapInfo':
        return <MapInfoRenderer comp={comp} isEditor={true} />;
      case 'calendar':
        return <CalendarRenderer comp={comp} isEditor={true} />;
      case 'bankAccount':
        return <BankAccountRenderer comp={comp} isEditor={true} />;
      case 'comment':
        return <CommentRenderer comp={comp} isEditor={true} />;
      default:
        return <span>{comp.props.text}</span>;
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
      width: comp.width || componentDimensions.defaultWidth,
      height: comp.height || componentDimensions.defaultHeight,
      corner: corner
    });
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
        newWidth = Math.max(componentDimensions.minWidth, Math.round((resizeStart.width + deltaX) / effectiveGridSize) * effectiveGridSize);
        newHeight = Math.max(componentDimensions.minHeight, Math.round((resizeStart.height + deltaY) / effectiveGridSize) * effectiveGridSize);
        break;
      case 'sw':
        newWidth = Math.max(componentDimensions.minWidth, Math.round((resizeStart.width - deltaX) / effectiveGridSize) * effectiveGridSize);
        newHeight = Math.max(componentDimensions.minHeight, Math.round((resizeStart.height + deltaY) / effectiveGridSize) * effectiveGridSize);
        break;
      case 'ne':
        newWidth = Math.max(componentDimensions.minWidth, Math.round((resizeStart.width + deltaX) / effectiveGridSize) * effectiveGridSize);
        newHeight = Math.max(componentDimensions.minHeight, Math.round((resizeStart.height - deltaY) / effectiveGridSize) * effectiveGridSize);
        break;
      case 'nw':
        newWidth = Math.max(componentDimensions.minWidth, Math.round((resizeStart.width - deltaX) / effectiveGridSize) * effectiveGridSize);
        newHeight = Math.max(componentDimensions.minHeight, Math.round((resizeStart.height - deltaY) / effectiveGridSize) * effectiveGridSize);
        break;
    }
    
    // 캔버스 경계 제한 (뷰포트에 따라 다르게 적용)
    const maxWidth = viewport === 'mobile' ? 375 - comp.x : 1920 - comp.x;
    const maxHeight = viewport === 'mobile' ? 667 - comp.y : 1080 - comp.y;
    
    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);
    
    onUpdate({
      ...comp,
      width: newWidth,
      height: newHeight
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    // 리사이즈가 끝나면 스냅라인 숨기기
    if (setSnapLines) {
      setSnapLines({ vertical: [], horizontal: [] });
    }
  };

  // 드래그 핸들러
  const handleDragStart = (e) => {
    if (isResizing) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      compX: comp.x,
      compY: comp.y
    });
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // 뷰포트에 따른 드래그 경계 제한
    const maxX = viewport === 'mobile' ? 375 - (comp.width || componentDimensions.defaultWidth) : 1920 - (comp.width || componentDimensions.defaultWidth);
    const maxY = viewport === 'mobile' ? 667 - (comp.height || componentDimensions.defaultHeight) : 1080 - (comp.height || componentDimensions.defaultHeight);
    
    // 기본 위치 계산 (그리드 스냅 적용)
    let newX = Math.round((dragStart.compX + deltaX) / effectiveGridSize) * effectiveGridSize;
    let newY = Math.round((dragStart.compY + deltaY) / effectiveGridSize) * effectiveGridSize;
    
    // 다른 컴포넌트들과 스냅라인 계산
    const tempComp = { ...comp, x: newX, y: newY };
    const otherComponents = components?.filter(c => c.id !== comp.id) || [];
    
    // 스냅라인 계산
    const snapResult = calculateSnapPosition(tempComp, otherComponents, effectiveGridSize, viewport);
    if (snapResult.snapped) {
      newX = snapResult.x;
      newY = snapResult.y;
      // console.log('컴포넌트 스냅됨:', { x: newX, y: newY });
    }
    
    // 충돌 방지 계산
    const collisionResult = resolveCollision({ ...comp, x: newX, y: newY }, otherComponents);
    newX = collisionResult.x;
    newY = collisionResult.y;
    
    // 경계 제한 적용
    newX = clamp(newX, 0, maxX);
    newY = clamp(newY, 0, maxY);
    
    // 스냅라인 업데이트 (드래그 중에 실시간으로)
    if (setSnapLines) {
      const lines = calculateSnapLines({ ...comp, x: newX, y: newY }, otherComponents, zoom, viewport);
      setSnapLines(lines);
    }
    
    onUpdate({
      ...comp,
      x: newX,
      y: newY
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
  }, [isDragging, dragStart]);

  return (
    <div
      ref={ref}
      className={getResponsiveClasses(comp.type)}
      style={{
        position: 'absolute',
        left: comp.x,
        top: comp.y,
        width: comp.width || componentDimensions.defaultWidth,
        height: comp.height || componentDimensions.defaultHeight,
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
      {/* 삭제 버튼 (선택 시만) */}
      {selected && (
        <>
          {/* 모서리 리사이즈 핸들 - 실제 컴포넌트 크기에 맞게 배치 */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: currentWidth - 4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div
            style={{
              position: 'absolute',
              top: currentHeight - 4,
              left: -4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div
            style={{
              position: 'absolute',
              top: currentHeight - 4,
              left: currentWidth - 4,
              width: 8,
              height: 8,
              background: '#3B4EFF',
              border: '2px solid #fff',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 11
            }}
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* 삭제 버튼 - 실제 컴포넌트 크기에 맞게 배치 */}
          <button
            onClick={e => { e.stopPropagation(); onDelete(comp.id); }}
            style={{
              position: 'absolute', 
              top: -20, 
              left: currentWidth + 4,
              background: '#FF3B3B', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '50%',
              width: 24, 
              height: 24, 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255, 59, 59, 0.3)',
              transition: 'all 0.2s',
              zIndex: 12
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

// 사용자 커서 표시
function UserCursor({ x, y, color, nickname }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x, top: y,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        background: color, border: '2px solid #fff', boxShadow: '0 1px 4px #0002'
      }} />
      <div style={{
        marginTop: 2, fontSize: 12, color: color, fontWeight: 'bold',
        background: '#fff', borderRadius: 4, padding: '2px 6px', boxShadow: '0 1px 4px #0001'
      }}>{nickname}</div>
    </div>
  );
}

// 스냅 위치 계산 함수 (실제 스냅 기능 - 중앙선, 정렬, 그리드 스냅)
function calculateSnapPosition(draggedComp, otherComponents, gridSize = 50, viewport = 'desktop') {
  const SNAP_THRESHOLD = 12;
  let snappedX = draggedComp.x;
  let snappedY = draggedComp.y;
  let snapped = false;

  const draggedDimensions = getComponentDimensions(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;

  // 드래그된 컴포넌트의 주요 위치들
  const draggedLeft = draggedComp.x;
  const draggedRight = draggedComp.x + draggedWidth;
  const draggedTop = draggedComp.y;
  const draggedBottom = draggedComp.y + draggedHeight;
  const draggedCenterX = draggedComp.x + draggedWidth / 2;
  const draggedCenterY = draggedComp.y + draggedHeight / 2;

  // 캔버스 크기 (뷰포트에 따라)
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // 1. 중앙선 스냅 (최우선)
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snappedX = canvasCenterX - draggedWidth / 2;
    snapped = true;
  }
  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snappedY = canvasCenterY - draggedHeight / 2;
    snapped = true;
  }

  // 2. 다른 컴포넌트들과의 정렬 스냅 체크
  if (!snapped) {
    for (const other of otherComponents) {
      const otherDimensions = getComponentDimensions(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;

      const otherLeft = other.x;
      const otherRight = other.x + otherWidth;
      const otherTop = other.y;
      const otherBottom = other.y + otherHeight;
      const otherCenterX = other.x + otherWidth / 2;
      const otherCenterY = other.y + otherHeight / 2;

      // X축 정렬 스냅 체크
      if (Math.abs(draggedLeft - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft;
        snapped = true;
      } else if (Math.abs(draggedRight - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight - draggedWidth;
        snapped = true;
      } else if (Math.abs(draggedCenterX - otherCenterX) < SNAP_THRESHOLD) {
        snappedX = otherCenterX - draggedWidth / 2;
        snapped = true;
      } else if (Math.abs(draggedLeft - otherRight) < SNAP_THRESHOLD) {
        snappedX = otherRight;
        snapped = true;
      } else if (Math.abs(draggedRight - otherLeft) < SNAP_THRESHOLD) {
        snappedX = otherLeft - draggedWidth;
        snapped = true;
      }

      // Y축 정렬 스냅 체크
      if (Math.abs(draggedTop - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop;
        snapped = true;
      } else if (Math.abs(draggedBottom - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom - draggedHeight;
        snapped = true;
      } else if (Math.abs(draggedCenterY - otherCenterY) < SNAP_THRESHOLD) {
        snappedY = otherCenterY - draggedHeight / 2;
        snapped = true;
      } else if (Math.abs(draggedTop - otherBottom) < SNAP_THRESHOLD) {
        snappedY = otherBottom;
        snapped = true;
      } else if (Math.abs(draggedBottom - otherTop) < SNAP_THRESHOLD) {
        snappedY = otherTop - draggedHeight;
        snapped = true;
      }
    }
  }

  // 3. 그리드 스냅 (우선순위가 낮음)
  if (!snapped) {
    const gridX = Math.round(draggedComp.x / gridSize) * gridSize;
    const gridY = Math.round(draggedComp.y / gridSize) * gridSize;
    
    if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD / 2) {
      snappedX = gridX;
      snapped = true;
    }
    if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD / 2) {
      snappedY = gridY;
      snapped = true;
    }
  }

  return {
    x: snappedX,
    y: snappedY,
    snapped
  };
}

// 스냅라인 계산 함수 (정렬, 간격, 그리드, 중앙선 스냅 모두 지원)
function calculateSnapLines(draggedComp, allComponents, zoom = 100, viewport = 'desktop') {
  const SNAP_THRESHOLD = 8;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기
  const snapLines = { vertical: [], horizontal: [] };
  if (!draggedComp) return snapLines;

  // 캔버스 크기 (뷰포트에 따라)
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;

  // 1. 중앙선 스냅 (Canvas Center)
  const draggedDimensions = getComponentDimensions(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const compCenterX = draggedComp.x + draggedWidth / 2;
  const compCenterY = draggedComp.y + draggedHeight / 2;
  
  // 수직 중앙선 (캔버스 중앙)
  if (Math.abs(compCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: canvasCenterX, type: 'center' });
  }
  
  // 수평 중앙선 (캔버스 중앙)
  if (Math.abs(compCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: canvasCenterY, type: 'center' });
  }

  // 2. 정렬 스냅 (Alignment)
  allComponents.forEach(other => {
    if (other.id === draggedComp.id) return;
    const otherDimensions = getComponentDimensions(other.type);
    const otherX = [other.x, other.x + (other.width || otherDimensions.defaultWidth) / 2, other.x + (other.width || otherDimensions.defaultWidth)];
    const dragX = [draggedComp.x, draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth) / 2, draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth)];
    otherX.forEach(ox => {
      dragX.forEach(dx => {
        if (Math.abs(ox - dx) < SNAP_THRESHOLD) {
          snapLines.vertical.push({ x: ox, type: 'align' });
        }
      });
    });
    const otherY = [other.y, other.y + (other.height || otherDimensions.defaultHeight) / 2, other.y + (other.height || otherDimensions.defaultHeight)];
    const dragY = [draggedComp.y, draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight) / 2, draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight)];
    otherY.forEach(oy => {
      dragY.forEach(dy => {
        if (Math.abs(oy - dy) < SNAP_THRESHOLD) {
          snapLines.horizontal.push({ y: oy, type: 'align' });
        }
      });
    });
  });

  // 3. 간격 스냅 (Spacing)
  allComponents.forEach(a => {
    allComponents.forEach(b => {
      if (a.id === b.id || a.id === draggedComp.id || b.id === draggedComp.id) return;
      const spacingX = Math.abs(a.x - b.x);
      const spacingY = Math.abs(a.y - b.y);
      if (Math.abs(Math.abs(draggedComp.x - a.x) - spacingX) < SNAP_THRESHOLD && spacingX > 0) {
        snapLines.vertical.push({ x: draggedComp.x, type: 'spacing', spacing: spacingX });
      }
      if (Math.abs(Math.abs(draggedComp.y - a.y) - spacingY) < SNAP_THRESHOLD && spacingY > 0) {
        snapLines.horizontal.push({ y: draggedComp.y, type: 'spacing', spacing: spacingY });
      }
    });
  });

  // 4. 그리드 스냅 (Grid) - 줌 레벨 고려
  const gridX = Math.round(draggedComp.x / effectiveGridSize) * effectiveGridSize;
  const gridY = Math.round(draggedComp.y / effectiveGridSize) * effectiveGridSize;
  if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: gridX, type: 'grid' });
  }
  if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: gridY, type: 'grid' });
  }

  return snapLines;
}

function NoCodeEditor() {
  const { roomId } = useParams();
  const location = useLocation();

  // Yjs 문서 및 provider
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState(null);

  // Yjs 상태
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [inspector, setInspector] = useState({});
  const [users, setUsers] = useState({});
  const [myCursor, setMyCursor] = useState({ x: 0, y: 0 });

  // 스냅라인 상태
  const [snapLines, setSnapLines] = useState({ vertical: [], horizontal: [] });

  // 줌 상태
  const [zoom, setZoom] = useState(100);

  // 미리보기 모달 상태
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 사용자 정보
  const [nickname] = useState(randomNickname());
  const [color] = useState(randomColor());

  // 캔버스 ref
  const canvasRef = useRef();
  const containerRef = useRef();

  // 전역 상태 관리
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'mobile' - 뷰포트 모드 관리

  // Yjs 초기화 및 실시간 동기화
  useEffect(() => {
    // y-websocket 서버 주소 (테스트용: public yjs 서버)
    const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', roomId, ydoc);

    // 컴포넌트 리스트 동기화
    const yComponents = ydoc.getArray('components');
    const updateComponents = () => {
      const currentComponents = yComponents.toArray();
      console.log('YJS 컴포넌트 업데이트:', currentComponents.length, '개');
      setComponents(currentComponents);
    };
    yComponents.observeDeep(updateComponents);
    updateComponents();

    // 선택/속성 동기화
    const yInspector = ydoc.getMap('inspector');
    const updateInspector = () => setInspector({ ...yInspector.toJSON() });
    yInspector.observeDeep(updateInspector);
    updateInspector();

    // 커서/유저 동기화 (비활성화)
    // wsProvider.awareness.setLocalStateField('user', { nickname, color });
    // wsProvider.awareness.setLocalStateField('cursor', myCursor);
    // const onAwarenessChange = () => {
    //   const states = Array.from(wsProvider.awareness.getStates().values());
    //   const userMap = {};
    //   states.forEach(state => {
    //     if (state.user && state.cursor) {
    //       userMap[state.user.nickname] = { ...state.user, ...state.cursor };
    //     }
    //   });
    //   setUsers(userMap);
    // };
    // wsProvider.awareness.on('change', onAwarenessChange);
    // setProvider(wsProvider);

    return () => {
      yComponents.unobserveDeep(updateComponents);
      yInspector.unobserveDeep(updateInspector);
      // wsProvider.awareness.off('change', onAwarenessChange);
      // wsProvider.destroy();
      ydoc.destroy();
    };
    // eslint-disable-next-line
  }, [roomId]);

  // 커서 위치 실시간 전송
  useEffect(() => {
    if (provider) {
      provider.awareness.setLocalStateField('cursor', myCursor);
    }
  }, [myCursor, provider]);

  // 컴포넌트 선택 시 해당 컴포넌트가 보이도록 스크롤 이동
  useEffect(() => {
    if (!selectedId || !canvasRef.current || !containerRef.current) return;
    const comp = components.find(c => c.id === selectedId);
    if (!comp) return;
    const compRect = {
      left: comp.x,
      top: comp.y,
      right: comp.x + (comp.width || 120),
      bottom: comp.y + (comp.height || 40)
    };
    const container = containerRef.current;
    // 스크롤 이동 (컴포넌트가 중앙에 오도록)
    container.scrollTo({
      left: Math.max(0, compRect.left - container.clientWidth / 2 + ((comp.width || getComponentDimensions(comp.type).defaultWidth) / 2)),
      top: Math.max(0, compRect.top - container.clientHeight / 2 + ((comp.height || getComponentDimensions(comp.type).defaultHeight) / 2)),
      behavior: 'smooth'
    });
  }, [selectedId, components]);

  // 템플릿에서 컴포넌트 추가 (프로그래밍 방식)
  const addComponentFromTemplate = (componentData) => {
    const yComponents = ydoc.getArray('components');
    yComponents.push([componentData]);
  };

  // URL 파라미터 또는 React Router state에서 템플릿 데이터 확인
  useEffect(() => {
    // 1. React Router state에서 템플릿 데이터 확인
    const templateComponents = location.state?.templateComponents;
    if (templateComponents) {
      console.log('React Router state에서 템플릿 데이터 발견:', templateComponents);
      if (Array.isArray(templateComponents)) {
        const yComponents = ydoc.getArray('components');
        // 중복 방지: 기존 컴포넌트가 있으면 추가하지 않음
        if (yComponents.length === 0) {
          templateComponents.forEach(comp => {
            console.log('템플릿에서 컴포넌트 추가:', comp);
            yComponents.push([comp]);
          });
        } else {
          console.log('이미 컴포넌트가 있어서 템플릿 로딩 스킵');
        }
      }
      return;
    }
    
    // 2. URL 파라미터에서 템플릿 데이터 확인 (기존 방식)
    const urlParams = new URLSearchParams(window.location.search);
    const templateData = urlParams.get('template');
    if (templateData) {
      console.log('템플릿 데이터 발견:', templateData);
      try {
        const parsedData = JSON.parse(decodeURIComponent(templateData));
        console.log('파싱된 템플릿 데이터:', parsedData);
        // API 응답 형식 처리: {content: [...]} 또는 직접 배열
        const componentsData = parsedData.content || parsedData;
        console.log('컴포넌트 데이터:', componentsData);
        if (Array.isArray(componentsData)) {
          const yComponents = ydoc.getArray('components');
          componentsData.forEach(comp => {
            console.log('템플릿에서 컴포넌트 추가:', comp);
            yComponents.push([comp]);
          });
        }
      } catch (error) {
        console.error('템플릿 데이터 파싱 오류:', error);
      }
    }
  }, [ydoc, location.state]);

  // 캔버스에서 드래그 앤 드롭으로 컴포넌트 추가
  const handleDrop = e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType');
    if (type) {
      const compDef = ComponentDefinitions.find(def => def.type === type);
      if (compDef) {
        // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
        const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기
        
        const dimensions = getComponentDimensions(type);
        const width = dimensions.defaultWidth;
        const height = dimensions.defaultHeight;
        
        const snappedX = Math.round(e.nativeEvent.offsetX / effectiveGridSize) * effectiveGridSize;
        const snappedY = Math.round(e.nativeEvent.offsetY / effectiveGridSize) * effectiveGridSize;
        
        // 뷰포트에 따른 경계 제한
        const maxX = viewport === 'mobile' ? 375 - width : 1920 - width;
        const maxY = viewport === 'mobile' ? 667 - height : 1080 - height;
        
        let clampedX = clamp(snappedX, 0, maxX);
        let clampedY = clamp(snappedY, 0, maxY);
        
        // 새 컴포넌트의 임시 객체 생성
        const newComponent = {
          id: Math.random().toString(36).slice(2, 10),
          type,
          x: clampedX,
          y: clampedY,
          width,
          height,
          props: { ...compDef.defaultProps }
        };
        
        // 충돌 방지 적용
        const collisionResult = resolveCollision(newComponent, components);
        clampedX = collisionResult.x;
        clampedY = collisionResult.y;
        
        // 최종 경계 제한 재적용
        clampedX = clamp(clampedX, 0, maxX);
        clampedY = clamp(clampedY, 0, maxY);
        
        const yComponents = ydoc.getArray('components');
        yComponents.push([{
          ...newComponent,
          x: clampedX,
          y: clampedY
        }]);
      }
    }
  };

  // 캔버스에서 마우스 이동 시 커서 위치 전송
  const handleMouseMove = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    setMyCursor({
      x: e.clientX - rect.left + canvasRef.current.scrollLeft,
      y: e.clientY - rect.top + canvasRef.current.scrollTop
    });
  };

  // 컴포넌트 선택
  const handleSelect = id => {
    setSelectedId(id);
    ydoc.getMap('inspector').set('selectedId', id);
  };

  // 속성 변경
  const handleUpdate = comp => {
    const yComponents = ydoc.getArray('components');
    const idx = yComponents.toArray().findIndex(c => c.id === comp.id);
    if (idx !== -1) {
      yComponents.delete(idx, 1);
      yComponents.insert(idx, [comp]);
      
      // 스냅라인 계산 (줌 레벨 고려)
      const lines = calculateSnapLines(comp, components, zoom);
      setSnapLines(lines);
    }
  };

  // 컴포넌트 삭제
  const handleDelete = id => {
    const yComponents = ydoc.getArray('components');
    const idx = yComponents.toArray().findIndex(c => c.id === id);
    if (idx !== -1) yComponents.delete(idx, 1);
    if (selectedId === id) setSelectedId(null);
  };

  // Delete 키로 삭제
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line
  }, [selectedId, components]);

  // 속성 인스펙터
  const selectedComp = components.find(c => c.id === selectedId);

  // 브라우저 전체 확대/축소(Ctrl+스크롤, Ctrl+키, 트랙패드 pinch) 완벽 차단
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });
    document.body.addEventListener('wheel', preventWheelZoom, { passive: false });

    const preventKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', preventKeyZoom);
    document.addEventListener('keydown', preventKeyZoom);
    document.body.addEventListener('keydown', preventKeyZoom);

    const preventGesture = (e) => {
      e.preventDefault();
    };
    window.addEventListener('gesturestart', preventGesture);
    window.addEventListener('gesturechange', preventGesture);
    window.addEventListener('gestureend', preventGesture);

    return () => {
      window.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.removeEventListener('wheel', preventWheelZoom, { passive: false });
      document.body.removeEventListener('wheel', preventWheelZoom, { passive: false });

      window.removeEventListener('keydown', preventKeyZoom);
      document.removeEventListener('keydown', preventKeyZoom);
      document.body.removeEventListener('keydown', preventKeyZoom);

      window.removeEventListener('gesturestart', preventGesture);
      window.removeEventListener('gesturechange', preventGesture);
      window.removeEventListener('gestureend', preventGesture);
    };
  }, []);

  // 줌 상태 변경 핸들러
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // 뷰포트 전환 핸들러
  const handleViewportChange = useCallback((newViewport) => {
    setViewport(newViewport);
    // 뷰포트 변경 시 선택된 컴포넌트 해제 (UX 향상)
    setSelectedId(null);
  }, []);

  // 섹션 추가 핸들러
  const handleAddSection = (newSectionY) => {
    const yComponents = ydoc.getArray('components');
    const canvasWidth = viewport === 'mobile' ? 375 : 1920;
    
    // 캔버스 확장용 더미 컴포넌트 추가
    const extenderComponent = {
      id: `canvas-extender-${Date.now()}`,
      type: 'canvas-extender',
      x: 0,
      y: newSectionY,
      width: canvasWidth,
      height: 200,
      props: { invisible: true }
    };
    
    yComponents.push([extenderComponent]);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex',
      background: '#fff', color: '#222', fontFamily: 'Inter, sans-serif'
    }}>
      {/* 에디터 헤더 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 240, // ComponentLibrary 너비만큼 오프셋
        right: selectedComp ? 340 : 0, // Inspector 너비만큼 오프셋
        height: 60,
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid #e1e5e9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* 좌측: 로고와 컴포넌트 개수 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#1d2129'
          }}>
            페이지레고
          </h1>
          <div style={{
            padding: '4px 8px',
            background: '#e3f2fd',
            color: '#1976d2',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500
          }}>
            {components.length}개 컴포넌트
          </div>
        </div>

        {/* 중앙: 뷰포트 컨트롤러 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flex: 1,
          maxWidth: selectedComp ? '300px' : '400px', // Inspector 열림 상태에 따라 조정
          transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <ViewportController
            currentViewport={viewport}
            onViewportChange={handleViewportChange}
          />
        </div>

        {/* 우측: 미리보기 버튼과 기타 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          minWidth: selectedComp ? '120px' : '200px', // Inspector 열림 상태에 따라 조정
          justifyContent: 'flex-end'
        }}>
          {/* 미리보기 버튼 */}
          <button
            onClick={() => setIsPreviewOpen(true)}
            style={{
              padding: selectedComp ? '6px 12px' : '8px 16px', // Inspector 열림시 작게
              background: '#3B4EFF',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: selectedComp ? 12 : 14, // Inspector 열림시 작게
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: selectedComp ? 4 : 8, // Inspector 열림시 작게
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 78, 255, 0.2)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#2c39d4';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 16px rgba(59, 78, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#3B4EFF';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 78, 255, 0.2)';
            }}
          >
            <span>🔍</span>
            {!selectedComp && <span>미리보기</span>} {/* Inspector 열림시 텍스트 숨김 */}
          </button>

          {/* Room ID 표시 (Inspector 열림시 숨김) */}
          {!selectedComp && (
            <div style={{
              padding: '4px 8px',
              background: '#f0f2f5',
              borderRadius: 4,
              fontSize: 12,
              color: '#65676b'
            }}>
              Room: {roomId}
            </div>
          )}
        </div>
      </div>

      {/* 좌측: 컴포넌트 라이브러리 */}
      <ComponentLibrary 
        onDragStart={(e, type) => {
          e.dataTransfer.setData('componentType', type);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        components={components}
        roomId={roomId}
      />

      {/* 중앙: 캔버스 */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        minHeight: 0, 
        display: 'flex',
        paddingTop: 60 // 헤더 높이만큼 패딩
      }}>
        <CanvasArea
          containerRef={containerRef}
          canvasRef={canvasRef}
          components={components}
          selectedId={selectedId}
          users={users}
          nickname={nickname}
          snapLines={snapLines}
          setSnapLines={setSnapLines}
          onDrop={e => { handleDrop(e); }}
          onDragOver={e => e.preventDefault()}
          onClick={() => handleSelect(null)}
          onMouseMove={handleMouseMove}
          onMouseUp={() => {}}
          onSelect={handleSelect}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onAddSection={handleAddSection}
          CanvasComponent={CanvasComponent}
          UserCursor={UserCursor}
          zoom={zoom}
          onZoomChange={handleZoomChange}
          viewport={viewport}
          isInspectorOpen={!!selectedComp} // Inspector 열림 상태 전달
        />
      </div>

      {/* 우측: 속성 인스펙터 */}
      {selectedComp && (
        <Inspector
          selectedComp={selectedComp}
          onUpdate={handleUpdate}
          color={color}
          nickname={nickname}
          roomId={roomId}
        />
      )}

      {/* 미리보기 모달 */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pageContent={components}
      />

      {/* 스타일 태그로 high-contrast, readable 스타일 보장 */}
      <style>{`
        body { margin: 0; }
        input, button { outline: none; }
        ::selection { background: #3B4EFF22; }
      `}</style>
    </div>
  );
}
export default NoCodeEditor;