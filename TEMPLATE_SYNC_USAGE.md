# 템플릿 동기화 사용 가이드

## 문제 해결

템플릿 기반 협업에서 동기화 문제가 발생하는 경우, 다음과 같이 해결할 수 있습니다:

### 1. 템플릿 페이지 컴포넌트에서 사용

```javascript
import { useCollaboration } from '../hooks/useCollaboration';
import { forceTemplateSyncForAllUsers, initializeTemplateSync } from '../utils/templateSync';

function TemplateEditPage({ roomId, templateId }) {
  const collaboration = useCollaboration({
    roomId,
    userInfo,
    canvasRef,
    selectedComponentId,
    onComponentsUpdate,
    viewport
  });

  useEffect(() => {
    // 템플릿 페이지 진입 시 자동 동기화
    initializeTemplateSync(collaboration, roomId, (success) => {
      if (success) {
        console.log('✅ 템플릿 동기화 완료');
      } else {
        console.warn('⚠️ 템플릿 동기화 실패, 수동 동기화 필요');
      }
    });
  }, [collaboration, roomId]);

  // 수동 동기화 버튼
  const handleManualSync = async () => {
    const success = await forceTemplateSyncForAllUsers(collaboration, roomId);
    if (success) {
      alert('동기화가 완료되었습니다!');
    } else {
      alert('동기화에 실패했습니다. 페이지를 새로고침해주세요.');
    }
  };

  return (
    <div>
      {/* 동기화 상태 표시 */}
      {!collaboration.isConnected && (
        <div className="sync-warning">
          ⚠️ 협업 서버에 연결 중입니다...
        </div>
      )}
      
      {/* 수동 동기화 버튼 */}
      <button onClick={handleManualSync}>
        🔄 수동 동기화
      </button>
      
      {/* 나머지 컴포넌트 */}
    </div>
  );
}
```

### 2. 초대 링크 접속 시 자동 동기화

```javascript
// 초대 링크로 접속한 사용자를 위한 자동 동기화
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const isInvited = urlParams.get('invited') === 'true';
  
  if (isInvited && collaboration.isConnected) {
    // 초대받은 사용자는 즉시 강제 동기화
    setTimeout(() => {
      forceTemplateSyncForAllUsers(collaboration, roomId);
    }, 500);
  }
}, [collaboration.isConnected]);
```

### 3. 주기적 동기화 확인

```javascript
// 5분마다 동기화 상태 확인
useEffect(() => {
  const syncInterval = setInterval(async () => {
    if (collaboration.isConnected) {
      await collaboration.forceTemplateSync();
    }
  }, 5 * 60 * 1000); // 5분

  return () => clearInterval(syncInterval);
}, [collaboration]);
```

## 주요 개선사항

1. **중복 컴포넌트 로그 감소**: 10개 이상의 중복이 있을 때만 로그 출력
2. **더 빠른 동기화**: 50ms로 동기화 지연 시간 단축
3. **템플릿 전용 강제 동기화**: `forceTemplateSync()` 함수 추가
4. **자동 재시도**: 동기화 실패 시 최대 3회 재시도
5. **연결 상태 모니터링**: Y.js 연결 상태에 따른 자동 동기화

## 사용 시나리오

### 시나리오 1: 템플릿으로 새 프로젝트 시작
1. 관리자가 템플릿을 선택하여 새 프로젝트 생성
2. 자동으로 `initializeTemplateSync()` 실행
3. 모든 사용자에게 템플릿 데이터 동기화

### 시나리오 2: 초대받은 사용자 접속
1. 초대 링크로 접속
2. Y.js 연결 완료 후 자동으로 `forceTemplateSync()` 실행
3. 기존 작업 내용 즉시 동기화

### 시나리오 3: 동기화 문제 발생 시
1. 사용자가 수동 동기화 버튼 클릭
2. `forceTemplateSyncForAllUsers()` 실행
3. 최대 3회 재시도로 동기화 복구

## 디버깅 팁

콘솔에서 다음 로그들을 확인하세요:

- `🎯 템플릿 강제 동기화 시작...` - 강제 동기화 시작
- `✅ 템플릿 강제 동기화 완료: X개 컴포넌트` - 동기화 성공
- `📡 모든 클라이언트에게 동기화 전파 완료` - 전파 완료
- `🧹 중복 컴포넌트 X개 제거됨` - 중복 제거

이러한 로그가 보이지 않으면 동기화에 문제가 있을 수 있습니다.
