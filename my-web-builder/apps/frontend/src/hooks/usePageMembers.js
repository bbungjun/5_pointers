import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { getCurrentUser } from '../utils/userUtils';
import { getUserColor } from '../utils/userColors';

export const usePageMembers = (pageId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const getToken = () => {
    return localStorage.getItem('token');
  };

  const fetchMembers = useCallback(async () => {
    const token = getToken();
    if (!pageId || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('멤버 정보를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      
      // 각 멤버에 색상 추가
      const membersWithColors = data.map(member => ({
        ...member,
        color: getUserColor(member.userId || member.email || member.id)
      }));
      
      setMembers(membersWithColors);
    } catch (err) {
      setError(err.message);
      console.error('멤버 정보 가져오기 오류:', err);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // 초기 로딩 및 주기적 업데이트
  useEffect(() => {
    fetchMembers();
    
    // 30초마다 멤버 목록 새로고침
    const interval = setInterval(fetchMembers, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMembers]);

  // 현재 사용자가 아닌 다른 멤버들 (소유자 포함)
  const otherMembers = members.filter(member => 
    !currentUser || member.email !== currentUser.email
  );

  return {
    members,
    otherMembers,
    currentUser,
    loading,
    error,
    refetch: fetchMembers,
  };
}; 