import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function Dashboard() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // 빈 페이지 생성
  const handleCreateNewPage = () => {
    const newId = Math.random().toString(36).slice(2, 10);
    navigate(`/editor/${newId}`);
  };

  // 템플릿으로 페이지 생성
  const handleCreateWithTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/templates/${template.id}/create-page`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${template.name} 복사본`,
        })
      });

      if (response.ok) {
        const newPage = await response.json();
        // 웨딩 템플릿인 경우 모바일 뷰포트로 설정
        const viewport = template.category === 'wedding' ? 'mobile' : 'desktop';
        const url = `/editor/${newPage.id}?viewport=${viewport}`;
        console.log('네비게이션 URL:', url, 'template.category:', template.category);
        navigate(url);
      } else {
        console.error('템플릿으로 페이지 생성 실패');
      }
    } catch (error) {
      console.error('템플릿 페이지 생성 오류:', error);
    }
  };
  
  // 템플릿 목록 가져오기
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/templates`);
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error('템플릿 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      background: '#f5f6fa', gap: 20
    }}>
      <h1 style={{ fontSize: 32, color: '#333', marginBottom: 40 }}>페이지레고</h1>
      
      <button
        onClick={handleCreateNewPage}
        style={{
          fontSize: 18, padding: '16px 32px',
          background: '#3B4EFF', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer',
          marginBottom: 12
        }}
      >
        빈 페이지 만들기
      </button>
      

    </div>
  );
}

export default Dashboard;
