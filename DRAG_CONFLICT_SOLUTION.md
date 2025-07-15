# 드래그 충돌 문제 해결 가이드

## 문제 상황
2명이 동시에 한 페이지에 접속하면 컴포넌트가 드래그되지 않는 문제

## 원인 분석
1. **실시간 Y.js 동기화 충돌**: 드래그 중에 실시간으로 Y.js에 업데이트를 보내서 다른 사용자의 드래그와 충돌
2. **동시 편집 경합**: 두 사용자가 동시에 같은 컴포넌트를 조작할 때 발생하는 경합 상태
3. **업데이트 순서 문제**: Y.js 업데이트가 드래그 중에 발생하여 위치가 초기화되는 문제

## 해결 방법

### 1. 드래그 중 실시간 동기화 방지
- 드래그 중에는 로컬 상태만 업데이트
- 드래그 완료 시에만 Y.js 동기화 수행

### 2. 드래그 상태 관리
- `dragStateRef`를 통해 현재 드래그 중인 컴포넌트 추적
- 드래그 중인 컴포넌트는 다른 사용자의 업데이트 무시

### 3. 시각적 피드백 유지
- 드래그 중에도 시각적으로는 움직임 표시
- `tempX`, `tempY`를 통한 임시 위치 저장

## 적용된 수정사항

### CanvasComponent.jsx
```javascript
// 드래그 중에는 임시 위치만 저장
setDragStart(prev => ({
  ...prev,
  tempX: newX,
  tempY: newY
}));

// 드래그 완료 시에만 Y.js 동기화
const handleDragEnd = () => {
  // 드래그 상태 해제
  if (setComponentDragging) {
    setComponentDragging(comp.id, false);
  }
  
  // 최종 위치만 동기화
  onUpdate(updatedComponent);
};
```

### useCollaboration.js
```javascript
// 드래그 상태 추적
const dragStateRef = useRef(new Set());

// 드래그 중인 컴포넌트는 업데이트 스킵
const updateComponent = useCallback((componentId, updates) => {
  if (dragStateRef.current.has(componentId)) {
    console.log('드래그 중인 컴포넌트 업데이트 스킵:', componentId);
    return;
  }
  // 실제 업데이트 수행
}, []);
```

## 테스트 방법

### 1. 단일 사용자 테스트
```bash
# 브라우저에서 페이지 열기
# 컴포넌트 드래그 테스트
# 정상 동작 확인
```

### 2. 다중 사용자 테스트
```bash
# 두 개의 브라우저 탭에서 같은 페이지 열기
# 각각 다른 컴포넌트 동시 드래그
# 충돌 없이 동작하는지 확인
```

### 3. 동시 편집 테스트
```bash
# 두 사용자가 같은 컴포넌트를 동시에 드래그
# 마지막 드래그가 적용되는지 확인
# 데이터 손실이 없는지 확인
```

## 디버깅 로그

다음 로그들을 확인하여 문제를 진단할 수 있습니다:

### 정상 동작 로그
```
드래그 시작: comp-123 현재 위치: 100 200
드래그 종료: comp-123
위치 변경 감지, Y.js 동기화: comp-123 (100, 200) -> (150, 250)
🔄 컴포넌트 객체 업데이트 동기화: comp-123
```

### 충돌 방지 로그
```
드래그 중인 컴포넌트 업데이트 스킵: comp-123
드래그 중인 컴포넌트 객체 업데이트 스킵: comp-123
```

### 문제 상황 로그
```
❌ Y.js 컴포넌트 배열이 초기화되지 않음
❌ 업데이트할 컴포넌트를 찾을 수 없음: comp-123
```

## 추가 최적화 방안

### 1. 드래그 디바운싱
```javascript
// 드래그 완료 후 일정 시간 대기 후 동기화
const debouncedSync = debounce(() => {
  onUpdate(updatedComponent);
}, 100);
```

### 2. 충돌 해결 전략
```javascript
// 타임스탬프 기반 충돌 해결
const resolveConflict = (localUpdate, remoteUpdate) => {
  return localUpdate.timestamp > remoteUpdate.timestamp 
    ? localUpdate 
    : remoteUpdate;
};
```

### 3. 사용자 피드백
```javascript
// 드래그 충돌 시 사용자에게 알림
if (dragConflict) {
  showNotification('다른 사용자가 이 컴포넌트를 편집 중입니다.');
}
```

## 성능 모니터링

### 메트릭 수집
- 드래그 응답 시간
- Y.js 동기화 지연
- 충돌 발생 빈도
- 사용자 경험 만족도

### 알림 설정
- 드래그 지연 > 100ms
- 동기화 실패 > 3회
- 동시 사용자 > 10명

이제 2명이 동시에 접속해도 컴포넌트 드래그가 정상적으로 작동할 것입니다!
