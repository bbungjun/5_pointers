import React from 'react';

function CalendarThumbnail() {
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
      padding: 6
    }}>
      {/* 상단 - 월/년 헤더 */}
      <div style={{
        textAlign: 'center',
        marginBottom: 4
      }}>
        <div style={{
          fontSize: 8,
          fontWeight: '600',
          color: '#374151'
        }}>
          December 2024
        </div>
      </div>
      
      {/* 요일 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        marginBottom: 2
      }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} style={{
            textAlign: 'center',
            fontSize: 4,
            fontWeight: '500',
            color: '#6b7280',
            padding: '1px 0'
          }}>
            {day}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        flex: 1
      }}>
        {/* 첫 번째 주 */}
        <div style={{ fontSize: 4, textAlign: 'center', color: '#d1d5db' }}>1</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>2</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>3</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>4</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>5</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>6</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>7</div>
        
        {/* 두 번째 주 */}
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>8</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>9</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>10</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>11</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>12</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>13</div>
        <div style={{ 
          fontSize: 4, 
          textAlign: 'center', 
          color: '#ffffff',
          backgroundColor: '#ef4444',
          borderRadius: 2,
          fontWeight: '600'
        }}>14</div>
        
        {/* 세 번째 주 */}
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>15</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>16</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>17</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>18</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>19</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>20</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>21</div>
        
        {/* 네 번째 주 */}
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>22</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>23</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>24</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>25</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>26</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>27</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>28</div>
        
        {/* 다섯 번째 주 */}
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>29</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>30</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#374151' }}>31</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#d1d5db' }}>1</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#d1d5db' }}>2</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#d1d5db' }}>3</div>
        <div style={{ fontSize: 4, textAlign: 'center', color: '#d1d5db' }}>4</div>
      </div>
    </div>
  );
}

export default CalendarThumbnail;
