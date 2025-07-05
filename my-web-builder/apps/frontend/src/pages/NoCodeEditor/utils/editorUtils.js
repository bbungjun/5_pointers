// 그리드 크기 상수
export const GRID_SIZE = 50;

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

  // 실제 겹침 검사
  const comp1Left = comp1.x;
  const comp1Right = comp1.x + comp1Width;
  const comp1Top = comp1.y;
  const comp1Bottom = comp1.y + comp1Height;

  const comp2Left = comp2.x;
  const comp2Right = comp2.x + comp2Width;
  const comp2Top = comp2.y;
  const comp2Bottom = comp2.y + comp2Height;

  // 겹침 조건: 두 사각형이 겹치는 경우
  const isOverlapping = !(
    comp1Right <= comp2Left ||
    comp2Right <= comp1Left ||
    comp1Bottom <= comp2Top ||
    comp2Bottom <= comp1Top
  );

  // 🔍 간단한 디버깅 로그 (겹침이 있을 때만 자세히)
  if (isOverlapping) {
    console.error(`🚨🚨🚨 checkCollision 겹침 발견!!! 🚨🚨🚨`);
    console.error(
      `   ${comp1.id || 'comp1'}: (${comp1Left}, ${comp1Top}) ~ (${comp1Right}, ${comp1Bottom}) [${comp1Width}x${comp1Height}]`
    );
    console.error(
      `   ${comp2.id || 'comp2'}: (${comp2Left}, ${comp2Top}) ~ (${comp2Right}, ${comp2Bottom}) [${comp2Width}x${comp2Height}]`
    );

    // 겹침 영역 크기 계산
    const overlapWidth =
      Math.min(comp1Right, comp2Right) - Math.max(comp1Left, comp2Left);
    const overlapHeight =
      Math.min(comp1Bottom, comp2Bottom) - Math.max(comp1Top, comp2Top);
    console.error(
      `   🔥 겹침 영역 크기: ${overlapWidth}px x ${overlapHeight}px`
    );
  }

  if (isOverlapping) {
    console.warn(
      `🚨 겹침 감지: ${comp1.id || 'comp1'} vs ${comp2.id || 'comp2'}`
    );
    console.warn(
      `  comp1: (${comp1Left}, ${comp1Top}) ~ (${comp1Right}, ${comp1Bottom}) [${comp1Width}x${comp1Height}]`
    );
    console.warn(
      `  comp2: (${comp2Left}, ${comp2Top}) ~ (${comp2Right}, ${comp2Bottom}) [${comp2Width}x${comp2Height}]`
    );

    // 겹침 영역 계산
    const overlapLeft = Math.max(comp1Left, comp2Left);
    const overlapRight = Math.min(comp1Right, comp2Right);
    const overlapTop = Math.max(comp1Top, comp2Top);
    const overlapBottom = Math.min(comp1Bottom, comp2Bottom);
    const overlapWidth = overlapRight - overlapLeft;
    const overlapHeight = overlapBottom - overlapTop;

    console.warn(
      `  겹침 영역: (${overlapLeft}, ${overlapTop}) ~ (${overlapRight}, ${overlapBottom}) [${overlapWidth}x${overlapHeight}]`
    );
  }

  return isOverlapping;
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
  const canvasSize = getCanvasSize(viewport);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
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
    console.log(
      `🎨 getFinalStyles (기존): ${component.id} → x:${result.x}, y:${result.y}, w:${result.width}, h:${result.height}`
    );
    return result;
  }

  // responsive 구조에서 뷰포트별 스타일 병합
  const baseStyles = component.responsive.desktop || {};
  const viewportStyles = component.responsive[viewport] || {};

  // 🔧 기본 사이즈 정보 가져오기 (undefined 방지)
  const defaultDimensions = getComponentDimensions(component.type);

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
        : baseStyles.width !== undefined
          ? baseStyles.width
          : defaultDimensions.defaultWidth,
    height:
      viewportStyles.height !== undefined
        ? viewportStyles.height
        : baseStyles.height !== undefined
          ? baseStyles.height
          : defaultDimensions.defaultHeight,
    props: { ...(baseStyles.props || {}), ...(viewportStyles.props || {}) },
  };

  console.log(
    `🎨 getFinalStyles (responsive): ${component.id} [${viewport}] → x:${result.x}, y:${result.y}, w:${result.width}, h:${result.height}`
  );
  console.log(`   🔧 responsive 구조:`, component.responsive);
  console.log(`   📋 baseStyles (desktop):`, baseStyles);
  console.log(`   📱 viewportStyles (${viewport}):`, viewportStyles);
  console.log(`   🎯 기본 사이즈:`, defaultDimensions);
  console.log(`   ✨ 최종 결과:`, result);

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

/**
 * 컴포넌트들을 세로로 충돌 없이 정렬합니다.
 * @param {Array} components - 전체 컴포넌트 배열
 * @param {string} viewport - 대상 뷰포트 ('mobile' 또는 'tablet')
 * @returns {Array} - 각 컴포넌트의 ID와 새로운 {x, y} 좌표가 담긴 업데이트 목록
 */
export function arrangeComponentsVertically(components, viewport) {
  console.log(`🚀🚀🚀 [${viewport}] 뷰포트 자동 정렬 시작!!! 🚀🚀🚀`);
  console.log(`📊 입력 컴포넌트 수: ${components?.length || 0}`);
  console.log(`📱 타겟 뷰포트: ${viewport}`);

  // 안전장치
  if (!components || components.length === 0) {
    console.log(`❌ 컴포넌트가 없음 - 정렬 중단`);
    return [];
  }

  const canvasWidth = getCanvasSize(viewport).width;
  const PADDING = 10; // 캔버스 좌우 여백
  const GAP = 10; // 컴포넌트 상하 간격
  let currentY = PADDING;

  console.log(`📐 캔버스 너비: ${canvasWidth}px`);
  console.log(`📏 여백: ${PADDING}px, 간격: ${GAP}px`);

  // 1. 컴포넌트들을 현재 Y 좌표 기준으로 정렬 (위에서 아래로)
  console.log(`🔄 컴포넌트들을 Y좌표 기준으로 정렬 중...`);
  const sortedComponents = [...components].sort((a, b) => {
    const aStyles = getFinalStyles(a, viewport);
    const bStyles = getFinalStyles(b, viewport);
    console.log(`  - ${a.id}: Y=${aStyles.y} vs ${b.id}: Y=${bStyles.y}`);
    return aStyles.y - bStyles.y;
  });

  console.log(`📋 정렬된 컴포넌트 순서:`);
  sortedComponents.forEach((comp, index) => {
    const styles = getFinalStyles(comp, viewport);
    console.log(
      `  ${index + 1}. ${comp.id}: (${styles.x}, ${styles.y}) ${styles.width}x${styles.height}`
    );
  });

  const updates = [];

  // 2. 정렬된 순서대로 위에서부터 차곡차곡 쌓기
  console.log(`🏗️ 차곡차곡 쌓기 시작...`);
  for (const comp of sortedComponents) {
    const finalStyles = getFinalStyles(comp, viewport);
    const compDimensions = getComponentDimensions(comp.type);

    // 새 위치 계산
    const newX = PADDING;
    const newY = currentY;

    // 너비는 캔버스에 맞게 조정
    const newWidth = Math.min(
      finalStyles.width || compDimensions.defaultWidth,
      canvasWidth - PADDING * 2
    );

    // 높이는 기존 높이 유지
    const newHeight = finalStyles.height || compDimensions.defaultHeight;

    console.log(`🧱 ${comp.id} 배치:`);
    console.log(
      `   - 기존 위치: (${finalStyles.x}, ${finalStyles.y}) ${finalStyles.width}x${finalStyles.height}`
    );
    console.log(`   - 새 위치: (${newX}, ${newY}) ${newWidth}x${newHeight}`);
    console.log(`   - currentY: ${currentY} → ${currentY + newHeight + GAP}`);

    // 업데이트 목록에 추가
    updates.push({
      id: comp.id,
      updates: { x: newX, y: newY, width: newWidth, height: newHeight },
    });

    // 다음 컴포넌트가 위치할 Y좌표 업데이트
    currentY += newHeight + GAP;
  }

  console.log(
    `✅✅✅ [${viewport}] 자동 정렬 완료! ${updates.length}개 컴포넌트 재배치 ✅✅✅`
  );
  console.log(`📋 최종 업데이트 목록:`, updates);
  return updates;
}

// 뷰포트 시스템 설정 (중앙 집중식 관리)
export const VIEWPORT_CONFIGS = {
  desktop: {
    width: 1920,
    height: 1080,
    label: '데스크탑',
    icon: '🖥️',
    description: '1920px 이상',
  },
  tablet: {
    width: 768,
    height: 1024,
    label: '태블릿',
    icon: '📱',
    description: '768px × 1024px',
  },
  mobile: {
    width: 375,
    height: 667,
    label: '모바일',
    icon: '📱',
    description: '375px × 667px',
  },
};

// 뷰포트별 캔버스 크기 가져오기
export function getCanvasSize(viewport = 'desktop') {
  const config = VIEWPORT_CONFIGS[viewport];
  if (!config) {
    console.warn(`Unknown viewport: ${viewport}, using desktop`);
    return VIEWPORT_CONFIGS.desktop;
  }
  return { width: config.width, height: config.height };
}

/**
 * 드래그 중인 컴포넌트에 대한 스냅라인을 계산합니다.
 * @param {Object} draggedComp - 드래그 중인 컴포넌트
 * @param {Array} otherComponents - 다른 컴포넌트들
 * @param {number} zoom - 줌 레벨 (기본값: 100)
 * @param {string} viewport - 현재 뷰포트 (기본값: 'desktop')
 * @param {Function} getComponentDimensionsFn - 컴포넌트 크기 함수
 * @returns {Object} - { vertical: [], horizontal: [] } 형태의 스냅라인 객체
 */
export function calculateSnapLines(
  draggedComp,
  otherComponents,
  zoom = 100,
  viewport = 'desktop',
  getComponentDimensionsFn = getComponentDimensions
) {
  const snapLines = { vertical: [], horizontal: [] };
  const SNAP_THRESHOLD = 12; // 스냅 감지 거리

  // 줌 스케일 계산
  const scale = zoom / 100;

  // 드래그된 컴포넌트의 크기와 위치
  const draggedDimensions = getComponentDimensionsFn(draggedComp.type);
  const draggedWidth = draggedComp.width || draggedDimensions.defaultWidth;
  const draggedHeight = draggedComp.height || draggedDimensions.defaultHeight;

  const draggedLeft = draggedComp.x;
  const draggedRight = draggedComp.x + draggedWidth;
  const draggedTop = draggedComp.y;
  const draggedBottom = draggedComp.y + draggedHeight;
  const draggedCenterX = draggedComp.x + draggedWidth / 2;
  const draggedCenterY = draggedComp.y + draggedHeight / 2;

  // 캔버스 크기
  const canvasSize = getCanvasSize(viewport);
  const canvasWidth = canvasSize.width;
  const canvasHeight = canvasSize.height;
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  // 1. 캔버스 중앙선 스냅라인
  if (Math.abs(draggedCenterX - canvasCenterX) < SNAP_THRESHOLD) {
    snapLines.vertical.push({
      x: canvasCenterX,
      color: '#ff6b35', // 주황색 - 캔버스 중앙
      opacity: 0.8,
      thickness: 1,
    });
  }

  if (Math.abs(draggedCenterY - canvasCenterY) < SNAP_THRESHOLD) {
    snapLines.horizontal.push({
      y: canvasCenterY,
      color: '#ff6b35', // 주황색 - 캔버스 중앙
      opacity: 0.8,
      thickness: 1,
    });
  }

  // 2. 다른 컴포넌트들과의 정렬 스냅라인
  for (const other of otherComponents) {
    if (other.id === draggedComp.id) continue;

    // 다른 컴포넌트의 최종 스타일 가져오기
    const otherStyles = getFinalStyles(other, viewport);
    const otherDimensions = getComponentDimensionsFn(other.type);
    const otherWidth = otherStyles.width || otherDimensions.defaultWidth;
    const otherHeight = otherStyles.height || otherDimensions.defaultHeight;

    const otherLeft = otherStyles.x;
    const otherRight = otherStyles.x + otherWidth;
    const otherTop = otherStyles.y;
    const otherBottom = otherStyles.y + otherHeight;
    const otherCenterX = otherStyles.x + otherWidth / 2;
    const otherCenterY = otherStyles.y + otherHeight / 2;

    // 수직 정렬 스냅라인 (X축)
    // 왼쪽 가장자리 정렬
    if (Math.abs(draggedLeft - otherLeft) < SNAP_THRESHOLD) {
      snapLines.vertical.push({
        x: otherLeft,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 오른쪽 가장자리 정렬
    if (Math.abs(draggedRight - otherRight) < SNAP_THRESHOLD) {
      snapLines.vertical.push({
        x: otherRight,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 중앙 정렬
    if (Math.abs(draggedCenterX - otherCenterX) < SNAP_THRESHOLD) {
      snapLines.vertical.push({
        x: otherCenterX,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 왼쪽과 오른쪽 경계 스냅
    if (Math.abs(draggedLeft - otherRight) < SNAP_THRESHOLD) {
      snapLines.vertical.push({
        x: otherRight,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    if (Math.abs(draggedRight - otherLeft) < SNAP_THRESHOLD) {
      snapLines.vertical.push({
        x: otherLeft,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 수평 정렬 스냅라인 (Y축)
    // 위쪽 가장자리 정렬
    if (Math.abs(draggedTop - otherTop) < SNAP_THRESHOLD) {
      snapLines.horizontal.push({
        y: otherTop,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 아래쪽 가장자리 정렬
    if (Math.abs(draggedBottom - otherBottom) < SNAP_THRESHOLD) {
      snapLines.horizontal.push({
        y: otherBottom,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 중앙 정렬
    if (Math.abs(draggedCenterY - otherCenterY) < SNAP_THRESHOLD) {
      snapLines.horizontal.push({
        y: otherCenterY,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    // 위쪽과 아래쪽 경계 스냅
    if (Math.abs(draggedTop - otherBottom) < SNAP_THRESHOLD) {
      snapLines.horizontal.push({
        y: otherBottom,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }

    if (Math.abs(draggedBottom - otherTop) < SNAP_THRESHOLD) {
      snapLines.horizontal.push({
        y: otherTop,
        color: '#FF0000', // 빨간색
        opacity: 0.8,
        thickness: 1,
      });
    }
  }

  return snapLines;
}
