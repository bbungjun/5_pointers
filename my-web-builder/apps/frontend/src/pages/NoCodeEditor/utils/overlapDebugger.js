// 겹침 디버깅 유틸리티
import { checkCollision, getFinalStyles } from './editorUtils';

// 전역 디버깅 모드
let debugMode = false;

// 디버깅 모드 토글
export function toggleOverlapDebug() {
  debugMode = !debugMode;
  console.log(`🔧 겹침 디버깅 모드: ${debugMode ? 'ON' : 'OFF'}`);
  return debugMode;
}

// 현재 캔버스의 모든 컴포넌트 겹침 체크
export function checkAllOverlaps(
  components,
  viewport = 'desktop',
  getComponentDimensionsFn
) {
  if (!debugMode) return [];

  console.log(`\n🔍 전체 겹침 체크 시작 (${viewport} 뷰포트)`);

  const overlaps = [];
  const processedComponents = components.map((comp) => {
    const styles = getFinalStyles(comp, viewport);
    const dimensions = getComponentDimensionsFn(comp.type);

    return {
      id: comp.id,
      type: comp.type,
      x: styles.x,
      y: styles.y,
      width: styles.width || dimensions.defaultWidth,
      height: styles.height || dimensions.defaultHeight,
    };
  });

  console.log(`📊 체크할 컴포넌트 ${processedComponents.length}개:`);
  processedComponents.forEach((comp, index) => {
    console.log(
      `  ${index + 1}. ${comp.id} (${comp.type}): (${comp.x}, ${comp.y}) ${comp.width}x${comp.height}`
    );
  });

  // 모든 컴포넌트 쌍을 체크
  for (let i = 0; i < processedComponents.length; i++) {
    for (let j = i + 1; j < processedComponents.length; j++) {
      const comp1 = processedComponents[i];
      const comp2 = processedComponents[j];

      if (checkCollision(comp1, comp2, getComponentDimensionsFn)) {
        const overlap = {
          comp1: comp1,
          comp2: comp2,
          severity: calculateOverlapSeverity(comp1, comp2),
        };
        overlaps.push(overlap);

        console.error(
          `🚨 겹침 발견: ${comp1.id} vs ${comp2.id} (심각도: ${overlap.severity}%)`
        );
      }
    }
  }

  if (overlaps.length === 0) {
    console.log('✅ 겹침 없음');
  } else {
    console.error(`❌ 총 ${overlaps.length}개 겹침 발견`);
  }

  return overlaps;
}

// 겹침 심각도 계산 (겹치는 영역의 비율)
function calculateOverlapSeverity(comp1, comp2) {
  const comp1Left = comp1.x;
  const comp1Right = comp1.x + comp1.width;
  const comp1Top = comp1.y;
  const comp1Bottom = comp1.y + comp1.height;

  const comp2Left = comp2.x;
  const comp2Right = comp2.x + comp2.width;
  const comp2Top = comp2.y;
  const comp2Bottom = comp2.y + comp2.height;

  // 겹치는 영역 계산
  const overlapLeft = Math.max(comp1Left, comp2Left);
  const overlapRight = Math.min(comp1Right, comp2Right);
  const overlapTop = Math.max(comp1Top, comp2Top);
  const overlapBottom = Math.min(comp1Bottom, comp2Bottom);

  const overlapWidth = Math.max(0, overlapRight - overlapLeft);
  const overlapHeight = Math.max(0, overlapBottom - overlapTop);
  const overlapArea = overlapWidth * overlapHeight;

  // 더 작은 컴포넌트를 기준으로 겹침 비율 계산
  const comp1Area = comp1.width * comp1.height;
  const comp2Area = comp2.width * comp2.height;
  const smallerArea = Math.min(comp1Area, comp2Area);

  return Math.round((overlapArea / smallerArea) * 100);
}

// 태블릿 전용 겹침 체크
export function checkTabletOverlaps(components, getComponentDimensionsFn) {
  console.log('\n📱 태블릿 전용 겹침 체크 시작...');

  const tabletOverlaps = checkAllOverlaps(
    components,
    'tablet',
    getComponentDimensionsFn
  );
  const mobileOverlaps = checkAllOverlaps(
    components,
    'mobile',
    getComponentDimensionsFn
  );

  console.log(`\n📊 뷰포트별 겹침 비교:`);
  console.log(`  태블릿: ${tabletOverlaps.length}개 겹침`);
  console.log(`  모바일: ${mobileOverlaps.length}개 겹침`);

  if (tabletOverlaps.length > 0 && mobileOverlaps.length === 0) {
    console.error('🚨 태블릿에서만 겹침 발생! 태블릿 전용 문제 확인 필요');

    // 태블릿에서만 겹치는 컴포넌트들 상세 분석
    tabletOverlaps.forEach((overlap, index) => {
      const { comp1, comp2 } = overlap;
      console.error(`\n${index + 1}. 태블릿 겹침 상세 분석:`);
      console.error(
        `   컴포넌트 1: ${comp1.id} (${comp1.x}, ${comp1.y}) ${comp1.width}x${comp1.height}`
      );
      console.error(
        `   컴포넌트 2: ${comp2.id} (${comp2.x}, ${comp2.y}) ${comp2.width}x${comp2.height}`
      );

      // 태블릿 캔버스 크기와 비교
      const tabletCanvas = getCanvasSize('tablet');
      console.error(
        `   태블릿 캔버스: ${tabletCanvas.width}x${tabletCanvas.height}`
      );
      console.error(
        `   comp1 경계 초과: X=${comp1.x + comp1.width > tabletCanvas.width}, Y=${comp1.y + comp1.height > tabletCanvas.height}`
      );
      console.error(
        `   comp2 경계 초과: X=${comp2.x + comp2.width > tabletCanvas.width}, Y=${comp2.y + comp2.height > tabletCanvas.height}`
      );
    });
  }

  return { tabletOverlaps, mobileOverlaps };
}

// 브라우저 콘솔에서 사용할 수 있는 전역 함수 등록
if (typeof window !== 'undefined') {
  window.debugOverlaps = toggleOverlapDebug;
  window.checkOverlaps = checkAllOverlaps;
  window.checkTabletOverlaps = checkTabletOverlaps;
}

// 컴포넌트별 겹침 상태 표시용 CSS 클래스 생성
export function generateOverlapCSS(overlaps) {
  if (!debugMode || overlaps.length === 0) return '';

  let css = `
    /* 겹침 디버깅 스타일 */
    .overlap-debug {
      position: relative;
    }
    
    .overlap-debug::after {
      content: '⚠️';
      position: absolute;
      top: -10px;
      right: -10px;
      background: red;
      color: white;
      font-size: 12px;
      padding: 2px 4px;
      border-radius: 2px;
      z-index: 9999;
    }
    
    .overlap-warning {
      outline: 2px solid red !important;
      outline-offset: 2px;
    }
  `;

  return css;
}

// 겹침 리포트 생성
export function generateOverlapReport(overlaps, viewport) {
  if (overlaps.length === 0) {
    return `✅ ${viewport} 뷰포트: 겹침 없음`;
  }

  let report = `❌ ${viewport} 뷰포트: ${overlaps.length}개 겹침 발견\n\n`;

  overlaps.forEach((overlap, index) => {
    const { comp1, comp2, severity } = overlap;
    report += `${index + 1}. ${comp1.id} vs ${comp2.id}\n`;
    report += `   - ${comp1.id}: (${comp1.x}, ${comp1.y}) ${comp1.width}x${comp1.height}\n`;
    report += `   - ${comp2.id}: (${comp2.x}, ${comp2.y}) ${comp2.width}x${comp2.height}\n`;
    report += `   - 겹침 심각도: ${severity}%\n\n`;
  });

  return report;
}
