import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../config';

const PageNavigation = ({ currentPageId }) => {
  const [userPages, setUserPages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserPages();
  }, []);

  const fetchUserPages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/pages/my-pages?currentPageId=${currentPageId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserPages(data);
        // console.log('페이지 목록 조회 성공:', data.length, '개');
      } else {
        console.error('페이지 목록 조회 실패:', response.status);
      }
    } catch (error) {
      console.error('페이지 목록 조회 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSwitch = (pageId) => {
    if (pageId !== currentPageId) {
      // 같은 창에서 URL 변경
      window.location.href = `/editor/${pageId}`;
    }
    setIsDropdownOpen(false);
  };

  const currentPage = userPages.find(page => page.id === currentPageId);

  return React.createElement('div', {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, [
    React.createElement('div', {
      key: 'current-page-indicator'
    }, [
      React.createElement('button', {
        key: 'dropdown-trigger',
        onClick: () => setIsDropdownOpen(!isDropdownOpen),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '14px',
          fontWeight: '500'
        },
        onMouseEnter: (e) => {
          e.target.style.background = '#e9ecef';
          e.target.style.borderColor = '#007bff';
        },
        onMouseLeave: (e) => {
          e.target.style.background = '#f8f9fa';
          e.target.style.borderColor = '#e9ecef';
        }
      }, [
        React.createElement('span', { 
          key: 'icon',
          style: { fontSize: '16px' }
        }, '📄'),
        React.createElement('span', { 
          key: 'name',
          style: { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
        }, currentPage?.title || '페이지 선택'),
        React.createElement('span', { 
          key: 'count',
          style: { color: '#6c757d', fontSize: '12px' }
        }, `(${userPages.length})`),
        React.createElement('span', { 
          key: 'arrow',
          style: { fontSize: '12px', color: '#6c757d' }
        }, isDropdownOpen ? '▲' : '▼')
      ])
    ]),

    isDropdownOpen && React.createElement('div', {
      key: 'dropdown',
      style: {
        position: 'absolute',
        top: '100%',
        left: '0',
        right: '0',
        background: 'white',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '280px'
      }
    }, [
      React.createElement('div', {
        key: 'header',
        style: {
          padding: '12px 16px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#f8f9fa',
          fontSize: '12px',
          fontWeight: '600',
          color: '#495057',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }
      }, '연결된 페이지 목록'),

      isLoading ? React.createElement('div', {
        key: 'loading',
        style: {
          padding: '20px',
          textAlign: 'center',
          color: '#6c757d'
        }
      }, '로딩 중...') : userPages.length === 0 ? React.createElement('div', {
        key: 'empty',
        style: {
          padding: '24px',
          textAlign: 'center',
          color: '#6c757d'
        }
      }, [
        React.createElement('div', { 
          key: 'empty-icon',
          style: { fontSize: '32px', marginBottom: '8px' }
        }, '📄'),
        React.createElement('div', { 
          key: 'empty-text',
          style: { fontWeight: '500', marginBottom: '4px' }
        }, '페이지가 없습니다'),
        React.createElement('div', { 
          key: 'empty-hint',
          style: { fontSize: '12px', opacity: '0.8' }
        }, 'Page 컴포넌트를 드래그하여 새 페이지를 만드세요')
      ]) : userPages.map(page => 
        React.createElement('div', {
          key: page.id,
          onClick: () => handlePageSwitch(page.id),
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            backgroundColor: page.id === currentPageId ? '#e3f2fd' : 'transparent',
            color: page.id === currentPageId ? '#1976d2' : '#495057'
          },
          onMouseEnter: (e) => {
            if (page.id !== currentPageId) {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          },
          onMouseLeave: (e) => {
            if (page.id !== currentPageId) {
              e.target.style.backgroundColor = 'transparent';
            }
          }
        }, [
          React.createElement('div', {
            key: 'info',
            style: { flex: 1 }
          }, [
            React.createElement('div', {
              key: 'title',
              style: {
                fontWeight: '500',
                marginBottom: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }
            }, page.title),
            React.createElement('div', {
              key: 'meta',
              style: {
                fontSize: '11px',
                opacity: '0.7'
              }
            }, `${page.content?.metadata?.totalComponents || 0}개 컴포넌트`)
          ]),
          page.id === currentPageId && React.createElement('span', {
            key: 'current',
            style: { fontSize: '14px', color: '#1976d2' }
          }, '✓')
        ])
      )
    ])
  ]);
};

export default PageNavigation;
