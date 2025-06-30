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
      width: 180, background: '#3B4EFF', color: '#fff', padding: 24,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      minHeight: '100vh'
    }}>
      <h3 style={{ marginBottom: 24, fontWeight: 900, letterSpacing: 2 }}>Components</h3>
      
      {/* 컴포넌트 리스트 */}
      {ComponentList.map(comp => {
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

      {/* 배포 섹션 */}
      <div style={{ 
        width: '100%', 
        marginTop: 'auto', 
        paddingTop: 24, 
        borderTop: '1px solid rgba(255,255,255,0.2)' 
      }}>
        <h4 style={{ 
          marginBottom: 16, 
          fontWeight: 700, 
          fontSize: 14,
          textAlign: 'center',
          letterSpacing: 1
        }}>
          🚀 DEPLOY
        </h4>
        
        {showDomainInput && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="원하는 도메인을 입력하세요"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px',
                outline: 'none',
                boxSizing: 'border-box'
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
              color: 'rgba(255,255,255,0.8)', 
              textAlign: 'center',
              marginBottom: 8 
            }}>
              도메인으로 사이트가 배포됩니다
            </div>
          </div>
        )}
        
        <button
          onClick={handleDeploy}
          disabled={isDeploying || (components && components.length === 0)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: isDeploying ? 'rgba(255,255,255,0.3)' : '#fff',
            color: isDeploying ? 'rgba(255,255,255,0.7)' : '#3B4EFF',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isDeploying ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            letterSpacing: 1
          }}
          onMouseEnter={(e) => {
            if (!isDeploying) {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.9)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeploying) {
              e.target.style.backgroundColor = '#fff';
            }
          }}
        >
          {isDeploying ? 'DEPLOYING...' : 'DEPLOY SITE'}
        </button>
        
        {deployedUrl && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            fontSize: '10px',
            textAlign: 'center'
          }}>
            <strong>배포 완료!</strong>
            <br />
            <a 
              href={deployedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#fff', 
                textDecoration: 'underline',
                wordBreak: 'break-all'
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