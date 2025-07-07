// 그리드 크기 상수
export const GRID_SIZE = 50;

// 뷰포트 설정
export const VIEWPORT_CONFIGS = {
  desktop: {
    width: 1920,
    height: 1080,
    name: '데스크톱',
    label: '데스크톱',
    description: '1920px 너비',
    icon: '🖥️',
  },
  tablet: {
    width: 768,
    height: 1024,
    name: '태블릿',
    label: '태블릿',
    description: '768px 너비',
    icon: '📱',
  },
  mobile: {
    width: 375,
    height: 667,
    name: '모바일',
    label: '모바일',
    description: '375px 너비',
    icon: '📱',
  },
};

// API 설정
import { API_BASE_URL } from '../../../config';

// clamp 함수
export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// 랜덤 닉네임/색상 생성
export function randomNickname() {
  const animals = [
    'Tiger',
    'Bear',
    'Fox',
    'Wolf',
    'Cat',
    'Dog',
    'Lion',
    'Panda',
    'Rabbit',
    'Eagle',
  ];
  return (
    animals[Math.floor(Math.random() * animals.length)] +
    Math.floor(Math.random() * 100)
  );
}

export function randomColor() {
  const colors = [
    '#3B4EFF',
    '#FF3B3B',
    '#00B894',
    '#FDCB6E',
    '#6C5CE7',
    '#00B8D9',
    '#FF7675',
    '#636E72',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Page 컴포넌트를 위한 새 페이지 생성 함수
export async function createPageForComponent(pageName = '새 페이지') {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/users/pages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: pageName,
        subdomain: `page-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      }),
    });

    if (response.ok) {
      const newPage = await response.json();
      console.log('Page 컴포넌트용 새 페이지 생성 완료:', newPage);
      return newPage;
    } else {
      console.error('새 페이지 생성 실패:', response.status);
      return null;
    }
  } catch (err) {
    console.error('새 페이지 생성 오류:', err);
    return null;
  }
}

// 컴포넌트 타입별 기본 크기와 최소 크기 정의 (50px 그리드에 맞춤)
export function getComponentDimensions(type) {
  const dimensions = {
    button: {
      defaultWidth: 150,
      defaultHeight: 50,
      minWidth: 100,
      minHeight: 50,
    },
    text: {
      defaultWidth: 200,
      defaultHeight: 50,
      minWidth: 100,
      minHeight: 50,
    },
    image: {
      defaultWidth: 200,
      defaultHeight: 150,
      minWidth: 100,
      minHeight: 100,
    },
    map: {
      defaultWidth: 400,
      defaultHeight: 300,
      minWidth: 200,
      minHeight: 150,
    },
    link: {
      defaultWidth: 150,
      defaultHeight: 50,
      minWidth: 100,
      minHeight: 50,
    },
    attend: {
      defaultWidth: 300,
      defaultHeight: 200,
      minWidth: 250,
      minHeight: 150,
    },
    dday: {
      defaultWidth: 200,
      defaultHeight: 100,
      minWidth: 150,
      minHeight: 100,
    },
    weddingContact: {
      defaultWidth: 300,
      defaultHeight: 250,
      minWidth: 250,
      minHeight: 200,
    },
    weddingInvite: {
      defaultWidth: 450,
      defaultHeight: 400,
      minWidth: 300,
      minHeight: 250,
    },
    gridGallery: {
      defaultWidth: 400,
      defaultHeight: 300,
      minWidth: 200,
      minHeight: 200,
    },
    slideGallery: {
      defaultWidth: 400,
      defaultHeight: 300,
      minWidth: 200,
      minHeight: 200,
    },
    mapInfo: {
      defaultWidth: 300,
      defaultHeight: 200,
      minWidth: 250,
      minHeight: 150,
    },
    calendar: {
      defaultWidth: 350,
      defaultHeight: 400,
      minWidth: 300,
      minHeight: 350,
    },
    bankAccount: {
      defaultWidth: 300,
      defaultHeight: 200,
      minWidth: 250,
      minHeight: 150,
    },
    comment: {
      defaultWidth: 300,
      defaultHeight: 200,
      minWidth: 250,
      minHeight: 150,
    },
    musicPlayer: {
      defaultWidth: 150,
      defaultHeight: 150,
      minWidth: 100,
      minHeight: 100,
    },
    kakaotalkShare: {
      defaultWidth: 180,
      defaultHeight: 60,
      minWidth: 120,
      minHeight: 40,
    },
    page: {
      defaultWidth: 300,
      defaultHeight: 150,
      minWidth: 250,
      minHeight: 120,
    },

  };
  return (
    dimensions[type] || {
      defaultWidth: 150,
      defaultHeight: 50,
      minWidth: 100,
      minHeight: 50,
    }
  );
}

// 충돌 감지 함수
export function checkCollision(
  comp1,
  comp2,
  getComponentDimensionsFn = getComponentDimensions
) {
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

// 충돌 방지 위치 계산 함수
export function resolveCollision(
  draggedComp,
  otherComponents,
  getComponentDimensionsFn = getComponentDimensions
) {
  const COLLISION_MARGIN = 10; // 컴포넌트 간 최소 간격
  let resolvedX = draggedComp.x;
  let resolvedY = draggedComp.y;

  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;

  // 각 컴포넌트와의 충돌 검사 및 해결
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;

    const tempComp = { ...draggedComp, x: resolvedX, y: resolvedY };
    if (checkCollision(tempComp, other, getComponentDimensionsFn)) {
      const otherDimensions = getComponentDimensionsFn(other.type);
      const otherWidth = other.width || otherDimensions.defaultWidth;
      const otherHeight = other.height || otherDimensions.defaultHeight;

      // 4방향 중 가장 가까운 위치로 이동
      const moveOptions = [
        { x: other.x - draggedWidth - COLLISION_MARGIN, y: resolvedY }, // 왼쪽
        { x: other.x + otherWidth + COLLISION_MARGIN, y: resolvedY }, // 오른쪽
        { x: resolvedX, y: other.y - draggedHeight - COLLISION_MARGIN }, // 위쪽
        { x: resolvedX, y: other.y + otherHeight + COLLISION_MARGIN }, // 아래쪽
      ];

      // 원래 위치에서 가장 가까운 옵션 선택
      let bestOption = moveOptions[0];
      let minDistance = Math.sqrt(
        Math.pow(bestOption.x - draggedComp.x, 2) +
          Math.pow(bestOption.y - draggedComp.y, 2)
      );

      for (const option of moveOptions) {
        const distance = Math.sqrt(
          Math.pow(option.x - draggedComp.x, 2) +
            Math.pow(option.y - draggedComp.y, 2)
        );
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

// 스냅 위치 계산 함수 (실제 스냅 기능 - 중앙선, 정렬, 그리드 스냅)
export function calculateSnapPosition(
  draggedComp,
  otherComponents,
  gridSize = 50,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  const SNAP_THRESHOLD = 12;
  let snappedX = draggedComp.x;
  let snappedY = draggedComp.y;
  let snapped = false;

  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
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
      const otherDimensions = getComponentDimensionsFn(other.type);
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
    snapped,
  };
}

// 반응형 컴포넌트에서 현재 뷰포트에 맞는 최종 스타일을 계산
export function getFinalStyles(component, viewport = 'desktop') {
  // 기본 스타일 (responsive가 없으면 기존 방식 사용)
  if (!component.responsive) {
    const result = {
      x: component.x || 0,
      y: component.y || 0,
      width: component.width,
      height: component.height,
      props: component.props || {},
    };
    //console.log(`🎨 getFinalStyles (기존): ${component.id} → x:${result.x}, y:${result.y}, w:${result.width}, h:${result.height}`);
    return result;
  }

  // responsive 구조에서 뷰포트별 스타일 병합
  const baseStyles = component.responsive.desktop || {};
  const viewportStyles = component.responsive[viewport] || {};

  // 더 안전한 fallback 처리 (undefined vs 0 구분)
  const result = {
    x:
      viewportStyles.x !== undefined
        ? viewportStyles.x
        : baseStyles.x !== undefined
          ? baseStyles.x
          : 0,
    y:
      viewportStyles.y !== undefined
        ? viewportStyles.y
        : baseStyles.y !== undefined
          ? baseStyles.y
          : 0,
    width:
      viewportStyles.width !== undefined
        ? viewportStyles.width
        : baseStyles.width,
    height:
      viewportStyles.height !== undefined
        ? viewportStyles.height
        : baseStyles.height,
    props: { ...(baseStyles.props || {}), ...(viewportStyles.props || {}) },
  };
  return result;
}

// 컴포넌트를 responsive 구조로 마이그레이션
export function migrateToResponsive(component) {
  if (component.responsive) {
    console.log(
      `✅ ${component.id} 이미 responsive 구조:`,
      component.responsive
    );
    return component; // 이미 responsive 구조
  }

  const originalPosition = {
    x: component.x || 0,
    y: component.y || 0,
    width: component.width,
    height: component.height,
  };

  console.log(`🔄 ${component.id} responsive 마이그레이션 시작:`);
  console.log(`   📍 원본 위치:`, originalPosition);

  const migratedComponent = {
    ...component,
    responsive: {
      desktop: {
        x: originalPosition.x,
        y: originalPosition.y,
        width: originalPosition.width,
        height: originalPosition.height,
        props: component.props || {},
      },
    },
    // 기존 필드들은 호환성을 위해 유지하되 responsive 우선
    x: originalPosition.x,
    y: originalPosition.y,
    width: originalPosition.width,
    height: originalPosition.height,
    props: component.props || {},
  };

  console.log(`   🎯 마이그레이션 결과:`, migratedComponent.responsive);
  console.log(
    `   🔒 데스크탑 위치 고정:`,
    migratedComponent.responsive.desktop
  );

  return migratedComponent;
}

// 모바일 자동 정렬: 캔버스 밖 컴포넌트들을 겹치지 않게 배치
export function arrangeMobileComponents(
  components,
  mobileCanvasWidth = 375,
  getComponentDimensionsFn = getComponentDimensions
) {
  console.log('🔍 arrangeMobileComponents 호출됨');
  console.log('📊 전체 컴포넌트 수:', components.length);
  console.log('📏 모바일 캔버스 너비:', mobileCanvasWidth);

  const PADDING = 10;
  const COMPONENT_SPACING = 20; // 컴포넌트 간 간격

  // 캔버스 밖에 있는 컴포넌트들과 캔버스 안에 있는 컴포넌트들 분리
  const componentsOutsideCanvas = [];
  const componentsInsideCanvas = [];

  for (const comp of components) {
    const currentStyles = getFinalStyles(comp, 'mobile');
    const compWidth =
      currentStyles.width || getComponentDimensionsFn(comp.type).defaultWidth;

    console.log(`🔎 컴포넌트 ${comp.id} 체크:`, {
      x: currentStyles.x,
      width: compWidth,
      rightEdge: currentStyles.x + compWidth,
      canvasWidth: mobileCanvasWidth,
      isOutside: currentStyles.x + compWidth > mobileCanvasWidth,
    });

    if (currentStyles.x + compWidth > mobileCanvasWidth) {
      componentsOutsideCanvas.push(comp);
      console.log(
        `📤 캔버스 밖: ${comp.id} (x: ${currentStyles.x}, width: ${compWidth})`
      );
    } else {
      // 캔버스 안에 있는 컴포넌트들 (충돌 체크에 사용)
      componentsInsideCanvas.push({
        ...comp,
        x: currentStyles.x,
        y: currentStyles.y,
        width:
          currentStyles.width ||
          getComponentDimensionsFn(comp.type).defaultWidth,
        height:
          currentStyles.height ||
          getComponentDimensionsFn(comp.type).defaultHeight,
      });
      console.log(
        `📥 캔버스 안: ${comp.id} (x: ${currentStyles.x}, width: ${compWidth})`
      );
    }
  }

  console.log(
    `📊 결과: 캔버스 밖 ${componentsOutsideCanvas.length}개, 캔버스 안 ${componentsInsideCanvas.length}개`
  );

  if (componentsOutsideCanvas.length === 0) {
    console.log('✅ 배치할 컴포넌트가 없음');
    return []; // 배치할 컴포넌트가 없음
  }

  // y 위치순으로 정렬 (위에서 아래로)
  const sortedComponents = [...componentsOutsideCanvas].sort((a, b) => {
    const aStyles = getFinalStyles(a, 'mobile');
    const bStyles = getFinalStyles(b, 'mobile');
    return aStyles.y - bStyles.y;
  });

  console.log(`📋 재정렬 대상 컴포넌트들 (위에서부터 순서대로):`);
  sortedComponents.forEach((comp, index) => {
    const styles = getFinalStyles(comp, 'mobile');
    console.log(`  ${index + 1}. ${comp.id}: y=${styles.y} (원래 위치)`);
  });

  // 빈 공간을 찾는 함수
  const findAvailablePosition = (
    compWidth,
    compHeight,
    originalX,
    existingComponents
  ) => {
    const startY = 20; // 최상단 시작 위치
    const maxX = Math.max(0, mobileCanvasWidth - compWidth - PADDING);

    // 원래 x 위치를 고려하되, 캔버스 안에 들어가도록 조정
    let preferredX = Math.max(PADDING, Math.min(originalX, maxX));

    console.log(
      `🎯 빈 공간 찾기: 원래 x=${originalX}, 조정된 x=${preferredX}, 컴포넌트 크기=${compWidth}x${compHeight}`
    );

    // 위에서부터 차례로 빈 공간 찾기
    for (let testY = startY; testY < 2000; testY += 10) {
      // 10px씩 증가하며 체크
      const testComp = {
        x: preferredX,
        y: testY,
        width: compWidth,
        height: compHeight,
      };

      // 기존 컴포넌트들과 충돌 체크
      let hasCollision = false;
      for (const existingComp of existingComponents) {
        if (checkCollision(testComp, existingComp, getComponentDimensionsFn)) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        console.log(`✅ 빈 공간 발견: (${preferredX}, ${testY})`);
        return { x: preferredX, y: testY };
      }
    }

    // 빈 공간을 찾지 못한 경우 맨 아래에 배치
    let bottomMostY = startY;
    if (existingComponents.length > 0) {
      bottomMostY =
        Math.max(...existingComponents.map((comp) => comp.y + comp.height)) +
        COMPONENT_SPACING;
    }

    console.log(
      `⚠️ 빈 공간을 찾지 못해 맨 아래 배치: (${preferredX}, ${bottomMostY})`
    );
    return { x: preferredX, y: bottomMostY };
  };

  const arrangementUpdates = [];

  for (const comp of sortedComponents) {
    const currentStyles = getFinalStyles(comp, 'mobile');
    const compDimensions = getComponentDimensionsFn(comp.type);
    const compWidth = currentStyles.width || compDimensions.defaultWidth;
    const compHeight = currentStyles.height || compDimensions.defaultHeight;

    console.log(
      `🎯 ${comp.id} 배치 시작: 현재 위치 (${currentStyles.x}, ${currentStyles.y}), 크기 ${compWidth}x${compHeight}`
    );

    // 이미 배치된 모든 컴포넌트들 (캔버스 안 + 이미 배치된 컴포넌트들)
    const allExistingComponents = [
      ...componentsInsideCanvas,
      ...arrangementUpdates.map((update) => ({
        ...update.component,
        x: update.newPosition.x,
        y: update.newPosition.y,
        width: update.newPosition.width,
        height: update.newPosition.height,
      })),
    ];

    console.log(
      `🔍 빈 공간 찾기 - 기존 컴포넌트 ${allExistingComponents.length}개 고려`
    );

    // 가장 위쪽 빈 공간 찾기 (원래 x 위치 고려)
    const availablePosition = findAvailablePosition(
      compWidth,
      compHeight,
      currentStyles.x,
      allExistingComponents
    );

    console.log(
      `📍 ${comp.id} 배치 위치 결정: (${availablePosition.x}, ${availablePosition.y})`
    );

    // 최종 위치 결정
    const finalPosition = {
      x: availablePosition.x,
      y: availablePosition.y,
      width: compWidth,
      height: compHeight,
    };

    arrangementUpdates.push({
      component: comp,
      originalPosition: currentStyles,
      newPosition: finalPosition,
    });

    console.log(
      `✅ 컴포넌트 ${comp.id} 최종 배치: (${currentStyles.x}, ${currentStyles.y}) → (${finalPosition.x}, ${finalPosition.y})`
    );
  }

  return arrangementUpdates;
}

// 캔버스 크기를 가져오는 함수
export function getCanvasSize(viewport = 'desktop') {
  switch (viewport) {
    case 'mobile':
      return { width: 375, height: 667 };
    case 'tablet':
      return { width: 768, height: 1024 };
    case 'desktop':
    default:
      return { width: 1920, height: 1080 };
  }
}

// 컴포넌트들을 세로로 정렬하는 함수
export function arrangeComponentsVertically(
  components,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  if (!components || components.length === 0) {
    return [];
  }

  const PADDING = 20;
  const COMPONENT_SPACING = 20;

  // 뷰포트에 따른 캔버스 크기
  const canvasWidth =
    viewport === 'mobile' ? 375 : viewport === 'tablet' ? 768 : 1920;
  const canvasHeight =
    viewport === 'mobile' ? 667 : viewport === 'tablet' ? 1024 : 1080;

  // 컴포넌트들을 y 위치순으로 정렬
  const sortedComponents = [...components].sort((a, b) => {
    const aStyles = getFinalStyles(a, viewport);
    const bStyles = getFinalStyles(b, viewport);
    return aStyles.y - bStyles.y;
  });

  const arrangementUpdates = [];
  let currentY = PADDING;

  for (const comp of sortedComponents) {
    const currentStyles = getFinalStyles(comp, viewport);
    const compDimensions = getComponentDimensionsFn(comp.type);
    const compWidth = currentStyles.width || compDimensions.defaultWidth;
    const compHeight = currentStyles.height || compDimensions.defaultHeight;

    // 컴포넌트가 캔버스 너비를 초과하지 않도록 조정
    let adjustedX = currentStyles.x;
    if (adjustedX + compWidth > canvasWidth - PADDING) {
      adjustedX = canvasWidth - compWidth - PADDING;
    }
    if (adjustedX < PADDING) {
      adjustedX = PADDING;
    }

    // 새로운 위치 설정
    const newPosition = {
      x: adjustedX,
      y: currentY,
      width: compWidth,
      height: compHeight,
    };

    arrangementUpdates.push({
      component: comp,
      originalPosition: currentStyles,
      newPosition: newPosition,
    });

    // 다음 컴포넌트의 y 위치 계산
    currentY += compHeight + COMPONENT_SPACING;
  }

  return arrangementUpdates;
}

// 스냅라인 계산 함수 (정렬, 간격, 그리드, 중앙선 스냅 모두 지원)
export function calculateSnapLines(
  draggedComp,
  allComponents,
  zoom = 100,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  const SNAP_THRESHOLD = 8;
  // 고정된 그리드 크기 사용 (줌 레벨에 관계없이 일관된 그리드)
  const effectiveGridSize = GRID_SIZE; // 고정된 그리드 크기
  const snapLines = { vertical: [], horizontal: [] };
  if (!draggedComp) return snapLines;

  // 캔버스 크기 (뷰포트에 따라)
  const canvasWidth = viewport === 'mobile' ? 375 : 1920;
  const canvasHeight = viewport === 'mobile' ? 667 : 1080;

  // 1. 중앙선 스냅 (Canvas Center)
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
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
  allComponents.forEach((other) => {
    if (other.id === draggedComp.id) return;
    const otherDimensions = getComponentDimensionsFn(other.type);
    const otherX = [
      other.x,
      other.x + (other.width || otherDimensions.defaultWidth) / 2,
      other.x + (other.width || otherDimensions.defaultWidth),
    ];
    const dragX = [
      draggedComp.x,
      draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth) / 2,
      draggedComp.x + (draggedComp.width || draggedDimensions.defaultWidth),
    ];
    otherX.forEach((ox) => {
      dragX.forEach((dx) => {
        if (Math.abs(ox - dx) < SNAP_THRESHOLD) {
          snapLines.vertical.push({ x: ox, type: 'align' });
        }
      });
    });
    const otherY = [
      other.y,
      other.y + (other.height || otherDimensions.defaultHeight) / 2,
      other.y + (other.height || otherDimensions.defaultHeight),
    ];
    const dragY = [
      draggedComp.y,
      draggedComp.y +
        (draggedComp.height || draggedDimensions.defaultHeight) / 2,
      draggedComp.y + (draggedComp.height || draggedDimensions.defaultHeight),
    ];
    otherY.forEach((oy) => {
      dragY.forEach((dy) => {
        if (Math.abs(oy - dy) < SNAP_THRESHOLD) {
          snapLines.horizontal.push({ y: oy, type: 'align' });
        }
      });
    });
  });

  // 3. 간격 스냅 (Spacing)
  allComponents.forEach((a) => {
    allComponents.forEach((b) => {
      if (a.id === b.id || a.id === draggedComp.id || b.id === draggedComp.id)
        return;
      const spacingX = Math.abs(a.x - b.x);
      const spacingY = Math.abs(a.y - b.y);
      if (
        Math.abs(Math.abs(draggedComp.x - a.x) - spacingX) < SNAP_THRESHOLD &&
        spacingX > 0
      ) {
        snapLines.vertical.push({
          x: draggedComp.x,
          type: 'spacing',
          spacing: spacingX,
        });
      }
      if (
        Math.abs(Math.abs(draggedComp.y - a.y) - spacingY) < SNAP_THRESHOLD &&
        spacingY > 0
      ) {
        snapLines.horizontal.push({
          y: draggedComp.y,
          type: 'spacing',
          spacing: spacingY,
        });
      }
    });
  });

  // 4. 그리드 스냅 (Grid) - 줌 레벨 고려
  const gridX =
    Math.round(draggedComp.x / effectiveGridSize) * effectiveGridSize;
  const gridY =
    Math.round(draggedComp.y / effectiveGridSize) * effectiveGridSize;
  if (Math.abs(draggedComp.x - gridX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({ x: gridX, type: 'grid' });
  }
  if (Math.abs(draggedComp.y - gridY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({ y: gridY, type: 'grid' });
  }

  return snapLines;
}
