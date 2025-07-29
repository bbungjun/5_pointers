import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import InvitationNotifications from '../components/InvitationNotifications';
import NotificationToggle from '../components/NotificationToggle';
import TemplateCanvasPreview from '../components/TemplateCanvasPreview';
import { getUserColor } from '../utils/userColors';
import { getCurrentUser } from '../utils/userUtils';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

function randomId() {
  return Math.random().toString(36).substring(2, 10);
}

function DashboardPage({ user, onLogout }) {
  // Toast 함수들
  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const showSuccess = (message) => showToast(message, 'success');
  const showError = (message) => showToast(message, 'error');

  const closeToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  const navigate = useNavigate();
  const [myPages, setMyPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalPages: 0, deployedPages: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    pageId: null,
    title: '',
  });

  // 모바일과 데스크톱 템플릿 상태
  const [mobileTemplates, setMobileTemplates] = useState([]);
  const [desktopTemplates, setDesktopTemplates] = useState([]);

  // 전체 템플릿 데이터 (페이지네이션용)
  const [allMobileTemplates, setAllMobileTemplates] = useState([]);
  const [allDesktopTemplates, setAllDesktopTemplates] = useState([]);

  // 페이지네이션 상태
  const [mobileCurrentPage, setMobileCurrentPage] = useState(1);
  const [mobileTotalPages, setMobileTotalPages] = useState(1);
  const [mobileTotalCount, setMobileTotalCount] = useState(0);
  const [desktopCurrentPage, setDesktopCurrentPage] = useState(1);
  const [desktopTotalPages, setDesktopTotalPages] = useState(1);
  const [desktopTotalCount, setDesktopTotalCount] = useState(0);

  // 특정 기기 선택 시 페이지네이션 상태
  const [specificCurrentPage, setSpecificCurrentPage] = useState(1);
  const [specificTotalPages, setSpecificTotalPages] = useState(1);
  const [specificTotalCount, setSpecificTotalCount] = useState(0);
  const [allSpecificTemplates, setAllSpecificTemplates] = useState([]);

  const mobileItemsPerPage = 5;
  const desktopItemsPerPage = 8;
  const specificItemsPerPage = 8;

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'wedding', label: '웨딩' },
    { value: 'birthday', label: '생일' },
    { value: 'dol', label: '돌잔치' },
    { value: 'pet', label: '반려동물' },
    { value: 'etc', label: '기타' },
  ];

  const deviceTypes = [
    { value: 'all', label: '전체' },
    { value: 'mobile', label: '모바일' },
    { value: 'desktop', label: '데스크톱' },
  ];

  // 모바일 템플릿 조회
  const fetchMobileTemplates = async (category = 'all', page = 1) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/templates`;
      const params = [];

      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      params.push(`editingMode=mobile`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const uniqueTemplates = (Array.isArray(data) ? data : []).filter(
          (template, index, arr) => {
            const firstIndex = arr.findIndex((t) => t.id === template.id);
            return firstIndex === index;
          }
        );

        // 클라이언트 사이드 페이지네이션
        const startIndex = (page - 1) * mobileItemsPerPage;
        const endIndex = startIndex + mobileItemsPerPage;
        const paginatedTemplates = uniqueTemplates.slice(startIndex, endIndex);

        setMobileTotalPages(
          Math.ceil(uniqueTemplates.length / mobileItemsPerPage)
        );
        setMobileTotalCount(uniqueTemplates.length);

        return paginatedTemplates;
      }
    } catch (error) {
      console.error('모바일 템플릿 조회 실패:', error);
    }
    return [];
  };

  // 데스크톱 템플릿 조회
  const fetchDesktopTemplates = async (category = 'all', page = 1) => {
    try {
      let url = `${API_BASE_URL}/templates`;
      const params = [];

      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      params.push(`editingMode=desktop`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const uniqueTemplates = (Array.isArray(data) ? data : []).filter(
          (template, index, arr) => {
            const firstIndex = arr.findIndex((t) => t.id === template.id);
            return firstIndex === index;
          }
        );

        // 클라이언트 사이드 페이지네이션
        const startIndex = (page - 1) * desktopItemsPerPage;
        const endIndex = startIndex + desktopItemsPerPage;
        const paginatedTemplates = uniqueTemplates.slice(startIndex, endIndex);

        setDesktopTotalPages(
          Math.ceil(uniqueTemplates.length / desktopItemsPerPage)
        );
        setDesktopTotalCount(uniqueTemplates.length);

        return paginatedTemplates;
      }
    } catch (error) {
      console.error('데스크톱 템플릿 조회 실패:', error);
    }
    return [];
  };

  // 통합 템플릿 조회 함수
  const fetchTemplates = async (category = 'all', device = 'all') => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/templates`;
      const params = [];

      if (category !== 'all') {
        params.push(`category=${category}`);
      }
      if (device !== 'all') {
        params.push(`editingMode=${device}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const uniqueTemplates = data.filter((template, index, arr) => {
          const firstIndex = arr.findIndex((t) => t.id === template.id);
          return firstIndex === index;
        });

        if (device === 'all') {
          // 모바일과 데스크톱 템플릿 분리
          const mobileData = uniqueTemplates.filter(
            (t) => t.editingMode === 'mobile'
          );
          const desktopData = uniqueTemplates.filter(
            (t) => t.editingMode === 'desktop'
          );



          // 전체 데이터 저장
          setAllMobileTemplates(mobileData);
          setAllDesktopTemplates(desktopData);

          // 모바일 페이지네이션
          const mobileStart = (mobileCurrentPage - 1) * mobileItemsPerPage;
          const mobileEnd = mobileStart + mobileItemsPerPage;
          const mobilePagedData = mobileData.slice(mobileStart, mobileEnd);
          setMobileTemplates(mobilePagedData);
          setMobileTotalPages(
            Math.ceil(mobileData.length / mobileItemsPerPage)
          );
          setMobileTotalCount(mobileData.length);

          // 데스크톱 페이지네이션
          const desktopStart = (desktopCurrentPage - 1) * desktopItemsPerPage;
          const desktopEnd = desktopStart + desktopItemsPerPage;
          const desktopPagedData = desktopData.slice(desktopStart, desktopEnd);
          setDesktopTemplates(desktopPagedData);
          setDesktopTotalPages(
            Math.ceil(desktopData.length / desktopItemsPerPage)
          );
          setDesktopTotalCount(desktopData.length);



          setTemplates([]); // 기존 templates는 비움
        } else {
          // 특정 기기 선택 시 페이지네이션 처리
          setAllSpecificTemplates(uniqueTemplates);
          setSpecificTotalCount(uniqueTemplates.length);
          setSpecificTotalPages(
            Math.ceil(uniqueTemplates.length / specificItemsPerPage)
          );

          // 첫 페이지 데이터 설정
          const startIndex = 0;
          const endIndex = specificItemsPerPage;
          const pagedData = uniqueTemplates.slice(startIndex, endIndex);
          setTemplates(pagedData);

          setMobileTemplates([]);
          setDesktopTemplates([]);
        }
      } else {
        console.error('템플릿 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('템플릿 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

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
        // 중복된 ID 제거 (같은 ID를 가진 첫 번째 항목만 유지)
        const uniquePages = data.filter((page, index, arr) => {
          const firstIndex = arr.findIndex((p) => p.id === page.id);
          return firstIndex === index;
        });
        setMyPages(uniquePages);
        
        // 사용자 통계 계산
        const totalPages = uniquePages.length;
        const deployedPages = uniquePages.filter(page => page.status === 'DEPLOYED').length;
        setUserStats({ totalPages, deployedPages });
      }
    } catch (error) {
      console.error('페이지 목록 조회 실패:', error);
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    // 필터가 변경되면 첫 페이지로 리셋
    setMobileCurrentPage(1);
    setDesktopCurrentPage(1);
    setSpecificCurrentPage(1);
    fetchTemplates(selectedCategory, selectedDevice);
    fetchMyPages();
  }, [selectedCategory, selectedDevice]);

  // 페이지 변경 시 템플릿 조회 (스크롤 위치 유지)
  useEffect(() => {
    // 필터 변경이 아닌 페이지 변경일 때만 실행
    if (mobileCurrentPage > 1 || desktopCurrentPage > 1) {
      // 페이지네이션 시에는 저장된 전체 데이터를 사용하여 스크롤 위치 유지
      if (selectedDevice === 'all') {
        // 모바일 페이지네이션
        const mobileStart = (mobileCurrentPage - 1) * mobileItemsPerPage;
        const mobileEnd = mobileStart + mobileItemsPerPage;
        const mobilePagedData = allMobileTemplates.slice(
          mobileStart,
          mobileEnd
        );
        setMobileTemplates(mobilePagedData);

        // 데스크톱 페이지네이션
        const desktopStart = (desktopCurrentPage - 1) * desktopItemsPerPage;
        const desktopEnd = desktopStart + desktopItemsPerPage;
        const desktopPagedData = allDesktopTemplates.slice(
          desktopStart,
          desktopEnd
        );
        setDesktopTemplates(desktopPagedData);
      }
    }
  }, [
    mobileCurrentPage,
    desktopCurrentPage,
    allMobileTemplates,
    allDesktopTemplates,
    selectedDevice,
  ]);

  // 페이지네이션 핸들러 (스크롤 위치 유지)
  const handlePageChange = (deviceType, newPage) => {
    // 현재 스크롤 위치 저장
    const scrollPosition = window.scrollY;

    // 페이지 변경
    if (deviceType === 'mobile') {
      setMobileCurrentPage(newPage);

      // 모바일 템플릿 데이터 업데이트
      const startIndex = (newPage - 1) * mobileItemsPerPage;
      const endIndex = startIndex + mobileItemsPerPage;
      const mobilePagedData = allMobileTemplates.slice(startIndex, endIndex);
      setMobileTemplates(mobilePagedData);
    } else if (deviceType === 'desktop') {
      setDesktopCurrentPage(newPage);

      // 데스크톱 템플릿 데이터 업데이트
      const startIndex = (newPage - 1) * desktopItemsPerPage;
      const endIndex = startIndex + desktopItemsPerPage;
      const desktopPagedData = allDesktopTemplates.slice(startIndex, endIndex);
      setDesktopTemplates(desktopPagedData);
    } else if (deviceType === 'specific') {
      setSpecificCurrentPage(newPage);

      // 특정 기기 템플릿 데이터 업데이트
      const startIndex = (newPage - 1) * specificItemsPerPage;
      const endIndex = startIndex + specificItemsPerPage;
      const specificPagedData = allSpecificTemplates.slice(
        startIndex,
        endIndex
      );
      setTemplates(specificPagedData);
    }

    // 다음 프레임에서 스크롤 위치 복원
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  };

  // 템플릿으로 페이지 생성
  const handleCreateFromTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('로그인이 필요합니다.');
        return;
      }

      // 템플릿으로 페이지 생성 API 사용
      const response = await fetch(
        `${API_BASE_URL}/templates/${template.id}/create-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `${template.name} 복사본`,
            subdomain: `template-${Date.now()}`,
          }),
        }
      );

      if (response.ok) {
        const newPage = await response.json();
        // 페이지 생성 후 통계 업데이트
        fetchMyPages();
        // URL 파라미터 없이 일반 페이지로 시작
        const url = `/editor/${newPage.id}`;
        navigate(url);
      } else {
        const errorData = await response.text();
        if (errorData.includes('페이지는 최대 10개까지만')) {
          showError('페이지는 최대 10개까지만 생성할 수 있습니다.');
        } else {
          showError('템플릿 페이지 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      showError('템플릿 페이지 생성에 실패했습니다.');
    }
  };

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
      // 제목 수정 실패 처리
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
        showSuccess('페이지가 삭제되었습니다.');
      }
    } catch (error) {
      console.error('페이지 삭제 실패:', error);
    }
  };

  const handleCreateNew = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subdomain: `page-${Date.now()}`,
          title: 'Untitled',
        }),
      });

      if (response.ok) {
        const newPage = await response.json();
        console.log('새 페이지 생성:', newPage);
        // 페이지 생성 후 통계 업데이트
        fetchMyPages();
        navigate(`/editor/${newPage.id}`);
      } else {
        const errorData = await response.text();
        if (errorData.includes('페이지는 최대 10개까지만')) {
          showError('페이지는 최대 10개까지만 생성할 수 있습니다.');
        } else {
          showError('페이지 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('페이지 생성 실패:', error);
      showError('페이지 생성에 실패했습니다.');
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #FF969A, #9E9EE6)',
        overflow: 'hidden',
      }}
    >
      {/* Flowing Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal flowing lines */}
        <div
          className="absolute top-1/4 left-0 w-full h-px bg-white/30 animate-pulse"
          style={{ animation: 'flow 8s ease-in-out infinite' }}
        ></div>
        <div
          className="absolute top-3/4 left-0 w-full h-px bg-white/30 animate-pulse"
          style={{ animation: 'flow 8s ease-in-out infinite 2s' }}
        ></div>
        <div
          className="absolute top-1/2 left-0 w-full h-px bg-white/20 animate-pulse"
          style={{ animation: 'flow 10s ease-in-out infinite 1s' }}
        ></div>

        {/* Curved flowing lines */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ animation: 'flow 12s ease-in-out infinite' }}
        >
          <path
            d="M0,200 Q300,150 600,200 T1200,200"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M0,400 Q400,350 800,400 T1600,400"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Floating Circles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left side circles */}
        <div
          className="absolute top-1/4 left-1/4"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          {/* Main colored circle */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300/40 to-purple-300/40"></div>
          {/* White border circle */}
          <div className="absolute -top-2 -left-2 w-20 h-20 rounded-full border border-white/30"></div>
          <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full border border-white/20"></div>
        </div>

        <div
          className="absolute top-2/3 left-1/6"
          style={{ animation: 'float 8s ease-in-out infinite 1s' }}
        >
          {/* Main colored circle */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200/30 to-purple-200/30"></div>
          {/* White border circle */}
          <div className="absolute -top-1 -left-1 w-14 h-14 rounded-full border border-white/25"></div>
          <div className="absolute -top-3 -left-3 w-18 h-18 rounded-full border border-white/15"></div>
        </div>

        {/* Right side circles */}
        <div
          className="absolute top-1/3 right-1/4"
          style={{ animation: 'float 7s ease-in-out infinite 2s' }}
        >
          {/* Main colored circle */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-300/40 to-pink-300/40"></div>
          {/* White border circle */}
          <div className="absolute -top-3 -left-3 w-26 h-26 rounded-full border border-white/30"></div>
          <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full border border-white/20"></div>
        </div>

        <div
          className="absolute bottom-1/4 right-1/6"
          style={{ animation: 'float 9s ease-in-out infinite 0.5s' }}
        >
          {/* Main colored circle */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30"></div>
          {/* White border circle */}
          <div className="absolute -top-2 -left-2 w-18 h-18 rounded-full border border-white/25"></div>
          <div className="absolute -top-4 -left-4 w-22 h-22 rounded-full border border-white/15"></div>
        </div>

        {/* Additional small circles */}
        <div
          className="absolute top-1/2 left-1/3"
          style={{ animation: 'float 5s ease-in-out infinite 1.5s' }}
        >
          <div className="w-6 h-6 rounded-full bg-white/20"></div>
          <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full border border-white/20"></div>
        </div>

        <div
          className="absolute bottom-1/3 right-1/3"
          style={{ animation: 'float 6s ease-in-out infinite 2.5s' }}
        >
          <div className="w-4 h-4 rounded-full bg-white/15"></div>
          <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full border border-white/15"></div>
        </div>
      </div>

      {/* Header */}
      <div
        className="bg-transparent relative z-10"
        style={{ position: 'relative', zIndex: 30 }}
      >
        <div className="max-w-8xl mx-auto px-7 py-3">
          <div className="flex justify-between items-center">
            {/* 좌측: 로고와 사용자명 */}
            <div className="flex items-center gap-6">
              <img
                src="/ddukddak-logo.png"
                alt="DDUKDDAK"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain',
                  maxWidth: '120px',
                }}
                className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => navigate('/dashboard')}
              />
            </div>

            {/* 우측: 마이페이지, 알림, 로그아웃 */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shadow-sm border"
                    style={{
                      backgroundColor: getUserColor(
                        getCurrentUser()?.id || user.id || user.email
                      ),
                      borderColor: getUserColor(
                        getCurrentUser()?.id || user.id || user.email
                      ),
                    }}
                  ></div>
                  <p className="text-white font-medium text-lg">
                    <span className="font-semibold" style={{ color: 'white' }}>
                      {user.nickname}
                    </span>
                    님
                  </p>
                </div>
              )}
              {/* 마이페이지 드롭다운 */}
              <div className="relative group">
                <button className="px-4 py-2 bg-white text-slate-600 hover:text-gray-600 rounded-lg transition-all duration-300 font-medium border border-slate-200 hover:border-gray-300 flex items-center gap-2 group">
                  마이페이지
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2 flex flex-col gap-1">
                    {' '}
                    {/* gap-1로 간격 최소화 */}
                    {/* 임시 저장 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/drafts')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">임시 저장</span>
                    </button>
                    {/* 배포된 페이지 버튼 */}
                    <button
                      onClick={() => navigate('/dashboard/deployed')}
                      className="w-full px-3 py-2 text-left text-slate-500 hover:text-black rounded-lg transition-all duration-300 font-medium hover:bg-blue-50 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                      <span className="truncate flex-1">배포된 페이지</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 알림 토글 */}
              <NotificationToggle />

              {/* 로그아웃 버튼 */}
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white font-medium rounded-lg transition-all duration-300 flex items-center gap-2 group"
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
      <div className="max-w-8xl mx-auto px-8 relative z-10">
        {/* 메인 헤더 */}
        <div className="text-center mb-8">
          <p className="text-3xl text-white font-light">
            사랑하는 사람들과 함께하는 특별한 순간
          </p>
        </div>

        {/* 테마 선택 섹션 */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 p-8 mb-12">
          {/* 필터 버튼들 - 테마/기기 선택을 상단으로 이동 */}
          <div className="flex flex-col gap-4 mb-8">
            {/* 테마 카테고리 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 min-w-fit">
                테마
              </span>
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-1.5 min-w-[70px] justify-center ${
                      selectedCategory === category.value
                        ? 'text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-gray-600'
                    }`}
                    style={
                      selectedCategory === category.value
                        ? { backgroundColor: '#7483D1' }
                        : {}
                    }
                  >
                    {category.value === 'all' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    )}
                    {category.value === 'wedding' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                    {category.value === 'birthday' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    )}
                    {category.value === 'dol' && (
                      <img
                        src="/icons/baby-icon.svg"
                        alt="아기"
                        className="w-3 h-3"
                      />
                    )}
                    {category.value === 'pet' && (
                      <img
                        src="/icons/dog2.svg"
                        alt="반려동물"
                        className="w-3 h-3"
                      />
                    )}
                    {category.value === 'etc' && (
                      <span className="text-sm">⋯</span>
                    )}
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
            {/* 디바이스 타입 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 min-w-fit">
                기기
              </span>
              <div className="flex gap-2">
                {deviceTypes.map((device) => (
                  <button
                    key={device.value}
                    onClick={() => setSelectedDevice(device.value)}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-1.5 min-w-[70px] justify-center ${
                      selectedDevice === device.value
                        ? 'text-white shadow-lg'
                        : 'bg-slate-100 text-slate-600 hover:bg-pink-50 hover:text-gray-600'
                    }`}
                    style={
                      selectedDevice === device.value
                        ? { backgroundColor: '#7483D1' }
                        : {}
                    }
                  >
                    {device.value === 'mobile' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
                        />
                      </svg>
                    )}
                    {device.value === 'desktop' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    {device.value === 'all' && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    )}
                    {device.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 템플릿 리스트 */}
          <div className="relative">
            {loading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-medium">
                  큐브 템플릿을 불러오는 중...
                </p>
              </div>
            ) : (selectedDevice === 'all' &&
                mobileTotalCount === 0 &&
                desktopTotalCount === 0) ||
              (selectedDevice === 'mobile' && templates.length === 0) ||
              (selectedDevice === 'desktop' && templates.length === 0) ? (
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="font-medium text-slate-800 mb-2">
                  이 테마의 큐브가 없습니다
                </p>
                <p className="text-slate-600">다른 테마를 선택해보세요</p>
              </div>
            ) : (
              <div className="space-y-8">
                {selectedDevice === 'all' ? (
                  <>
                    {/* 모바일 템플릿 섹션 */}
                    {mobileTemplates.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-pink-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
                              />
                            </svg>
                            <h4 className="text-lg font-bold text-slate-800">
                              모바일 템플릿
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {mobileTotalCount}개
                            </span>
                            {selectedCategory !== 'all' && (
                              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-sm font-medium rounded-full">
                                {
                                  categories.find(
                                    (cat) => cat.value === selectedCategory
                                  )?.label
                                }
                              </span>
                            )}
                          </div>

                          {/* 모바일 템플릿 페이지네이션 화살표 */}
                          {mobileTotalPages > 1 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handlePageChange(
                                    'mobile',
                                    Math.max(1, mobileCurrentPage - 1)
                                  )
                                }
                                disabled={mobileCurrentPage === 1}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  mobileCurrentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-gray-600 border border-gray-200 shadow-sm'
                                }`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>

                              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                {mobileCurrentPage} / {mobileTotalPages}
                              </span>

                              <button
                                onClick={() =>
                                  handlePageChange(
                                    'mobile',
                                    Math.min(
                                      mobileTotalPages,
                                      mobileCurrentPage + 1
                                    )
                                  )
                                }
                                disabled={
                                  mobileCurrentPage === mobileTotalPages
                                }
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  mobileCurrentPage === mobileTotalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-gray-600 border border-gray-200 shadow-sm'
                                }`}
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 w-full justify-items-center">
                          {mobileTemplates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => handleCreateFromTemplate(template)}
                              className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                              style={{ width: '240px' }}
                            >
                                                              <div className="p-3 flex flex-col items-center">
                                {/* 기기 타입과 테마 표시 */}
                                <div className="flex items-center gap-2 mb-2 self-start">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-blue-800">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                    모바일
                                  </div>
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {
                                      categories.find(
                                        (cat) => cat.value === template.category
                                      )?.label
                                    }
                                    {template.category === 'etc' && (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                {/* 템플릿 캔버스 미리보기 */}
                                <div
                                  className={`relative rounded-lg overflow-hidden ${
                                    template.editingMode === 'mobile'
                                      ? 'flex justify-center items-center' // 모바일: 중앙 정렬
                                      : 'aspect-video' // 데스크톱: 16:9 비율
                                  }`}
                                  style={
                                    template.editingMode === 'mobile'
                                      ? { width: '240px', height: '380px' }
                                      : {}
                                  }
                                >
                                  <TemplateCanvasPreview
                                    template={template}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <h4 className="font-bold text-slate-800 text-lg mb-0 text-center py-1 group-hover:text-gray-600 transition-colors">
                                  {template.name}
                                </h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 구분선 */}
                    {mobileTemplates.length > 0 &&
                      desktopTemplates.length > 0 && (
                        <div className="flex items-center gap-4 py-4">
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        </div>
                      )}

                    {/* 데스크톱 템플릿 섹션 */}
                    {desktopTemplates.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <h4 className="text-lg font-bold text-slate-800">
                              데스크톱 템플릿
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {desktopTotalCount}개
                            </span>
                            {selectedCategory !== 'all' && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                {
                                  categories.find(
                                    (cat) => cat.value === selectedCategory
                                  )?.label
                                }
                              </span>
                            )}
                          </div>

                          {/* 데스크톱 템플릿 페이지네이션 화살표 */}
                          {desktopTotalPages > 1 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handlePageChange(
                                    'desktop',
                                    Math.max(1, desktopCurrentPage - 1)
                                  )
                                }
                                disabled={desktopCurrentPage === 1}
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  desktopCurrentPage === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 shadow-sm'
                                }`}
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>

                              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                                {desktopCurrentPage} / {desktopTotalPages}
                              </span>

                              <button
                                onClick={() =>
                                  handlePageChange(
                                    'desktop',
                                    Math.min(
                                      desktopTotalPages,
                                      desktopCurrentPage + 1
                                    )
                                  )
                                }
                                disabled={
                                  desktopCurrentPage === desktopTotalPages
                                }
                                className={`p-2 rounded-lg transition-all duration-300 ${
                                  desktopCurrentPage === desktopTotalPages
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 border border-gray-200 shadow-sm'
                                }`}
                              >
                                <svg
                                  className="w-5 h-5"
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
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 w-full justify-items-center">
                          {desktopTemplates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => handleCreateFromTemplate(template)}
                              className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                              style={{ width: '240px' }}
                            >
                              <div className="p-3 flex flex-col items-center">
                                {/* 기기 타입과 테마 표시 */}
                                <div className="flex items-center gap-2 mb-2 self-start">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                        clipRule="evenodd"
                                      ></path>
                                    </svg>
                                    데스크톱
                                  </div>
                                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {
                                      categories.find(
                                        (cat) => cat.value === template.category
                                      )?.label
                                    }
                                    {template.category === 'etc' && (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                {/* 템플릿 캔버스 미리보기 */}
                                <div className="relative rounded-lg overflow-hidden mb-3">
                                  {template.editingMode === 'mobile' ? (
                                    // 모바일 고정 높이
                                    <div
                                      className="relative rounded-lg overflow-hidden"
                                      style={{
                                        width: '240px',
                                        height: '380px',
                                      }}
                                    >
                                      <TemplateCanvasPreview
                                        template={template}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    // 데스크톱만 배포된 페이지와 동일하게
                                    <div className="flex items-center justify-center">
                                      <div
                                        className="relative bg-gray-50 overflow-hidden rounded-lg border border-gray-200"
                                        style={{
                                          width: '220px',
                                          height: '150px',
                                        }}
                                      >
                                        <TemplateCanvasPreview
                                          template={template}
                                          className="w-full h-full"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <h4 className="font-bold text-slate-800 text-lg mb-1 text-center py-0 group-hover:text-gray-600 transition-colors">
                                  {template.name}
                                </h4>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // 특정 기기 선택 시 페이지네이션 포함
                  <div>
                    {/* 헤더와 페이지네이션 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        {selectedDevice === 'mobile' ? (
                          <>
                            <svg
                              className="w-5 h-5 text-pink-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"
                              />
                            </svg>
                            <h4 className="text-lg font-bold text-slate-800">
                              모바일 템플릿
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {mobileTotalCount}개
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            <h4 className="text-lg font-bold text-slate-800">
                              데스크톱 템플릿
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                              {desktopTotalCount}개
                            </span>
                          </>
                        )}
                      </div>

                      {/* 페이지네이션 화살표 */}
                      {((selectedDevice === 'mobile' && mobileTotalPages > 1) ||
                        (selectedDevice === 'desktop' &&
                          desktopTotalPages > 1)) && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (selectedDevice === 'mobile') {
                                handlePageChange(
                                  'mobile',
                                  Math.max(1, mobileCurrentPage - 1)
                                );
                              } else if (selectedDevice === 'desktop') {
                                handlePageChange(
                                  'desktop',
                                  Math.max(1, desktopCurrentPage - 1)
                                );
                              } else {
                                handlePageChange(
                                  'specific',
                                  Math.max(1, specificCurrentPage - 1)
                                );
                              }
                            }}
                            disabled={
                              (selectedDevice === 'mobile' &&
                                mobileCurrentPage === 1) ||
                              (selectedDevice === 'desktop' &&
                                desktopCurrentPage === 1) ||
                              (selectedDevice !== 'all' &&
                                specificCurrentPage === 1)
                            }
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              (selectedDevice === 'mobile' &&
                                mobileCurrentPage === 1) ||
                              (selectedDevice === 'desktop' &&
                                desktopCurrentPage === 1)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : `bg-white text-gray-700 hover:bg-${selectedDevice === 'mobile' ? 'purple' : 'purple'}-50 hover:text-${selectedDevice === 'mobile' ? 'purple' : 'purple'}-600 border border-gray-200 shadow-sm`
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>

                          <span className="text-sm text-gray-600 min-w-[60px] text-center">
                            {selectedDevice === 'mobile'
                              ? `${mobileCurrentPage} / ${mobileTotalPages}`
                              : selectedDevice === 'desktop'
                                ? `${desktopCurrentPage} / ${desktopTotalPages}`
                                : `${specificCurrentPage} / ${specificTotalPages}`}
                          </span>

                          <button
                            onClick={() => {
                              if (selectedDevice === 'mobile') {
                                handlePageChange(
                                  'mobile',
                                  Math.min(
                                    mobileTotalPages,
                                    mobileCurrentPage + 1
                                  )
                                );
                              } else if (selectedDevice === 'desktop') {
                                handlePageChange(
                                  'desktop',
                                  Math.min(
                                    desktopTotalPages,
                                    desktopCurrentPage + 1
                                  )
                                );
                              } else {
                                handlePageChange(
                                  'specific',
                                  Math.min(
                                    specificTotalPages,
                                    specificCurrentPage + 1
                                  )
                                );
                              }
                            }}
                            disabled={
                              (selectedDevice === 'mobile' &&
                                mobileCurrentPage === mobileTotalPages) ||
                              (selectedDevice === 'desktop' &&
                                desktopCurrentPage === desktopTotalPages) ||
                              (selectedDevice !== 'all' &&
                                specificCurrentPage === specificTotalPages)
                            }
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              (selectedDevice === 'mobile' &&
                                mobileCurrentPage === mobileTotalPages) ||
                              (selectedDevice === 'desktop' &&
                                desktopCurrentPage === desktopTotalPages)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : `bg-white text-gray-700 hover:bg-${selectedDevice === 'mobile' ? 'purple' : 'purple'}-50 hover:text-${selectedDevice === 'mobile' ? 'purple' : 'purple'}-600 border border-gray-200 shadow-sm`
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
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
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 px-4 w-full justify-items-center">
                      {templates.map((template) => (
                        <div
                          key={template.id}
                          onClick={() => handleCreateFromTemplate(template)}
                          className="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                          style={{ width: '260px' }}
                        >
                          <div className="p-3 flex flex-col items-center">
                            {/* 기기 타입과 테마 표시 */}
                            <div className="flex items-center gap-2 mb-2 self-start">
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  template.editingMode === 'mobile'
                                    ? 'bg-pink-100 text-pink-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  {template.editingMode === 'mobile' ? (
                                    <path
                                      fillRule="evenodd"
                                      d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"
                                      clipRule="evenodd"
                                    ></path>
                                  ) : (
                                    <path
                                      fillRule="evenodd"
                                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                                      clipRule="evenodd"
                                    ></path>
                                  )}
                                </svg>
                                {template.editingMode === 'mobile'
                                  ? '모바일'
                                  : '데스크톱'}
                              </div>
                              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {
                                  categories.find(
                                    (cat) => cat.value === template.category
                                  )?.label
                                }
                                {template.category === 'etc' && (
                                  <svg
                                    className="w-3 h-3 ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            {/* 템플릿 캔버스 미리보기 */}
                            <div className="relative rounded-lg overflow-hidden mb-2">
                              {template.editingMode === 'mobile' ? (
                                // 모바일 고정 높이
                                <div
                                  className="relative rounded-lg overflow-hidden"
                                  style={{
                                    width: '240px',
                                    height: '380px',
                                  }}
                                >
                                  <TemplateCanvasPreview
                                    template={template}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                // 데스크톱만 배포된 페이지와 동일하게
                                <div className="flex items-center justify-center">
                                  <div
                                    className="relative bg-gray-50 overflow-hidden rounded-lg border border-gray-200"
                                    style={{
                                      width: '220px',
                                      height: '150px',
                                    }}
                                  >
                                    <TemplateCanvasPreview
                                      template={template}
                                      className="w-full h-full"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <h4 className="font-bold text-slate-800 text-base mb-1 group-hover:text-gray-600 transition-colors">
                              {template.name}
                            </h4>
                            <div className="flex items-center justify-between"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 빈 큐브로 시작하기 섹션 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 relative border border-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transform rotate-45"
                  style={{ backgroundColor: '#7483D1', opacity: 0.1 }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#7483D1' }}
                  >
                    <svg
                      className="w-4 h-4 text-white -rotate-45"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  빈 캔버스로 시작하기
                </h3>
              </div>
              <p className="text-slate-600 ml-15">
                자유롭게 나만의 이벤트 페이지를 만들어보세요
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="pl-6 pr-4 py-4 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl border-0 flex items-center gap-2 text-white"
              style={{
                backgroundColor: '#7483D1',
              }}
            >
              지금 만들기
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-pink-600"
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
                <span className="text-sm text-pink-600">
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
                  className="flex-1 px-4 py-3 text-white bg-pink-500 hover:bg-pink-600 rounded-xl font-medium transition-colors"
                >
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes flow {
          0%,
          100% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>

      {/* Footer */}
      <Footer />

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={closeToast}
        autoClose={true}
        duration={3000}
      />
    </div>
  );
}

export default DashboardPage;
