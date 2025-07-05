// 뷰포트 시스템 테스트 파일
import {
  VIEWPORT_CONFIGS,
  getCanvasSize,
  arrangeResponsiveComponents,
} from './editorUtils';

// 테스트 컴포넌트 데이터
const testComponents = [
  {
    id: 'test-1',
    type: 'text',
    responsive: {
      desktop: {
        x: 500,
        y: 100,
        width: 300,
        height: 50,
        props: { text: '데스크탑 텍스트' },
      },
      tablet: {
        x: 200,
        y: 100,
        width: 350,
        height: 60,
        props: { text: '태블릿 텍스트' },
      },
      mobile: {
        x: 20,
        y: 100,
        width: 335,
        height: 80,
        props: { text: '모바일 텍스트' },
      },
    },
  },
  {
    id: 'test-2',
    type: 'button',
    responsive: {
      desktop: {
        x: 800,
        y: 200,
        width: 150,
        height: 50,
        props: { text: '데스크탑 버튼' },
      },
      // 태블릿, 모바일 설정 없음 - 데스크탑 설정이 폴백으로 사용됨
    },
  },
  {
    id: 'test-3',
    type: 'image',
    // responsive 설정 없음 - 기존 레거시 구조
    x: 1000,
    y: 300,
    width: 400,
    height: 300,
    props: { src: 'test-image.jpg' },
  },
];

// 테스트 실행 함수
export function runViewportTests() {
  console.log('🧪 뷰포트 시스템 테스트 시작');

  // 1. VIEWPORT_CONFIGS 테스트
  console.log('\n📱 뷰포트 설정 확인:');
  Object.entries(VIEWPORT_CONFIGS).forEach(([viewport, config]) => {
    console.log(
      `  ${viewport}: ${config.width}x${config.height} (${config.description})`
    );
  });

  // 2. getCanvasSize 테스트
  console.log('\n📐 캔버스 크기 계산 테스트:');
  ['desktop', 'tablet', 'mobile'].forEach((viewport) => {
    const size = getCanvasSize(viewport);
    console.log(`  ${viewport}: ${size.width}x${size.height}`);
  });

  // 3. arrangeResponsiveComponents 테스트
  console.log('\n🔧 반응형 자동 정렬 테스트:');

  // 모바일에서 캔버스를 넘어가는 컴포넌트 생성
  const overflowComponent = {
    id: 'overflow-test',
    type: 'text',
    responsive: {
      desktop: { x: 100, y: 100, width: 200, height: 50 },
      mobile: { x: 300, y: 100, width: 200, height: 50 }, // 375px 캔버스를 넘어감
    },
  };

  const arrangeUpdates = arrangeResponsiveComponents(
    [overflowComponent],
    'mobile'
  );
  console.log('  자동 정렬 결과:', arrangeUpdates);

  // 4. 태블릿 뷰포트 테스트
  console.log('\n📱 태블릿 뷰포트 테스트:');
  const tabletOverflowComponent = {
    id: 'tablet-overflow-test',
    type: 'button',
    responsive: {
      desktop: { x: 100, y: 100, width: 200, height: 50 },
      tablet: { x: 700, y: 100, width: 200, height: 50 }, // 768px 캔버스를 넘어감
    },
  };

  const tabletArrangeUpdates = arrangeResponsiveComponents(
    [tabletOverflowComponent],
    'tablet'
  );
  console.log('  태블릿 자동 정렬 결과:', tabletArrangeUpdates);

  console.log('\n✅ 뷰포트 시스템 테스트 완료');

  return {
    viewportConfigs: VIEWPORT_CONFIGS,
    canvasSizes: {
      desktop: getCanvasSize('desktop'),
      tablet: getCanvasSize('tablet'),
      mobile: getCanvasSize('mobile'),
    },
    arrangeTests: {
      mobile: arrangeUpdates,
      tablet: tabletArrangeUpdates,
    },
  };
}

// 브라우저 콘솔에서 실행할 수 있도록 전역 함수로 등록
if (typeof window !== 'undefined') {
  window.testViewportSystem = runViewportTests;
}
