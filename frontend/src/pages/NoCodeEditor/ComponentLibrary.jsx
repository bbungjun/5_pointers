import React, { useState } from 'react';
import { ComponentList } from '../components/definitions';
import ButtonRenderer from './ComponentRenderers/ButtonRenderer';
import TextRenderer from './ComponentRenderers/TextRenderer';
import LinkRenderer from './ComponentRenderers/LinkRenderer';
import AttendRenderer from './ComponentRenderers/AttendRenderer';
import DdayRenderer from './ComponentRenderers/DdayRenderer';
import WeddingContactRenderer from './ComponentRenderers/WeddingContactRenderer';

function ComponentLibrary({ onDragStart, components, roomId }) {
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domainName, setDomainName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 컴포넌트 타입별 아이콘
  const getComponentIcon = (type) => {
    const icons = {
      button: '🔘',
      text: '📝',
      link: '🔗',
      map: '🗺️',
      attend: '✅',
      image: '🖼️',
      dday: '📅',
      weddingContact: '💒'
    };
    return icons[type] || '📦';
  };

  // 배포 핸들러
  const handleDeploy = async () => {
    if (!domainName.trim()) {
      setShowDomainInput(true);
      return;
    }
    
    setIsDeploying(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/users/pages/${roomId}/deploy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          components: components || [],
          domain: domainName.trim()
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeployedUrl(`http://${domainName.trim()}.localhost:3001`);
        setShowDomainInput(false);
        alert(`배포 완료! 도메인: ${domainName.trim()}`);
      } else {
        throw new Error('배포 실패');
      }
    } catch (error) {
      console.error('배포 실패:', error);
      alert('배포에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div style={{
      width: 240,
      background: '#ffffff',
      borderRight: '1px solid #e1e5e9',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '2px 0 8px rgba(0,0,0,0.05)'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 8
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#3B4EFF',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff'
          }}>
            📦
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: '#1d2129',
              letterSpacing: '0.3px'
            }}>
              Components
            </h3>
            <div style={{
              fontSize: 12,
              color: '#65676b',
              marginTop: 2
            }}>
              {ComponentList.length} components available
            </div>
          </div>
        </div>
      </div>

      {/* 검색 입력 */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e1e5e9' }}>
        <input
          type="text"
          placeholder="원하는 기능을 검색하세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e1e5e9',
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* 컴포넌트 리스트 */}
      <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}>
        {ComponentList
          .filter(comp => 
            (comp.label && comp.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (comp.type && comp.type.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map(comp => {
        const renderIcon = () => {
          switch (comp.type) {
            case 'button':
              return (
                <div style={{
                  width: 60, height: 24, background: '#3B4EFF', color: '#fff',
                  borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 'bold'
                }}>
                  Button
                </div>
              );
            case 'text':
              return (
                <div style={{
                  fontSize: 12, color: '#333', fontWeight: 'normal',
                  textAlign: 'center', lineHeight: 1.2
                }}>
                  Sample Text
                </div>
              );
            case 'link':
              return (
                <div style={{
                  fontSize: 12, color: '#3B4EFF', textDecoration: 'underline',
                  textAlign: 'center'
                }}>
                  Link Text
                </div>
              );
            case 'attend':
              return (
                <div style={{
                  width: 80, height: 60, background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', fontSize: 8,
                  color: '#666', textAlign: 'center', lineHeight: 1.2
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2 }}>참석 의사</div>
                  <div style={{ background: '#3B4EFF', color: '#fff', padding: '2px 6px', borderRadius: 2, fontSize: 7 }}>전달하기</div>
                </div>
              );
            case 'dday':
              return (
                <div style={{
                  width: 70, height: 50, background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', fontSize: 8,
                  color: '#666', textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: 10 }}>D-DAY</div>
                  <div style={{ fontSize: 12, fontWeight: 'bold', color: '#3B4EFF' }}>-30</div>
                </div>
              );
            case 'weddingContact':
              return (
                <div style={{
                  width: 80, height: 50, background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', fontSize: 7,
                  color: '#666', textAlign: 'center', lineHeight: 1.2
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 2 }}>연락처</div>
                  <div>📞 010-1234-5678</div>
                </div>
              );
            case 'map':
              return (
                <div style={{
                  width: 70, height: 50, background: '#e8f5e8', border: '1px solid #4CAF50',
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20
                }}>
                  🗺️
                </div>
              );
            case 'calendar':
              return (
                <div style={{
                  width: 80, height: 60, background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', fontSize: 8,
                  color: '#666', textAlign: 'center', lineHeight: 1.2
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>📅</div>
                  <div style={{ fontWeight: 'bold', fontSize: 7 }}>Wedding Calendar</div>
                </div>
              );
            case 'bankAccount':
              return (
                <div style={{
                  width: 80, height: 60, background: '#fff', border: '1px solid #ddd',
                  borderRadius: 6, padding: 4, display: 'flex', flexDirection: 'column',
                  justifyContent: 'center', alignItems: 'center', gap: 2, fontSize: 6, lineHeight: 1.1
                }}>
                  <div style={{
                    background: '#f3f4f6', borderRadius: 3, padding: '2px 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',

                  }}>
                    <span style={{ fontSize: 6, color: '#374151' }}>신랑 측 계좌</span>
                    <span style={{ fontSize: 5 }}>▼</span>
                  </div>
                  <div style={{
                    background: '#f3f4f6', borderRadius: 3, padding: '2px 4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: 6, color: '#374151' }}>신부 측 계좌</span>
                    <span style={{ fontSize: 5 }}>▼</span>
                  </div>
                </div>
              );
            default:
              return <span style={{ fontSize: 12 }}>{comp.label}</span>;
          }
        };

        return (
          <div
            key={comp.type}
            draggable
            onDragStart={e => onDragStart(e, comp.type)}
            style={{
              width: '100%', marginBottom: 8, padding: 12,
              background: '#fff', borderRadius: 8,
              cursor: 'grab', boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              border: '1px solid #eee',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              fontSize: 9, fontWeight: 600, color: '#888',
              marginBottom: 8, textAlign: 'center', textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {comp.label}
            </div>
            <div style={{
              height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8f9fa', borderRadius: 4
            }}>
              {renderIcon()}
            </div>
          </div>
        );
      })}
      
      {ComponentList
        .filter(comp => 
          (comp.label && comp.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (comp.type && comp.type.toLowerCase().includes(searchTerm.toLowerCase()))
        ).length === 0 && searchTerm && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#65676b',
          fontSize: 14
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
          No components found for "{searchTerm}"
        </div>
      )}
      </div>

      {/* 배포 섹션 */}
      <div style={{ 
        padding: '20px 24px',
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#fafbfc'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#00b894',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: '#fff'
          }}>
            🚀
          </div>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 600,
              color: '#1d2129',
              letterSpacing: '0.3px'
            }}>
              Deploy Site
            </h4>
            <div style={{
              fontSize: 11,
              color: '#65676b',
              marginTop: 2
            }}>
              {components ? components.length : 0} components ready
            </div>
          </div>
        </div>
        
        {showDomainInput && (
          <div style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Enter domain name"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3B4EFF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e1e5e9';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleDeploy();
                }
              }}
              autoFocus
            />
            <div style={{ 
              fontSize: 10, 
              color: '#65676b', 
              marginTop: 6,
              lineHeight: 1.4
            }}>
              Your site will be available at:<br />
              <strong>{domainName || 'your-domain'}.localhost:3001</strong>
            </div>
          </div>
        )}
        
        <button
          onClick={handleDeploy}
          disabled={isDeploying || (components && components.length === 0)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isDeploying ? '#e1e5e9' : '#00b894',
            color: isDeploying ? '#65676b' : '#ffffff',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: isDeploying ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: '0.3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
          onMouseEnter={(e) => {
            if (!isDeploying) {
              e.target.style.background = '#00a085';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeploying) {
              e.target.style.background = '#00b894';
            }
          }}
        >
          {isDeploying ? (
            <>
              <span style={{ fontSize: 14 }}>⏳</span>
              Deploying...
            </>
          ) : (
            <>
              <span style={{ fontSize: 14 }}>🚀</span>
              Deploy Site
            </>
          )}
        </button>
        
        {deployedUrl && (
          <div style={{
            marginTop: 16,
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: 6,
            border: '1px solid #c8e6c9',
            fontSize: 11,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#2e7d32',
              marginBottom: 6
            }}>
              ✅ Deployed Successfully!
            </div>
            <a 
              href={deployedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#1976d2', 
                textDecoration: 'underline',
                wordBreak: 'break-all',
                fontSize: 10
              }}
            >
              {deployedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComponentLibrary; 