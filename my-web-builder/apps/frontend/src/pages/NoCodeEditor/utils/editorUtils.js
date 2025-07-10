import { API_BASE_URL } from '../../../config';

// 컴포넌트 타입별 기본 크기와 최소 크기 정의
export function getComponentDimensions(type) {
  const dimensions = {
    button: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    text: { defaultWidth: 200, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    image: { defaultWidth: 200, defaultHeight: 150, minWidth: 100, minHeight: 100 },
    map: { defaultWidth: 350, defaultHeight: 240, minWidth: 200, minHeight: 150 },
    link: { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 },
    attend: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    dday: { defaultWidth: 340, defaultHeight: 150, minWidth: 150, minHeight: 100 },
    weddingContact: { defaultWidth: 300, defaultHeight: 250, minWidth: 250, minHeight: 200 },
    weddingInvite: { defaultWidth: 350, defaultHeight: 400, minWidth: 300, minHeight: 250 },
    gridGallery: { defaultWidth: 350, defaultHeight: 250, minWidth: 200, minHeight: 200 },
    slideGallery: { defaultWidth: 350, defaultHeight: 250, minWidth: 200, minHeight:200 },
    mapInfo: { defaultWidth: 300, defaultHeight: 250, minWidth: 250, minHeight: 150 },
    calendar: { defaultWidth: 350, defaultHeight: 400, minWidth: 300, minHeight: 350 },
    bankAccount: { defaultWidth: 300, defaultHeight: 200, minWidth: 250, minHeight: 150 },
    comment: { defaultWidth: 350, defaultHeight: 400, minWidth: 250, minHeight: 150 },
    musicPlayer: { defaultWidth: 50, defaultHeight: 50, minWidth: 50, minHeight: 50 },
    kakaotalkShare: { defaultWidth: 150, defaultHeight: 50, minWidth: 50, minHeight: 50 },
    slido: { defaultWidth: 350, defaultHeight: 250, minWidth: 300, minHeight: 200 },
  };
  return dimensions[type] || { defaultWidth: 150, defaultHeight: 50, minWidth: 100, minHeight: 50 };
}

// 컴포넌트를 행으로 그룹핑 (수직 겹침 기준, x 좌표 정렬 안함)
export function groupComponentsIntoRows(components) {
  if (!components || components.length === 0) return [];

  const sortedComponents = [...components].sort((a, b) => (a.y || 0) - (b.y || 0));
  const rows = [];
  
  for (const component of sortedComponents) {
    const compTop = component.y || 0;
    const compBottom = compTop + (component.height || 50);
    
    let targetRow = null;
    
    for (const row of rows) {
      const hasOverlap = row.some(existingComp => {
        const existingTop = existingComp.y || 0;
        const existingBottom = existingTop + (existingComp.height || 50);
        return Math.max(compTop, existingTop) < Math.min(compBottom, existingBottom);
      });
      
      if (hasOverlap) {
        targetRow = row;
        break;
      }
    }
    
    if (targetRow) {
      targetRow.push(component);
    } else {
      rows.push([component]);
    }
  }
  
  return rows;
}

// Page 컴포넌트를 위한 새 페이지 생성
export async function createPageForComponent(pageName = '새 페이지') {
  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/users/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: pageName,
        subdomain: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }),
    });

    return response.ok ? await response.json() : null;
  } catch (err) {
    console.error('새 페이지 생성 오류:', err);
    return null;
  }
}

// 랜덤 닉네임/색상 생성
export function randomNickname() {
  const animals = ['Tiger', 'Bear', 'Fox', 'Wolf', 'Cat', 'Dog', 'Lion', 'Panda', 'Rabbit', 'Eagle'];
  return animals[Math.floor(Math.random() * animals.length)] + Math.floor(Math.random() * 100);
}

export function randomColor() {
  const colors = ['#3B4EFF', '#FF3B3B', '#00B894', '#FDCB6E', '#6C5CE7', '#00B8D9', '#FF7675', '#636E72'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 뷰포트 설정
export const VIEWPORT_CONFIGS = {
  mobile: { width: '375px', height: '667px', scale: 1 },
  desktop: { width: '100%', height: '100%', scale: 1 },
};

// 그리드 크기
export const GRID_SIZE = 50;

// clamp 함수
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 충돌 감지
export function checkCollision(comp1, comp2, getComponentDimensionsFn = getComponentDimensions) {
  const comp1Dimensions = getComponentDimensionsFn(comp1.type);
  const comp2Dimensions = getComponentDimensionsFn(comp2.type);
  const comp1Width = comp1.width || comp1Dimensions.defaultWidth;
  const comp1Height = comp1.height || comp1Dimensions.defaultHeight;
  const comp2Width = comp2.width || comp2Dimensions.defaultWidth;
  const comp2Height = comp2.height || comp2Dimensions.defaultHeight;
  return !(
    comp1.x + comp1Width <= comp2.x ||
    comp2.x + comp2Width <= comp1.x ||
    comp1.y + comp1Height <= comp2.y ||
    comp2.y + comp2Height <= comp1.y
  );
}

// 충돌 방지
export function resolveCollision(draggedComp, otherComponents, getComponentDimensionsFn = getComponentDimensions) {
  const COLLISION_MARGIN = 10;
  let resolvedX = draggedComp.x;
  let resolvedY = draggedComp.y;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;
    const tempComp = { ...draggedComp, x: resolvedX, y: resolvedY };
    if (checkCollision(tempComp, other, getComponentDimensionsFn)) {
      const otherDimensions = getComponentDimensionsFn(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;
      const moveOptions = [
        { x: other.x - draggedWidth - COLLISION_MARGIN, y: resolvedY },
        { x: other.x + otherWidth + COLLISION_MARGIN, y: resolvedY },
        { x: resolvedX, y: other.y - draggedHeight - COLLISION_MARGIN },
        { x: resolvedX, y: other.y + otherHeight + COLLISION_MARGIN },
      ];
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

// 스냅 위치 계산
export function calculateSnapPosition(draggedComp, otherComponents, gridSize = 50, viewport = 'desktop', getComponentDimensionsFn = getComponentDimensions) {
  const SNAP_THRESHOLD = 12;
  let snappedX = draggedComp.x;
  let snappedY = draggedComp.y;
  let snapped = false;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const draggedCenterX = draggedComp.x + draggedWidth / 2;
  const draggedCenterY = draggedComp.y + draggedHeight / 2;
  
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snappedX = canvasCenterX - draggedWidth / 2;
    snapped = true;
  }
  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snappedY = canvasCenterY - draggedHeight / 2;
    snapped = true;
  }
  
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
  
  return { x: snappedX, y: snappedY, snapped };
}

// 스냅라인 계산
export function calculateSnapLines(draggedComp, allComponents, zoom = 100, viewport = 'desktop', getComponentDimensionsFn = getComponentDimensions) {
  const SNAP_THRESHOLD = 8;
  const snapLines = { vertical: [], horizontal: [] };
  if (!draggedComp) return snapLines;
  
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;
  const compCenterX = draggedComp.x + draggedWidth / 2;
  const compCenterY = draggedComp.y + draggedHeight / 2;
  
  if (Math.abs(compCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: canvasCenterX, type: 'center' });
  }
  if (Math.abs(compCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: canvasCenterY, type: 'center' });
  }
  
  const gridX = Math.round(draggedComp.x / GRID_SIZE) * GRID_SIZE;
  const gridY = Math.round(draggedComp.y / GRID_SIZE) * GRID_SIZE;
  if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: gridX, type: 'grid' });
  }
  if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: gridY, type: 'grid' });
  }
  
  return snapLines;
}

// 최종 스타일 반환
export function getFinalStyles(component, forcedViewport = null) {
  const { style = {}, mobileStyle = {} } = component;
  if (forcedViewport) {
    return forcedViewport === 'mobile' ? { ...style, ...mobileStyle } : style;
  }
  const isMobileView = window.innerWidth <= 768;
  return isMobileView ? { ...style, ...mobileStyle } : style;
}