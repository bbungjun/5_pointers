import React from 'react';

function GridGalleryThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 8
    }}>
      {/* 2x2 그리드 (크기 확대) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 4,
        width: 64,  // 48 → 64로 확대
        height: 48  // 36 → 48로 확대
      }}>
        {/* 그리드 셀 1 */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* 산 모양 + 태양 아이콘 */}
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* 산 모양 */}
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '3px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              left: 2
            }}></div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '1.5px solid transparent',
              borderRight: '1.5px solid transparent',
              borderBottom: '2px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              right: 2
            }}></div>
            
            {/* 태양 */}
            <div style={{
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              position: 'absolute',
              top: 1,
              right: 1
            }}></div>
          </div>
        </div>
        
        {/* 그리드 셀 2 */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '3px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              left: 2
            }}></div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '1.5px solid transparent',
              borderRight: '1.5px solid transparent',
              borderBottom: '2px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              right: 2
            }}></div>
            <div style={{
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              position: 'absolute',
              top: 1,
              right: 1
            }}></div>
          </div>
        </div>
        
        {/* 그리드 셀 3 */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '3px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              left: 2
            }}></div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '1.5px solid transparent',
              borderRight: '1.5px solid transparent',
              borderBottom: '2px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              right: 2
            }}></div>
            <div style={{
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              position: 'absolute',
              top: 1,
              right: 1
            }}></div>
          </div>
        </div>
        
        {/* 그리드 셀 4 */}
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: 12,
            height: 12,
            backgroundColor: '#e5e7eb',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '2px solid transparent',
              borderRight: '2px solid transparent',
              borderBottom: '3px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              left: 2
            }}></div>
            <div style={{
              width: 0,
              height: 0,
              borderLeft: '1.5px solid transparent',
              borderRight: '1.5px solid transparent',
              borderBottom: '2px solid #9ca3af',
              position: 'absolute',
              bottom: 1,
              right: 2
            }}></div>
            <div style={{
              width: 2,
              height: 2,
              borderRadius: '50%',
              backgroundColor: '#fbbf24',
              position: 'absolute',
              top: 1,
              right: 1
            }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GridGalleryThumbnail;
