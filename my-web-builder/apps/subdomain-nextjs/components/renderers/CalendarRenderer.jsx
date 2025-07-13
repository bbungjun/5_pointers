import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

function CalendarRenderer({ comp, mode = 'live' }) {
  const { weddingDate, title, highlightColor } = comp.props;
  const { isLiveMode, responsiveWidth, responsiveHeight } = useResponsive(mode, comp.width, comp.height);
  
  // 날짜 파싱
  const targetDate = new Date(weddingDate);
  const currentDate = new Date();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  
  // 달력 생성 로직
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const weeks = [];
  const currentWeekDate = new Date(startDate);
  
  for (let week = 0; week < 6; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      days.push(new Date(currentWeekDate));
      currentWeekDate.setDate(currentWeekDate.getDate() + 1);
    }
    weeks.push(days);
    if (currentWeekDate > lastDay && currentWeekDate.getDay() === 0) break;
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div style={{
      width: isLiveMode ? responsiveWidth : (comp.width || 350),
      height: isLiveMode ? responsiveHeight : (comp.height || 400),
      backgroundColor: 'white',
      borderRadius: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: isLiveMode ? 'clamp(250px, 60vw, 300px)' : '300px',
      padding: isLiveMode ? 'clamp(12px, 3vw, 16px)' : '16px',
      boxSizing: 'border-box'
    }}>
      {title && (
        <h3 style={{
          fontSize: isLiveMode ? 'clamp(16px, 4vw, 18px)' : '18px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: isLiveMode ? 'clamp(12px, 3vw, 16px)' : '16px',
          color: '#1f2937'
        }}>
          {title}
        </h3>
      )}
      
      {/* 월/년 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: isLiveMode ? 'clamp(12px, 3vw, 16px)' : '16px' }}>
        <h4 style={{
          fontSize: isLiveMode ? 'clamp(18px, 4.5vw, 20px)' : '20px',
          fontWeight: 'bold',
          color: '#374151'
        }}>
          {monthNames[month]} {year}
        </h4>
      </div>
      
      {/* 요일 헤더 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: isLiveMode ? 'clamp(2px, 1vw, 4px)' : '4px',
        marginBottom: isLiveMode ? 'clamp(6px, 1.5vw, 8px)' : '8px'
      }}>
        {dayNames.map(dayName => (
          <div key={dayName} style={{
            textAlign: 'center',
            fontSize: isLiveMode ? 'clamp(12px, 3vw, 14px)' : '14px',
            fontWeight: '500',
            color: '#6b7280',
            padding: isLiveMode ? 'clamp(6px, 1.5vw, 8px) 0' : '8px 0'
          }}>
            {dayName}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: isLiveMode ? 'clamp(2px, 1vw, 4px)' : '4px',
        flex: 1
      }}>
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth = date.getMonth() === month;
            const isWeddingDay = date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
            const isToday = date.toDateString() === currentDate.toDateString();
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                style={{
                  height: isLiveMode ? 'clamp(32px, 8vw, 40px)' : '40px',
                  width: isLiveMode ? 'clamp(32px, 8vw, 40px)' : '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isLiveMode ? 'clamp(12px, 3vw, 14px)' : '14px',
                  borderRadius: isLiveMode ? 'clamp(6px, 1.5vw, 8px)' : '8px',
                  cursor: 'pointer',
                  color: !isCurrentMonth ? '#d1d5db' : '#374151',
                  backgroundColor: isWeddingDay ? highlightColor : 
                                 isToday ? '#dbeafe' : 'transparent',
                  fontWeight: isWeddingDay || isToday ? 'bold' : 'normal',
                  position: 'relative'
                }}
              >
                {date.getDate()}
                {isWeddingDay && (
                  <div style={{
                    position: 'absolute',
                    marginTop: isLiveMode ? 'clamp(24px, 6vw, 32px)' : '32px',
                    fontSize: isLiveMode ? 'clamp(10px, 2.5vw, 12px)' : '12px',
                    textAlign: 'center'
                  }}>
                    💒
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 웨딩 날짜 표시 */}
      <div style={{ marginTop: isLiveMode ? 'clamp(12px, 3vw, 16px)' : '16px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: isLiveMode ? 'clamp(12px, 3vw, 14px)' : '14px', 
          color: '#6b7280' 
        }}>
          Wedding Date: <span style={{ fontWeight: '600', color: highlightColor }}>
            {targetDate.toLocaleDateString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CalendarRenderer;