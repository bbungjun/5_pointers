import React from 'react';

function WeddingContactThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 8
    }}>
      {/* 상단 - 신랑/신부 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 4
      }}>
        {/* 신랑 */}
        <div style={{
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 7,
            color: '#64748b',
            marginBottom: 2
          }}>
            신랑
          </div>
          <div style={{
            fontSize: 8,
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: 2
          }}>
            홍길동
          </div>
          {/* 연락처 아이콘들 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3
          }}>
            <div style={{
              width: 8,
              height: 8,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 4
            }}>
              📞
            </div>
            <div style={{
              width: 8,
              height: 8,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 4
            }}>
              💬
            </div>
          </div>
        </div>
        
        {/* 신부 */}
        <div style={{
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: 7,
            color: '#64748b',
            marginBottom: 2
          }}>
            신부
          </div>
          <div style={{
            fontSize: 8,
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: 2
          }}>
            김영희
          </div>
          {/* 연락처 아이콘들 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3
          }}>
            <div style={{
              width: 8,
              height: 8,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 4
            }}>
              📞
            </div>
            <div style={{
              width: 8,
              height: 8,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 4
            }}>
              💬
            </div>
          </div>
        </div>
      </div>
      
      {/* 하단 - 부모님들 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 6
      }}>
        {/* 신랑 측 부모님 */}
        <div style={{
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            color: '#64748b',
            marginBottom: 1
          }}>
            아버지 어머니
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}>
            <div style={{
              width: 6,
              height: 6,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1
            }}></div>
            <div style={{
              width: 6,
              height: 6,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1
            }}></div>
          </div>
        </div>
        
        {/* 신부 측 부모님 */}
        <div style={{
          flex: 1,
          textAlign: 'center'
        }}>
          <div style={{
            color: '#64748b',
            marginBottom: 1
          }}>
            아버지 어머니
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}>
            <div style={{
              width: 6,
              height: 6,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1
            }}></div>
            <div style={{
              width: 6,
              height: 6,
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeddingContactThumbnail;
