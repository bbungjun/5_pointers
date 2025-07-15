import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { colors } from '../styles/colors';
import TemplateCanvasPreview from '../components/TemplateCanvasPreview';

function DeployedPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
  });

  // 참석 의사 확인 모달 상태
  const [attendanceModal, setAttendanceModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
    attendanceData: [],
    loading: false,
  });

  // 내 페이지 목록 조회
  const fetchMyPages = async () => {
    try {
      setPagesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/users/pages/my-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 받아온 페이지 데이터:', data);
        
        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniquePages = data.filter((page, index, arr) => {
          const firstIndex = arr.findIndex(p => p.id === page.id);
          return firstIndex === index;
        });
        
        console.log('🔍 중복 제거된 페이지:', uniquePages);
        console.log('🚀 배포된 페이지 필터링:', uniquePages.filter(page => page.status === 'DEPLOYED'));
        
        setMyPages(uniquePages);
      }
    } catch (error) {
      console.error('페이지 목록 조회 실패:', error);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPages();
  }, []);

  // 인라인 제목 수정 시작
  const startEditTitle = (pageId, currentTitle) => {
    setEditingId(pageId);
    setEditingTitle(currentTitle);
  };

  // 인라인 제목 수정 취소
  const cancelEditTitle = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 인라인 제목 수정 저장
  const saveEditTitle = async (pageId) => {
    if (!editingTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (response.ok) {
        fetchMyPages();
        setEditingId(null);
        setEditingTitle('');
      }
    } catch (error) {
      console.error('제목 수정 실패:', error);
    }
  };

  // 삭제 모달 열기
  const openDeleteModal = (pageId, title) => {
    setDeleteModal({ isOpen: true, pageId, title });
  };

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, pageId: null, title: '' });
  };

  // AttendRenderer가 포함된 페이지인지 확인
  const hasAttendRenderer = (page) => {
    if (!page.content || !page.content.components) return false;
    return page.content.components.some(component => component.type === 'attend');
  };

  // 참석 의사 데이터 조회
  const fetchAttendanceData = async (pageId) => {
    try {
      setAttendanceModal(prev => ({ ...prev, loading: true }));
      const token = localStorage.getItem('token');
      
      // 먼저 페이지의 모든 attend 컴포넌트를 찾기
      const page = myPages.find(p => p.id === pageId);
      if (!page || !page.content || !page.content.components) {
        throw new Error('페이지 데이터를 찾을 수 없습니다.');
      }

      const attendComponents = page.content.components.filter(comp => comp.type === 'attend');
      const allAttendanceData = [];

      // 각 attend 컴포넌트별로 데이터 조회
      for (const component of attendComponents) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/pages/${pageId}/attendance/${component.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            allAttendanceData.push({
              componentId: component.id,
              componentTitle: component.props?.buttonText || '참석 의사 전달',
              submissions: data,
            });
          }
        } catch (error) {
          console.error(`컴포넌트 ${component.id} 데이터 조회 실패:`, error);
        }
      }

      setAttendanceModal(prev => ({
        ...prev,
        attendanceData: allAttendanceData,
        loading: false,
      }));
    } catch (error) {
      console.error('참석 의사 데이터 조회 실패:', error);
      setAttendanceModal(prev => ({ ...prev, loading: false }));
      alert('참석 의사 데이터를 불러오는데 실패했습니다.');
    }
  };

  // 참석 의사 확인 모달 열기
  const openAttendanceModal = async (pageId, title) => {
    setAttendanceModal({
      isOpen: true,
      pageId,
      title,
      attendanceData: [],
      loading: true,
    });
    await fetchAttendanceData(pageId);
  };

  // 참석 의사 확인 모달 닫기
  const closeAttendanceModal = () => {
    setAttendanceModal({
      isOpen: false,
      pageId: null,
      title: '',
      attendanceData: [],
      loading: false,
    });
  };

  // 페이지 삭제 실행
  const confirmDeletePage = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/users/pages/${deleteModal.pageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchMyPages();
        closeDeleteModal();
      }
    } catch (error) {
      console.error('페이지 삭제 실패:', error);
    }
  };

  const deployedPages = myPages.filter((page) => page.status === 'DEPLOYED');
  const mobilePages = deployedPages.filter((page) => page.editingMode === 'mobile');
  const desktopPages = deployedPages.filter((page) => page.editingMode === 'desktop');

  // 페이지 카드 컴포넌트
  const PageCard = ({ page, isMobile = false }) => (
    <div
      key={page.id}
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 group ${
        isMobile ? 'max-w-xs mx-auto' : ''
      }`}
    >
      {/* 미리보기 영역 */}
      <div className="mb-4">
        {isMobile ? (
          // 모바일 휴대폰 프레임 (TemplateCanvasPreview와 동일한 스타일)
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* 휴대폰 외곽 프레임 */}
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[1.5rem] p-1">
                {/* 상단 노치 */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-gray-900 rounded-b-lg z-20"></div>
                
                {/* 스크린 영역 */}
                <div 
                  className="relative bg-white rounded-[1.25rem] overflow-hidden border border-gray-600"
                  style={{
                    width: '200px',
                    height: '400px',
                  }}
                >
                  <TemplateCanvasPreview 
                    template={page} 
                    className="w-full h-full" 
                  />
                </div>
                
                {/* 홈 인디케이터 (하단) */}
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full"></div>
                
                {/* 사이드 버튼들 */}
                <div className="absolute left-0 top-12 w-0.5 h-4 bg-gray-700 rounded-r-full"></div>
                <div className="absolute left-0 top-20 w-0.5 h-8 bg-gray-700 rounded-r-full"></div>
                <div className="absolute right-0 top-16 w-0.5 h-8 bg-gray-700 rounded-l-full"></div>
              </div>
            </div>
          </div>
        ) : (
          // 데스크톱 화면 프레임 (TemplateCanvasPreview와 동일한 스타일)
          <div className="flex items-center justify-center">
            <div 
              className="relative bg-gray-50 overflow-hidden rounded-lg border border-gray-200"
              style={{
                width: '240px',
                height: '180px',
              }}
            >
              <TemplateCanvasPreview 
                template={page} 
                className="w-full h-full" 
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {editingId === page.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveEditTitle(page.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveEditTitle(page.id)}
              className="w-full px-3 py-2 text-lg font-bold border border-sky-300 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-bold text-slate-800 mb-2">{page.title || '제목 없음'}</h3>
          )}
          
          <p className="text-sm text-slate-600 mb-2">
            배포일: {new Date(page.deployedAt || page.updatedAt).toLocaleDateString()}
          </p>
          {page.subdomain && (
            <p className="text-sm text-sky-500 font-medium">
              도메인: {page.subdomain}.ddukddak.org
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditTitle(page.id, page.title)}
            className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg"
            title="제목 수정"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => openDeleteModal(page.id, page.title)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
            title="삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const viewport = page.editingMode === 'mobile' ? 'mobile' : 'desktop';
            navigate(`/editor/${page.id}?viewport=${viewport}`);
          }}
          className="flex-1 px-4 py-2 bg-sky-200 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
        >
          편집하기
        </button>
        <button
          onClick={() => window.open(`http://${page.subdomain}.ddukddak.org`, '_blank')}
          className="px-4 py-2 bg-white text-sky-600 border border-sky-600 rounded-lg font-medium hover:bg-sky-100 transition-colors"
        >
          보기
        </button>
        {/* AttendRenderer가 포함된 페이지에만 참석 의사 확인 버튼 표시 */}
        {hasAttendRenderer(page) && (
          <button
            onClick={() => openAttendanceModal(page.id, page.title)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            title="참석 의사 확인"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            참석 확인
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-pink-50 to-rose-50 sticky top-0"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* 로고 섹션 */}
            <div className="flex items-center gap-6">
              <div 
                className="relative group cursor-pointer"
                onClick={() => navigate('/dashboard')}
              >
                <img
                  src="/ddukddak-logo.png" 
                  alt="DDUKDDAK" 
                  style={{ height: '16px', objectFit: 'contain' }} 
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="h-6 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 border border-purple-600 shadow-sm"></div>
                  <p className="text-slate-600 font-medium text-sm">
                    <span className="text-pink-600 font-semibold">{user.nickname}</span>님
                  </p>
                </div>
              </div>
            </div>

            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              {/* 임시 저장 페이지 버튼 */}
              <button
                onClick={() => navigate('/dashboard/drafts')}
                className="px-4 py-2 bg-white text-slate-600 hover:text-amber-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-amber-200 flex items-center gap-2 group"
              >
                <div className="w-5 h-5 bg-gradient-to-r from-sky-200 to-blue-200 rounded flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                임시 저장
                <span className="px-2 py-0.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
                  {myPages.filter((page) => page.status === 'DRAFT').length}개
                </span>
              </button>

              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white text-slate-600 hover:text-red-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-red-200 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-sky-200 to-blue-200 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800">배포된 페이지</h2>
            <span className="px-3 py-1 bg-sky-100 text-sky-800 text-sm font-medium rounded-full">
              {deployedPages.length}개
            </span>
          </div>
        </div>

        {/* 페이지 목록 */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
          {pagesLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4">
              <div className="w-16 h-16 border-4 border-sky-200 border-t-blue-300 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">페이지를 불러오는 중...</p>
            </div>
          ) : (mobilePages.length === 0 && desktopPages.length === 0) ? (
            <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-slate-800 mb-2">배포된 페이지가 없습니다</p>
              <p className="text-slate-600 mb-4">페이지를 만들어서 배포해보세요</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-gradient-to-r from-sky-200 to-blue-200 text-sky-800 rounded-xl font-medium hover:from-sky-300 hover:to-blue-300 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 모바일 페이지 섹션 */}
              {mobilePages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">모바일 페이지</h4>
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full">
                      {mobilePages.length}개
                    </span>
                  </div>
                  <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                    {mobilePages.map((page) => (
                      <PageCard key={page.id} page={page} isMobile={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* 구분선 */}
              {mobilePages.length > 0 && desktopPages.length > 0 && (
                <div className="flex items-center gap-4 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span className="text-sm font-medium text-slate-600">데스크톱 페이지</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                </div>
              )}

              {/* 데스크톱 페이지 섹션 */}
              {desktopPages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">데스크톱 페이지</h4>
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-sm font-medium rounded-full">
                      {desktopPages.length}개
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {desktopPages.map((page) => (
                      <PageCard key={page.id} page={page} isMobile={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                페이지 삭제
              </h3>
              <p className="text-slate-600 mb-6">
                <span className="font-medium text-slate-800">
                  "{deleteModal.title}"
                </span>{' '}
                페이지를 삭제하시겠습니까?
                <br />
                <span className="text-sm text-red-600">
                  이 작업은 되돌릴 수 없습니다.
                </span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDeletePage}
                  className="flex-1 px-4 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 참석 의사 확인 모달 */}
      {attendanceModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">
                참석 의사 확인 - {attendanceModal.title}
              </h3>
              <button
                onClick={closeAttendanceModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {attendanceModal.loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">참석 데이터를 불러오는 중...</p>
              </div>
            ) : attendanceModal.attendanceData.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v1M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <p className="font-medium text-slate-800 mb-2">아직 참석 의사가 전달되지 않았습니다</p>
                <p className="text-slate-600">참석자들이 의사를 전달하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {attendanceModal.attendanceData.map((componentData, index) => (
                  <div key={componentData.componentId} className="border border-slate-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {componentData.componentTitle}
                      <span className="text-sm bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                        {componentData.submissions.length}명 참석
                      </span>
                    </h4>

                    {componentData.submissions.length === 0 ? (
                      <p className="text-slate-500 italic">아직 참석 의사가 전달되지 않았습니다.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="text-left p-3 font-semibold text-slate-700">참석자</th>
                              <th className="text-left p-3 font-semibold text-slate-700">구분</th>
                              <th className="text-left p-3 font-semibold text-slate-700">인원</th>
                              <th className="text-left p-3 font-semibold text-slate-700">연락처</th>
                              <th className="text-left p-3 font-semibold text-slate-700">동행인</th>
                              <th className="text-left p-3 font-semibold text-slate-700">식사</th>
                              <th className="text-left p-3 font-semibold text-slate-700">등록일</th>
                            </tr>
                          </thead>
                          <tbody>
                            {componentData.submissions.map((submission, idx) => (
                              <tr key={submission.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-3 font-medium text-slate-800">{submission.attendeeName}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    submission.guestSide === '신부측' 
                                      ? 'bg-pink-100 text-pink-700' 
                                      : 'bg-pink-100 text-pink-700'
                                  }`}>
                                    {submission.guestSide}
                                  </span>
                                </td>
                                <td className="p-3">{submission.attendeeCount}명</td>
                                <td className="p-3 text-slate-600">{submission.contact || '-'}</td>
                                <td className="p-3">{submission.companionCount}명</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    submission.mealOption === '식사함' 
                                      ? 'bg-purple-200 text-purple-700' 
                                      : submission.mealOption === '식사안함'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {submission.mealOption || '미정'}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600">
                                  {new Date(submission.createdAt).toLocaleDateString('ko-KR')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* 통계 요약 */}
                    {componentData.submissions.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {componentData.submissions.length}
                          </div>
                          <div className="text-sm text-slate-600">총 참석자</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {componentData.submissions.filter(s => s.guestSide === '신부측').length}
                          </div>
                          <div className="text-sm text-slate-600">신부측</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">
                            {componentData.submissions.filter(s => s.guestSide === '신랑측').length}
                          </div>
                          <div className="text-sm text-slate-600">신랑측</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {componentData.submissions.reduce((sum, s) => sum + (s.attendeeCount || 0) + (s.companionCount || 0), 0)}
                          </div>
                          <div className="text-sm text-slate-600">총 인원</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={closeAttendanceModal}
                    className="px-6 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeployedPage; 