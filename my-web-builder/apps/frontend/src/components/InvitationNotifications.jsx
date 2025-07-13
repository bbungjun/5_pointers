import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { io } from 'socket.io-client';

/**
 * InvitationNotifications 컴포넌트
 * 
 * 역할: 사용자가 받은 초대 목록을 표시하고 수락/거절할 수 있는 알림 컴포넌트
 */
function InvitationNotifications() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [socket, setSocket] = useState(null);

  // 초대 목록 조회
  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/invitations/my-invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('초대 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초대 수락
  const handleAcceptInvitation = async (invitationToken, pageId) => {
    try {
      setProcessing(prev => ({ ...prev, [invitationToken]: 'accepting' }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationToken}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 초대 목록에서 제거
        setInvitations(prev => prev.filter(inv => inv.invitationToken !== invitationToken));
        
        // 초대 정보에서 viewport와 fromTemplate 파라미터 가져오기
        const invitation = invitations.find(inv => inv.invitationToken === invitationToken);
        const viewport = invitation?.viewport;
        const fromTemplate = invitation?.fromTemplate;
        
        // URL 파라미터 구성
        const params = new URLSearchParams();
        if (viewport) params.append('viewport', viewport);
        if (fromTemplate) params.append('fromTemplate', fromTemplate);
        
        const queryString = params.toString();
        const targetUrl = queryString ? `/editor/${pageId}?${queryString}` : `/editor/${pageId}`;
        
        console.log('InvitationNotifications: 에디터로 이동:', targetUrl);
        console.log('InvitationNotifications: 파라미터:', { viewport, fromTemplate });
        
        // 에디터 페이지로 이동 (파라미터 포함)
        navigate(targetUrl);
      } else {
        const errorData = await response.json();
        alert(errorData.message || '초대 수락에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 수락 실패:', error);
      alert('초대 수락에 실패했습니다.');
    } finally {
      setProcessing(prev => ({ ...prev, [invitationToken]: null }));
    }
  };

  // 초대 거절
  const handleDeclineInvitation = async (invitationToken) => {
    if (!confirm('정말로 이 초대를 거절하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [invitationToken]: 'declining' }));
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationToken}/decline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // 초대 목록에서 제거
        setInvitations(prev => prev.filter(inv => inv.invitationToken !== invitationToken));
      } else {
        const errorData = await response.json();
        alert(errorData.message || '초대 거절에 실패했습니다.');
      }
    } catch (error) {
      console.error('초대 거절 실패:', error);
      alert('초대 거절에 실패했습니다.');
    } finally {
      setProcessing(prev => ({ ...prev, [invitationToken]: null }));
    }
  };

  // 만료 시간 포맷팅
  const formatExpiryTime = (expiresAt) => {
    if (!expiresAt) return '만료 시간 없음';
    
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return '만료됨';
    if (diffDays === 1) return '오늘 만료';
    return `${diffDays}일 후 만료`;
  };

  // 역할 한글화
  const getRoleLabel = (role) => {
    switch (role) {
      case 'OWNER': return '소유자';
      case 'ADMIN': return '관리자';
      case 'EDITOR': return '편집자';
      case 'VIEWER': return '뷰어';
      default: return role;
    }
  };

  // WebSocket 연결 설정
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // JWT 토큰에서 userId 추출
    const decodeJWTPayload = (token) => {
      try {
        let base64 = token.split('.')[1];
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const utf8String = new TextDecoder('utf-8').decode(bytes);
        const payload = JSON.parse(utf8String);
        return payload;
      } catch (error) {
        console.error('JWT 디코딩 실패:', error);
        return null;
      }
    };

    const payload = decodeJWTPayload(token);
    const userId = payload?.userId || payload?.id || payload?.sub;
    
    if (!userId) return;

    // WebSocket 연결
    const socketUrl = API_BASE_URL.replace('http', 'ws');
    const newSocket = io(`${socketUrl}/invite`, {
      query: { userId },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('초대 알림 WebSocket 연결됨');
    });

    newSocket.on('disconnect', () => {
      console.log('초대 알림 WebSocket 연결 해제됨');
    });

    newSocket.on('new-invitation', (invitationData) => {
      console.log('새 초대 알림 수신:', invitationData);
      // 새로운 초대가 오면 목록을 새로고침
      fetchInvitations();
    });

    setSocket(newSocket);

    // 초기 데이터 로드
    fetchInvitations();

    // WebSocket 연결이 실패할 경우를 대비해 폴링도 함께 사용 (60초마다)
    const interval = setInterval(fetchInvitations, 60000);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-200/30">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">초대 알림</h3>
        </div>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-slate-500 mt-2 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // 초대가 없으면 컴포넌트를 렌더링하지 않음
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-200/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">초대 알림</h3>
          <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            {invitations.length}개
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div 
            key={invitation.id}
            className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-purple-700">
                    {invitation.inviterName}
                  </span>
                  <span className="mx-2 text-purple-400">•</span>
                  <span className="text-sm text-slate-600">
                    {getRoleLabel(invitation.role)}
                  </span>
                </div>
                
                <h4 className="font-semibold text-slate-800 mb-1">
                  {invitation.pageName}
                </h4>
                
                <div className="flex items-center text-xs text-slate-500">
                  <span className={formatExpiryTime(invitation.expiresAt).includes('만료') ? 'text-red-500' : ''}>
                    {formatExpiryTime(invitation.expiresAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleAcceptInvitation(invitation.invitationToken, invitation.pageId)}
                  disabled={processing[invitation.invitationToken]}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing[invitation.invitationToken] === 'accepting' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                      수락 중...
                    </div>
                  ) : (
                    '수락'
                  )}
                </button>
                
                <button
                  onClick={() => handleDeclineInvitation(invitation.invitationToken)}
                  disabled={processing[invitation.invitationToken]}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing[invitation.invitationToken] === 'declining' ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-slate-600 mr-1"></div>
                      거절 중...
                    </div>
                  ) : (
                    '거절'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InvitationNotifications; 