import { useParams } from 'react-router-dom';
import NoCodeEditor from './NoCodeEditor'; // NoCodeEditor 컴포넌트를 임포트

function AppEditor() {
  const { pageId } = useParams();

  // pageId가 없는 경우를 대비한 방어 코드
  if (!pageId) {
    return <div>유효한 페이지 ID가 없습니다.</div>;
  }

  return (
    <NoCodeEditor pageId={pageId} />
  );
}

export default AppEditor;
