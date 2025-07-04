import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DateEditor({ value, onChange, label = 'Date', min, max }) {
  // value는 yyyy-MM-dd 문자열
  const selectedDate = value ? new Date(value) : null;

  // min/max는 yyyy-MM-dd 문자열일 수 있음
  const minDate = min ? new Date(min) : undefined;
  const maxDate = max ? new Date(max) : undefined;

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          color: '#333',
          fontWeight: 500,
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) =>
          onChange(date ? date.toISOString().slice(0, 10) : '')
        }
        dateFormat="yyyy-MM-dd"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText="Select a date"
        className="custom-datepicker-input"
        calendarClassName="english-calendar"
        popperPlacement="bottom"
        showPopperArrow={false}
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 8,
            }}
          >
            <button
              type="button"
              onClick={decreaseMonth}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              {'<'}
            </button>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
            </span>
            <button
              type="button"
              onClick={increaseMonth}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              {'>'}
            </button>
          </div>
        )}
        dayClassName={(date) => {
          const day = date.getDay();
          if (day === 0) return 'sunday';
          if (day === 6) return 'saturday';
          return '';
        }}
        weekDayClassName={(i) => {
          if (i === 0) return 'sunday';
          if (i === 6) return 'saturday';
          return '';
        }}
      />
      <style>{`
        .custom-datepicker-input {
          width: 100%;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
          background: #fff;
        }
        .custom-datepicker-input:focus {
          border-color: #0066FF;
        }
        .english-calendar .react-datepicker__day.sunday,
        .english-calendar .react-datepicker__day-name.sunday {
          color: #e74c3c;
        }
        .english-calendar .react-datepicker__day.saturday,
        .english-calendar .react-datepicker__day-name.saturday {
          color: #2986e2;
        }
        .english-calendar .react-datepicker__day-name {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default DateEditor;
