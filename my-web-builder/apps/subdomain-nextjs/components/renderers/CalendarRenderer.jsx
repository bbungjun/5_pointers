import React from 'react';

function CalendarRenderer({ comp, mode = 'live' }) {
  // 컨테이너 크기 기준으로 스케일 팩터 계산
  const baseWidth = 375; // 기준 너비
  const actualWidth = comp.width || baseWidth;
  const scaleFactor = actualWidth / baseWidth;
  
  const { 
    weddingDate, 
    title, 
    highlightColor,
    noBorder = true,
    borderColor = '#e5e7eb',
    borderWidth = '1px',
    borderRadius = 0,
  } = comp.props;
  
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
      width: mode === 'live' ? '100%' : `${comp?.width || 300}px`,
      height: mode === 'live' ? `${(comp?.height || 300) * scaleFactor}px` : `${comp?.height || 200}px`,
      backgroundColor: 'white',
      border: noBorder ? 'none' : `${borderWidth} solid ${borderColor}`,
      borderRadius: mode === 'live' ? `${borderRadius * scaleFactor}px` : borderRadius,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: mode === 'live' ? `${300 * scaleFactor}px` : '300px',
      padding: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
      boxSizing: 'border-box'
    }}>
      {title && (
        <h3 style={{
          fontSize: mode === 'live' ? `${18 * scaleFactor}px` : '18px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: mode === 'live' ? `${16 * scaleFactor}px` : '16px',
          color: '#1f2937'
        }}>
          {title}
        </h3>
      )}
      
      {/* 월/년 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: mode === 'live' ? `${16 * scaleFactor}px` : '16px' }}>
        <h4 style={{
          fontSize: mode === 'live' ? `${20 * scaleFactor}px` : '20px',
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
        gap: mode === 'live' ? `${4 * scaleFactor}px` : '4px',
        marginBottom: mode === 'live' ? `${8 * scaleFactor}px` : '8px'
      }}>
        {dayNames.map(dayName => (
          <div key={dayName} style={{
            textAlign: 'center',
            fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
            fontWeight: '500',
            color: '#6b7280',
            padding: mode === 'live' ? `${8 * scaleFactor}px 0` : '8px 0'
          }}>
            {dayName}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: mode === 'live' ? `${4 * scaleFactor}px` : '4px',
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
                  height: mode === 'live' ? `${40 * scaleFactor}px` : '40px',
                  width: mode === 'live' ? `${40 * scaleFactor}px` : '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: mode === 'live' ? `${14 * scaleFactor}px` : '14px',
                  borderRadius: mode === 'live' ? `${8 * scaleFactor}px` : '8px',
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
                    marginTop: mode === 'live' ? 'clamp(24px, 6vw, 32px)' : '32px',
                    fontSize: mode === 'live' ? 'clamp(10px, 2.5vw, 12px)' : '12px',
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
      <div style={{ marginTop: mode === 'live' ? 'clamp(12px, 3vw, 16px)' : '16px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: mode === 'live' ? 'clamp(12px, 3vw, 14px)' : '14px', 
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