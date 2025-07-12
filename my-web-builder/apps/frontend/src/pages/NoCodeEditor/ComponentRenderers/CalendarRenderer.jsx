import React from 'react';

function CalendarRenderer({ comp, mode = 'editor' }) {
  const { weddingDate, title, highlightColor } = comp.props;
  
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
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 0,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '300px',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      {title && (
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '16px',
          color: '#1f2937'
        }}>
          {title}
        </h3>
      )}
      
      {/* 월/년 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h4 style={{
          fontSize: '20px',
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
        gap: '4px',
        marginBottom: '8px'
      }}>
        {dayNames.map(dayName => (
          <div key={dayName} style={{
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            padding: '8px 0'
          }}>
            {dayName}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
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
                  height: '40px',
                  width: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  borderRadius: '8px',
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
                    marginTop: '32px',
                    fontSize: '12px',
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
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Wedding Date: <span style={{ fontWeight: '600', color: highlightColor }}>
            {targetDate.toLocaleDateString('en-US')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CalendarRenderer;