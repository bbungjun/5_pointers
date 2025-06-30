import React from 'react';

function CalendarRenderer({ comp, isEditor = false }) {
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
    <div className={`${isEditor ? 'w-auto h-auto' : 'w-full h-full'} bg-white rounded-lg shadow-sm border p-4`}>
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
          {title}
        </h3>
      )}
      
      {/* 월/년 헤더 */}
      <div className="text-center mb-4">
        <h4 className="text-xl font-bold text-gray-700">
          {monthNames[month]} {year}
        </h4>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(dayName => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
      </div>
      
      {/* 달력 날짜들 */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const isCurrentMonth = date.getMonth() === month;
            const isWeddingDay = date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
            const isToday = date.toDateString() === currentDate.toDateString();
            
            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  h-10 w-10 flex items-center justify-center text-sm rounded-lg cursor-pointer
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                  ${isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                  ${isWeddingDay ? 'font-bold text-white shadow-lg' : ''}
                  ${isCurrentMonth && !isWeddingDay && !isToday ? 'hover:bg-gray-100' : ''}
                `}
                style={{
                  backgroundColor: isWeddingDay ? highlightColor : undefined
                }}
              >
                {date.getDate()}
                {isWeddingDay && (
                  <div className="absolute mt-8 text-xs text-center">
                    💒
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* 웨딩 날짜 표시 */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Wedding Date: <span className="font-semibold" style={{ color: highlightColor }}>
            {targetDate.toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CalendarRenderer;