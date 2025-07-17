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
        // URL 파라미터 없이 일반 페이지로 시작
        const url = `/editor/${newPage.id}`;
        console.log('네비게이션 URL:', url, 'template.editingMode:', template.editingMode);
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

}

export default Dashboard;
