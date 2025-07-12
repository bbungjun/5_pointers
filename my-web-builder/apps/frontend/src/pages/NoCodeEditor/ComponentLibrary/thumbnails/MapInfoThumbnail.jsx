import React from 'react';

function MapInfoThumbnail() {
  return (
    <div style={{
      width: 100,
      height: 75,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden'
    }}>
      {/* 첫 번째 섹션 - 지하철 안내 */}
      <div style={{
        paddingBottom: 4,
        borderBottom: '1px solid #eeeeee'
      }}>
        {/* 제목 (실제 텍스트) */}
        <div style={{
          fontSize: 7,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 2,
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          지하철 안내
        </div>
        {/* 설명 (회색 선들) */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '90%',
          marginBottom: 1
        }}></div>
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '75%'
        }}></div>
      </div>

      {/* 두 번째 섹션 - 버스 안내 */}
      <div style={{
        paddingBottom: 4,
        borderBottom: '1px solid #eeeeee'
      }}>
        {/* 제목 (실제 텍스트) */}
        <div style={{
          fontSize: 7,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 2,
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          버스 안내
        </div>
        {/* 설명 (회색 선들) */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '85%',
          marginBottom: 1
        }}></div>
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '70%'
        }}></div>
      </div>

      {/* 세 번째 섹션 - 주차 안내 */}
      <div>
        {/* 제목 (실제 텍스트) */}
        <div style={{
          fontSize: 7,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 2,
          fontFamily: 'Noto Sans KR, 맑은 고딕, Malgun Gothic, sans-serif'
        }}>
          주차 안내
        </div>
        {/* 설명 (회색 선) */}
        <div style={{
          height: 2,
          backgroundColor: '#d1d5db',
          borderRadius: 1,
          width: '80%'
        }}></div>
      </div>
    </div>
  );
}

export default MapInfoThumbnail;
