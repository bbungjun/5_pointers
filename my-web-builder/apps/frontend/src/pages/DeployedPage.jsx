import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
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
  const [submissions, setSubmissions] = useState({});
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsModal, setSubmissionsModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
    data: null,
  });
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all', 'attendance', 'comment', 'other'
  // 페이지 submissions 데이터 조회
  const fetchPageSubmissions = async (pageId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 fetchPageSubmissions 시작:', { pageId, hasToken: !!token });
      
      if (!token) {
        console.log('❌ 토큰이 없어서 submissions 조회 실패');
        return null;
      }

      const url = `${API_BASE_URL}/users/pages/${pageId}/submissions`;
      console.log('🌐 API 호출 URL:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 API 응답 상태:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ submissions 데이터 조회 성공:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.log('❌ API 응답 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
      }
    } catch (error) {
      console.error('💥 Submissions 조회 중 예외 발생:', error);
    }
    return null;
  };

  // submissions 데이터 새로고침
  const refreshSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      
      const deployedPages = myPages.filter(page => page.isDeployed);
      if (deployedPages.length === 0) {
        console.log('🔄 배포된 페이지가 없어서 submissions 새로고침 건너뜀');
        return;
      }
      
      console.log('🔄 Submissions 데이터 새로고침 시작:', deployedPages.length, '개 페이지');
      
      // 기존 submissions 상태를 유지하면서 업데이트
      const currentSubmissions = { ...submissions };
      
      for (const page of deployedPages) {
        try {
          const pageSubmissions = await fetchPageSubmissions(page.id);
          if (pageSubmissions) {
            currentSubmissions[page.id] = pageSubmissions;
          }
        } catch (error) {
          console.error(`페이지 ${page.id} submissions 조회 실패:`, error);
          // 실패해도 기존 데이터 유지
        }
      }
      
      console.log('🔄 Submissions 데이터 새로고침 완료:', currentSubmissions);
      setSubmissions(currentSubmissions);
    } catch (error) {
      console.error('Submissions 새로고침 실패:', error);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // 내 페이지 목록 조회
  const fetchMyPages = async () => {
    try {
      setPagesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 모든 페이지 가져오기
      const response = await fetch(`${API_BASE_URL}/users/pages/my-pages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();

        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniquePages = data.filter((page, index, arr) => {
          const firstIndex = arr.findIndex((p) => p.id === page.id);
          return firstIndex === index;
        });

        // 배포된 페이지와 임시저장 페이지 분류
        const deployedPages = uniquePages.filter(page => page.status === 'DEPLOYED');
        const draftPages = uniquePages.filter(page => page.status === 'DRAFT');
        
        // 배포된 페이지의 제목 업데이트 (임시저장에서 배포한 경우 제목 가져오기)
        const updatedDeployedPages = deployedPages.map(deployedPage => {
          // 동일한 ID를 가진 임시저장 페이지 찾기
          const draftVersion = draftPages.find(draft => draft.originalPageId === deployedPage.id);
          
          // 임시저장 페이지가 있고 제목이 있는 경우 제목 업데이트
          if (draftVersion && draftVersion.title && (!deployedPage.title || deployedPage.title === '제목 없음')) {
            return { ...deployedPage, title: draftVersion.title };
          }
          return deployedPage;
        });
        
        // 업데이트된 페이지와 임시저장 페이지 합치기
        const mergedPages = [...updatedDeployedPages, ...draftPages];


        setMyPages(mergedPages);

        // 각 페이지의 submissions 데이터 조회
        const submissionsData = {};
        for (const page of updatedDeployedPages) {
          const pageSubmissions = await fetchPageSubmissions(page.id);
          if (pageSubmissions) {
            submissionsData[page.id] = pageSubmissions;
          }
        }
        setSubmissions(submissionsData);
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

  // 페이지 포커스 시 submissions 새로고침 (비활성화)
  // useEffect(() => {
  //   let focusTimeout;
    
  //   const handleFocus = () => {
  //     // 디바운스를 적용하여 너무 자주 호출되지 않도록 함
  //     clearTimeout(focusTimeout);
  //     focusTimeout = setTimeout(() => {
  //       console.log('🔄 페이지 포커스 - submissions 새로고침');
  //       if (myPages.length > 0) {
  //         refreshSubmissions();
  //       }
  //     }, 1000); // 1초 후에 실행
  //   };

  //   window.addEventListener('focus', handleFocus);
  //   return () => {
  //     window.removeEventListener('focus', handleFocus);
  //     clearTimeout(focusTimeout);
  //   };
  // }, [myPages]);

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

  // submissions 모달 열기
  const openSubmissionsModal = async (pageId, title) => {
    // 최신 submissions 데이터 가져오기
    const latestSubmissionData = await fetchPageSubmissions(pageId);
    
    if (latestSubmissionData) {
      // 전체 submissions 상태도 업데이트
      setSubmissions(prev => ({
        ...prev,
        [pageId]: latestSubmissionData
      }));
      
      setSubmissionsModal({
        isOpen: true,
        pageId,
        title,
        data: latestSubmissionData,
      });
    } else {
      // 기존 데이터 사용
      const submissionData = submissions[pageId];
      setSubmissionsModal({
        isOpen: true,
        pageId,
        title,
        data: submissionData,
      });
    }
  };

  // submissions 모달 닫기
  const closeSubmissionsModal = () => {
    setSubmissionsModal({
      isOpen: false,
      pageId: null,
      title: '',
      data: null,
    });
    setSelectedFilter('all'); // 필터 초기화
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
  const mobilePages = deployedPages.filter(
    (page) => page.editingMode === 'mobile'
  );
  const desktopPages = deployedPages.filter(
    (page) => page.editingMode === 'desktop'
  );
  // 페이지 카드 컴포넌트
  const PageCard = ({ page, isMobile = false }) => (
    <div
      key={page.id}
      className="bg-white border border-slate-400 rounded-xl p-6 hover:bg-blue-50 transition-all duration-300 group overflow-hidden h-full flex flex-col"
      style={{ minHeight: '520px' }}
    >
      {/* 미리보기 영역 */}
      <div className="mb-4 flex items-center justify-center">
        {isMobile ? (
          // 모바일 미리보기 - TemplateCanvasPreview가 자체 프레임을 제공
          <div className="flex items-center justify-center">
            <TemplateCanvasPreview
              template={page}
              className="w-full h-full"
            />
          </div>
        ) : (
          // 데스크톱 화면 프레임
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

      <div className="relative mb-4">
        <div className="pr-16"> {/* 오른쪽에 버튼 공간 확보 */}
          {editingId === page.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => saveEditTitle(page.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveEditTitle(page.id)}
              className="w-full px-3 py-2 text-lg font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 bg-white"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 w-full">
              {page.title || '제목 없음'}
            </h3>
          )}

          <p className="text-sm text-slate-600 mb-2">
            배포일:{' '}
            {new Date(page.deployedAt || page.updatedAt).toLocaleDateString()}
          </p>
          {page.subdomain && (
            <p className="text-sm text-slate-600 font-medium">
              도메인: {page.subdomain}.ddukddak.org
            </p>
          )}

          {/* Submissions 버튼 - 여기에는 아무것도 표시하지 않음 */}
        </div>
        {/* 편집/삭제 버튼을 절대 위치로 고정 */}
        <div className="absolute top-0 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startEditTitle(page.id, page.title)}
            className="p-2 text-slate-600 hover:bg-slate-300 rounded-lg"
            title="제목 수정"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => openDeleteModal(page.id, page.title)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
            title="삭제"
          >
            <svg
              className="w-4 h-4"
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
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {/* 제출된 응답 버튼 */}
        {(() => {
          const pageSubmissions = submissions[page.id];
          const hasSubmissions = pageSubmissions && pageSubmissions.totalCount > 0;
          const isLoading = submissionsLoading;
          
          // 로딩 중이거나 submissions 데이터가 있는 경우 버튼 표시
          if (isLoading || pageSubmissions) {
            return (
              <button
                onClick={hasSubmissions ? () => openSubmissionsModal(page.id, page.title) : undefined}
                disabled={!hasSubmissions || isLoading}
                className={`w-full py-2 px-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                  hasSubmissions && !isLoading
                    ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-500 shadow-sm hover:shadow cursor-pointer'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                <span className="font-medium flex items-center gap-2">
                  <svg className={`w-4 h-4 ${hasSubmissions ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  제출된 응답
                  {isLoading && <span className="text-xs">(로딩중...)</span>}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    hasSubmissions 
                      ? 'bg-slate-700 text-white' 
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    {pageSubmissions?.totalCount || 0}개
                  </span>
                  {hasSubmissions && !isLoading && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  )}
                </div>
              </button>
            );
          }
          
          return null;
        })()}
        
        {/* 바로가기/편집 버튼 */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => window.open(`https://${page.subdomain}.ddukddak.org`, '_blank')}
            className="flex-1 px-4 py-2 bg-slate-400 text-white rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            바로가기
          </button>
          <button
            onClick={() => {
              navigate(`/editor/${page.id}`);
            }}
            className="px-4 py-2 bg-white text-slate-600 border border-slate-400 rounded-lg font-medium hover:bg-blue-100 hover:border-slate-600 transition-all duration-200"
          >
            편집
          </button>
        </div>
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
                  style={{ height: '36px', objectFit: 'contain' }} 
                />
              </div>
            </div>
            {/* 우측 버튼 그룹 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 border border-purple-600 shadow-sm"></div>
                  <p className="text-slate-600 font-medium text-lg">
                    <span className="text-black font-semibold">{user.nickname}</span>님
                  </p>
              </div>
              <div className="relative group">
                <button className="px-4 py-2 bg-white text-slate-600 hover:text-gray-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-gray-300 flex items-center gap-2 group">
                  마이페이지
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* 드롭다운 메뉴 */}
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2 flex flex-col gap-1"> {/* gap-1로 간격 최소화 */}
                    {/* 임시 저장 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/drafts')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">
                        임시 저장
                      </span>
                    </button>
                    {/* 배포된 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/deployed')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">
                        배포된 페이지
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 font-medium rounded-lg transition-all duration-300 flex items-center gap-2 group"
                style={{ color: '#212455' }}
              >
                <svg
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
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
            <h2 className="text-5xl font-bold text-slate-800">배포된 페이지</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-1xl font-medium rounded-full">
              {deployedPages.length}개
            </span>
          </div>
        </div>
        {/* 페이지 목록 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {pagesLoading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">
                페이지를 불러오는 중...
              </p>
            </div>
          ) : mobilePages.length === 0 && desktopPages.length === 0 ? (
            <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200">
              <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="font-medium text-lg text-slate-800 mb-2">배포된 페이지가 없습니다</p>
              <p className="text-slate-600 mb-4">페이지를 만들어서 배포해보세요</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-200 text-slate-800 rounded-xl font-medium hover:bg-slate-600 hover:text-white transition-colors"
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
                    <svg className="w-5 h-5 text-[#FF9696]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">모바일 페이지</h4>
                    <span className="px-2 py-1 bg-[#FF9696] text-white text-sm font-medium rounded-full">
                      {mobilePages.length}개
                    </span>
                  </div>
                  <div className="mx-2 sm:mx-3 md:mx-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
                      {mobilePages.map((page) => (
                        <div className="w-full h-full" key={page.id}>
                          <PageCard page={page} isMobile={true} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* 구분선 */}
              {mobilePages.length > 0 && desktopPages.length > 0 && (
                <div className="flex items-center gap-4 py-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-600">
                      데스크톱 페이지
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                </div>
              )}
              {/* 데스크톱 페이지 섹션 */}
              {desktopPages.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <svg className="w-5 h-5 text-[#9E9EE6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h4 className="text-lg font-bold text-slate-800">데스크톱 페이지</h4>
                    <span className="px-2 py-1 bg-[#9E9EE6] text-white text-sm font-medium rounded-full">
                      {desktopPages.length}개
                    </span>
                  </div>
                  <div className="mx-2 sm:mx-3 md:mx-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-fr">
                      {desktopPages.map((page) => (
                        <div className="w-full h-full" key={page.id}>
                          <PageCard page={page} isMobile={false} />
                        </div>
                      ))}
                    </div>
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

      {/* Submissions 모달 */}
      {submissionsModal.isOpen && submissionsModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl max-h-[90vh] min-h-[300px] overflow-hidden border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-6 bg-slate-700 rounded-full"></span>
                    {selectedFilter === 'all' ? '제출된 응답' : 
                     selectedFilter === 'attendance' ? '참석/가입 응답' :
                     selectedFilter === 'comment' ? '댓글 응답' :
                     selectedFilter === 'other' ? '기타 응답' : '제출된 응답'}
                    {(() => {
                      const filteredSubmissions = submissionsModal.data.submissions.filter(submission => {
                        if (selectedFilter === 'all') return true;
                        
                        // 분류 로직 재사용
                        const isAttendance = (
                          submission.type === 'attendance' || 
                          submission.componentId?.includes('attend') ||
                          submission.componentId?.includes('Attend') ||
                          submission.data?.attendeeName ||
                          submission.data?.formType === 'wedding-attendance' ||
                          submission.data?.formType === 'birthday-party' ||
                          submission.data?.formType === 'club-application' ||
                          (submission.type === 'other' && (
                            submission.data?.attendeeName ||
                            submission.data?.guestSide ||
                            submission.data?.mealOption ||
                            submission.data?.companionCount !== undefined ||
                            submission.data?.studentId ||
                            submission.data?.major ||
                            submission.data?.motivation
                          ))
                        );
                        
                        const isComment = (
                          submission.type === 'comment' || 
                          submission.componentId?.includes('comment') ||
                          submission.componentId?.includes('Comment') ||
                          (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)
                        );
                        
                        if (selectedFilter === 'attendance') return isAttendance;
                        if (selectedFilter === 'comment') return isComment;
                        if (selectedFilter === 'other') return !isAttendance && !isComment;
                        
                        return true;
                      });
                      
                      return filteredSubmissions.length > 5 && (
                        <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                          스크롤하여 더 보기
                        </span>
                      );
                    })()}
                  </h3>
                  {(() => {
                    // 폼 타입 분석 (추론 로직 적용) - attendance와 other 타입 모두 포함
                    const attendanceSubmissions = submissionsModal.data.submissions.filter(s => s.type === 'attendance' || s.type === 'other');
                    const formTypes = attendanceSubmissions.map(submission => {
                      // formType 추론 로직
                      if (submission.data.formType) {
                        // club-registration을 club-application으로 변환
                        if (submission.data.formType === 'club-registration') {
                          return 'club-application';
                        }
                        return submission.data.formType;
                      }
                      
                      // 데이터 필드 기반으로 폼 타입 추론
                      if (submission.data.guestSide || submission.data.mealOption || submission.data.companionCount !== undefined) {
                        return 'wedding-attendance';
                      }
                      if (submission.data.studentId && submission.data.major && submission.data.motivation) {
                        return 'club-application';
                      }
                      if (submission.data.attendeeName && submission.data.attendeeCount) {
                        return 'general-attendance';
                      }
                      
                      return 'unknown';
                    });
                    
                    const uniqueFormTypes = [...new Set(formTypes.filter(Boolean))];
                    
                    if (uniqueFormTypes.length > 0) {
                      const formTypeLabels = uniqueFormTypes.map(type => {
                        switch(type) {
                          case 'wedding-attendance': return '결혼식 참석';
                          case 'birthday-party': return '생일파티 참석';
                          case 'club-application': return '동아리 가입';
                          case 'general-attendance': return '일반 참석';
                          case 'unknown': return '알 수 없음';
                          default: return type;
                        }
                      });
                      
                      return (
                        <p className="text-sm text-slate-600 mt-1">
                          폼 타입: {formTypeLabels.join(', ')}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openSubmissionsModal(submissionsModal.pageId, submissionsModal.title)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200"
                    title="새로고침"
                  >
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={closeSubmissionsModal}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 통계 요약 */}
              <div className="mt-6">
                {(() => {
                  // 폼 타입별 세분화된 통계 생성 - 모든 타입 포함
                  const allSubmissions = submissionsModal.data.submissions;
                  const formTypeStats = allSubmissions.reduce((acc, submission) => {
                    // 타입별 분류 로직
                    const getSubmissionCategory = (submission) => {
                      // 댓글 타입 먼저 확인
                      if (submission.type === 'comment' || 
                          submission.componentId?.includes('comment') ||
                          submission.componentId?.includes('Comment') ||
                          (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)) {
                        return 'comment';
                      }
                      
                      // AttendRenderer 관련 응답들
                      if (submission.type === 'attendance' || 
                          submission.componentId?.includes('attend') ||
                          submission.componentId?.includes('Attend') ||
                          submission.data?.attendeeName ||
                          submission.data?.formType === 'wedding-attendance' ||
                          submission.data?.formType === 'birthday-party' ||
                          submission.data?.formType === 'club-application' ||
                          (submission.type === 'other' && (
                            submission.data?.attendeeName ||
                            submission.data?.guestSide ||
                            submission.data?.mealOption ||
                            submission.data?.companionCount !== undefined ||
                            submission.data?.studentId ||
                            submission.data?.major ||
                            submission.data?.motivation
                          ))) {
                        // 세부 폼 타입 추론
                        if (submission.data?.formType) {
                          if (submission.data.formType === 'club-registration') {
                            return 'club-application';
                          }
                          return submission.data.formType;
                        }
                        
                        // 데이터 필드 기반으로 폼 타입 추론
                        if (submission.data?.guestSide || submission.data?.mealOption || submission.data?.companionCount !== undefined) {
                          return 'wedding-attendance';
                        }
                        if (submission.data?.studentId && submission.data?.major && submission.data?.motivation) {
                          return 'club-application';
                        }
                        if (submission.data?.attendeeName) {
                          return 'general-attendance';
                        }
                        
                        return 'attendance'; // 기본 참석 타입
                      }
                      
                      return 'other';
                    };
                    
                    const category = getSubmissionCategory(submission);
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                  }, {});
                  
                  const hasMultipleFormTypes = Object.keys(formTypeStats).length > 1;
                  
                  if (hasMultipleFormTypes) {
                    // 폼 타입이 여러 개인 경우: 세분화된 통계 표시
                    return (
                      <>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">폼 타입별 통계</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {Object.entries(formTypeStats).map(([formType, count]) => {
                            const getLabel = (type) => {
                              switch(type) {
                                case 'wedding-attendance': return '결혼식 참석';
                                case 'birthday-party': return '생일파티 참석';  
                                case 'club-application': return '동아리 가입';
                                case 'general-attendance': return '일반 참석';
                                case 'attendance': return '참석';
                                case 'comment': return '댓글';
                                case 'other': return '기타';
                                default: return type;
                              }
                            };
                            
                            return (
                              <div key={formType} className="bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                  <span className="text-xs font-medium text-blue-800">
                                    {getLabel(formType)}
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-blue-900 mt-1">
                                  {count}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">전체 통계</h4>
                      </>
                    );
                  }
                  return null;
                })()}
                
                {(() => {
                  // 동적으로 타입 재계산 - AttendRenderer 응답을 올바르게 분류
                  const recalculatedStats = submissionsModal.data.submissions.reduce((acc, submission) => {
                    // AttendRenderer 관련 응답 판별 로직 (위에서 사용한 것과 동일)
                    const isAttendanceSubmission = (
                      submission.type === 'attendance' || 
                      submission.componentId?.includes('attend') ||
                      submission.componentId?.includes('Attend') ||
                      submission.data?.attendeeName ||
                      submission.data?.formType === 'wedding-attendance' ||
                      submission.data?.formType === 'birthday-party' ||
                      submission.data?.formType === 'club-application' ||
                      (submission.type === 'other' && (
                        submission.data?.attendeeName ||
                        submission.data?.guestSide ||
                        submission.data?.mealOption ||
                        submission.data?.companionCount !== undefined ||
                        submission.data?.studentId ||
                        submission.data?.major ||
                        submission.data?.motivation
                      ))
                    );
                    
                    if (isAttendanceSubmission) {
                      acc.attendance = (acc.attendance || 0) + 1;
                    } else if (submission.type === 'comment' || 
                               submission.componentId?.includes('comment') ||
                               submission.componentId?.includes('Comment') ||
                               (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)) {
                      acc.comment = (acc.comment || 0) + 1;
                    } else {
                      acc.other = (acc.other || 0) + 1;
                    }
                    
                    return acc;
                  }, {});
                  
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div 
                        onClick={() => setSelectedFilter(selectedFilter === 'attendance' ? 'all' : 'attendance')}
                        className={`px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer ${
                          selectedFilter === 'attendance' 
                            ? 'bg-blue-100 border-2 border-blue-500 text-blue-800' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedFilter === 'attendance' ? 'bg-blue-600' : 'bg-slate-700'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            selectedFilter === 'attendance' ? 'text-blue-800' : 'text-slate-700'
                          }`}>
                            참석/가입
                          </span>
                        </div>
                        <p className={`text-xl font-semibold mt-1 ${
                          selectedFilter === 'attendance' ? 'text-blue-900' : 'text-slate-800'
                        }`}>
                          {recalculatedStats.attendance || 0}
                        </p>
                      </div>
                      <div 
                        onClick={() => setSelectedFilter(selectedFilter === 'comment' ? 'all' : 'comment')}
                        className={`px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer ${
                          selectedFilter === 'comment'
                            ? 'bg-green-100 border-2 border-green-500 text-green-800' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedFilter === 'comment' ? 'bg-green-600' : 'bg-slate-700'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            selectedFilter === 'comment' ? 'text-green-800' : 'text-slate-700'
                          }`}>
                            댓글
                          </span>
                        </div>
                        <p className={`text-xl font-semibold mt-1 ${
                          selectedFilter === 'comment' ? 'text-green-900' : 'text-slate-800'
                        }`}>
                          {recalculatedStats.comment || 0}
                        </p>
                      </div>
                      <div 
                        onClick={() => setSelectedFilter(selectedFilter === 'other' ? 'all' : 'other')}
                        className={`px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-200 cursor-pointer ${
                          selectedFilter === 'other'
                            ? 'bg-orange-100 border-2 border-orange-500 text-orange-800' 
                            : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedFilter === 'other' ? 'bg-orange-600' : 'bg-slate-700'
                          }`}></div>
                          <span className={`text-sm font-medium ${
                            selectedFilter === 'other' ? 'text-orange-800' : 'text-slate-700'
                          }`}>
                            기타
                          </span>
                        </div>
                        <p className={`text-xl font-semibold mt-1 ${
                          selectedFilter === 'other' ? 'text-orange-900' : 'text-slate-800'
                        }`}>
                          {recalculatedStats.other || 0}
                        </p>
                      </div>
                      <div 
                        onClick={() => setSelectedFilter('all')}
                        className={`px-4 py-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${
                          selectedFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-700 text-white hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          <span className="text-sm font-medium text-slate-100">
                            전체
                          </span>
                        </div>
                        <p className="text-xl font-semibold text-white mt-1">
                          {submissionsModal.data.totalCount}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div 
              className="overflow-y-auto overflow-x-hidden flex-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9',
                scrollBehavior: 'smooth'
              }}
            >
              <div className="px-6 py-4 space-y-4">
                {(() => {
                  // 필터에 따라 데이터 필터링
                  const filteredSubmissions = submissionsModal.data.submissions.filter(submission => {
                    if (selectedFilter === 'all') return true;
                    
                    // 분류 로직 재사용
                    const isAttendance = (
                      submission.type === 'attendance' || 
                      submission.componentId?.includes('attend') ||
                      submission.componentId?.includes('Attend') ||
                      submission.data?.attendeeName ||
                      submission.data?.formType === 'wedding-attendance' ||
                      submission.data?.formType === 'birthday-party' ||
                      submission.data?.formType === 'club-application' ||
                      (submission.type === 'other' && (
                        submission.data?.attendeeName ||
                        submission.data?.guestSide ||
                        submission.data?.mealOption ||
                        submission.data?.companionCount !== undefined ||
                        submission.data?.studentId ||
                        submission.data?.major ||
                        submission.data?.motivation
                      ))
                    );
                    
                    const isComment = (
                      submission.type === 'comment' || 
                      submission.componentId?.includes('comment') ||
                      submission.componentId?.includes('Comment') ||
                      (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)
                    );
                    
                    if (selectedFilter === 'attendance') return isAttendance;
                    if (selectedFilter === 'comment') return isComment;
                    if (selectedFilter === 'other') return !isAttendance && !isComment;
                    
                    return true;
                  });
                  
                  return filteredSubmissions.map((submission) => {
                  // formType이 없는 경우 데이터 기반으로 추론
                  const inferFormType = (submissionData) => {
                    if (submissionData.formType) {
                      // club-registration을 club-application으로 변환
                      if (submissionData.formType === 'club-registration') {
                        return 'club-application';
                      }
                      return submissionData.formType;
                    }
                    
                    // 데이터 필드 기반으로 폼 타입 추론
                    if (submissionData.guestSide || submissionData.mealOption || submissionData.companionCount !== undefined) {
                      return 'wedding-attendance'; // 결혼식 참석 (신랑/신부측, 식사여부, 동행인수)
                    }
                    if (submissionData.studentId && submissionData.major && submissionData.motivation) {
                      return 'club-application'; // 동아리 가입 (학번, 전공, 지원동기)
                    }
                    if (submissionData.attendeeName && submissionData.attendeeCount) {
                      return 'general-attendance'; // 일반 참석
                    }
                    
                    return null;
                  };
                  
                  const inferredFormType = inferFormType(submission.data);
                  
                  return (
                  <div
                    key={submission.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-medium border ${
                            submission.type === 'attendance'
                              ? 'border-slate-300 bg-slate-50 text-slate-700'
                              : submission.type === 'comment'
                                ? 'border-slate-300 bg-slate-50 text-slate-700'
                                : submission.type === 'slido'
                                  ? 'border-slate-300 bg-slate-50 text-slate-700'
                                  : submission.type === 'other'
                                    ? 'border-slate-300 bg-slate-50 text-slate-700'
                                    : 'border-slate-300 bg-slate-50 text-slate-700'
                          }`}
                        >
                          {(() => {
                            // AttendRenderer 관련 모든 응답을 참석/가입으로 통일
                            if (submission.type === 'attendance' || 
                                submission.componentId?.includes('attend') ||
                                submission.componentId?.includes('Attend') ||
                                submission.data?.attendeeName ||
                                submission.data?.formType === 'wedding-attendance' ||
                                submission.data?.formType === 'birthday-party' ||
                                submission.data?.formType === 'club-application' ||
                                (submission.type === 'other' && (
                                  submission.data?.attendeeName ||
                                  submission.data?.guestSide ||
                                  submission.data?.mealOption ||
                                  submission.data?.companionCount !== undefined ||
                                  submission.data?.studentId ||
                                  submission.data?.major ||
                                  submission.data?.motivation
                                ))) {
                              return '참석/가입';
                            } else if (submission.type === 'comment' || 
                                       submission.componentId?.includes('comment') ||
                                       submission.componentId?.includes('Comment') ||
                                       (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)) {
                              return '댓글';
                            } else {
                              return '기타';
                            }
                          })()}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {new Date(submission.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      {/* AttendRenderer 관련 모든 데이터 (attendance, other 타입 및 attendeeName이 있는 모든 데이터) */}
                      {(submission.type === 'attendance' || 
                        submission.componentId?.includes('attend') ||
                        submission.componentId?.includes('Attend') ||
                        submission.data?.attendeeName ||
                        submission.data?.formType === 'wedding-attendance' ||
                        submission.data?.formType === 'birthday-party' ||
                        submission.data?.formType === 'club-application' ||
                        (submission.type === 'other' && (
                          submission.data?.attendeeName ||
                          submission.data?.guestSide ||
                          submission.data?.mealOption ||
                          submission.data?.companionCount !== undefined ||
                          submission.data?.studentId ||
                          submission.data?.major ||
                          submission.data?.motivation
                        ))) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">이름</span>
                            <p className="font-medium">{submission.data.attendeeName}</p>
                          </div>
                          {submission.data.contact && (
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 mb-1">연락처</span>
                              <p className="font-medium">{submission.data.contact}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* 댓글 데이터 */}
                      {(submission.type === 'comment' || 
                        submission.componentId?.includes('comment') ||
                        submission.componentId?.includes('Comment') ||
                        (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">작성자</span>
                            <p className="font-medium">{submission.data.author}</p>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 mb-1">내용</span>
                            <p className="font-medium line-clamp-2">{submission.data.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                  });
                })()}
                
                {/* 필터링된 결과가 없을 때 */}
                {(() => {
                  const filteredSubmissions = submissionsModal.data.submissions.filter(submission => {
                    if (selectedFilter === 'all') return true;
                    
                    const isAttendance = (
                      submission.type === 'attendance' || 
                      submission.componentId?.includes('attend') ||
                      submission.componentId?.includes('Attend') ||
                      submission.data?.attendeeName ||
                      submission.data?.formType === 'wedding-attendance' ||
                      submission.data?.formType === 'birthday-party' ||
                      submission.data?.formType === 'club-application' ||
                      (submission.type === 'other' && (
                        submission.data?.attendeeName ||
                        submission.data?.guestSide ||
                        submission.data?.mealOption ||
                        submission.data?.companionCount !== undefined ||
                        submission.data?.studentId ||
                        submission.data?.major ||
                        submission.data?.motivation
                      ))
                    );
                    
                    const isComment = (
                      submission.type === 'comment' || 
                      submission.componentId?.includes('comment') ||
                      submission.componentId?.includes('Comment') ||
                      (submission.data?.author && submission.data?.content && !submission.data?.attendeeName)
                    );
                    
                    if (selectedFilter === 'attendance') return isAttendance;
                    if (selectedFilter === 'comment') return isComment;
                    if (selectedFilter === 'other') return !isAttendance && !isComment;
                    
                    return true;
                  });
                  
                  return filteredSubmissions.length === 0 && selectedFilter !== 'all' && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-600 font-medium">
                        {selectedFilter === 'attendance' ? '참석/가입' :
                         selectedFilter === 'comment' ? '댓글' :
                         selectedFilter === 'other' ? '기타' : ''} 응답이 없습니다.
                      </p>
                      <button
                        onClick={() => setSelectedFilter('all')}
                        className="mt-3 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                      >
                        전체 보기
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
              <button
                onClick={closeSubmissionsModal}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default DeployedPage;