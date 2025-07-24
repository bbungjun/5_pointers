// 협업 선택 기능 테스트
// 이 파일은 브라우저 콘솔에서 실행하여 테스트할 수 있습니다.

// 테스트용 가짜 선택 데이터 생성
function createTestSelection(userId, userName, userColor, componentId) {
  return {
    id: `test-${userId}`,
    componentIds: [componentId],
    user: {
      id: userId,
      name: userName,
      color: userColor
    },
    timestamp: Date.now(),
    viewport: 'desktop'
  };
}

// 테스트 실행
function runCollaborationSelectionTest() {
  console.log('🎯 협업 선택 기능 테스트 시작');
  
  // 테스트 데이터 생성
  const testSelections = [
    createTestSelection('user1', '김철수', '#FF6B6B', 'text-1'),
    createTestSelection('user2', '이영희', '#4ECDC4', 'button-1'),
    createTestSelection('user3', '박민수', '#45B7D1', 'image-1')
  ];
  
  console.log('📋 테스트 선택 데이터:', testSelections);
  
  // 각 선택에 대해 정보 출력
  testSelections.forEach((selection, index) => {
    console.log(`\n👤 사용자 ${index + 1}:`);
    console.log(`   이름: ${selection.user.name}`);
    console.log(`   색상: ${selection.user.color}`);
    console.log(`   선택한 컴포넌트: ${selection.componentIds.join(', ')}`);
    console.log(`   시간: ${new Date(selection.timestamp).toLocaleTimeString()}`);
  });
  
  console.log('\n✅ 테스트 완료!');
  console.log('💡 실제 환경에서는 다른 사용자가 컴포넌트를 선택할 때 위와 같은 형태로 데이터가 전송됩니다.');
}

// 전역 함수로 등록하여 콘솔에서 실행 가능하게 함
window.testCollaborationSelection = runCollaborationSelectionTest;

console.log('🚀 협업 선택 테스트 준비 완료!');
console.log('💡 콘솔에서 testCollaborationSelection() 을 실행하여 테스트하세요.'); 