import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  // 임의의 랜덤 ID 생성 예시
  const handleCreateNewPage = () => {
    // 랜덤 roomId 생성 (실제 서비스에서는 UUID 등 사용 권장)
    const newId = Math.random().toString(36).slice(2, 10);
    navigate(`/editor/${newId}`);
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#f5f6fa'
    }}>
      <button
        onClick={handleCreateNewPage}
        style={{
          fontSize: 24, padding: '20px 40px',
          background: '#3B4EFF', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer'
        }}
      >
        Create New Page
      </button>
    </div>
  );
}

export default Dashboard;
