import React from 'react';
import { DateEditor } from '../PropertyEditors';

function DdayEditor({ selectedComp, onUpdate }) {
  const { defaultProps = {} } = selectedComp;
  const targetDate = selectedComp.props.targetDate ?? defaultProps.targetDate ?? '';
  const backgroundColor = selectedComp.props.backgroundColor ?? defaultProps.backgroundColor ?? '#f8fafc';
  const backgroundImage = selectedComp.props.backgroundImage ?? defaultProps.backgroundImage ?? '';

  const backgroundOptions = [
    { name: '기본', value: '' },
    { name: '꽃 배경 2', value: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { name: '자연 배경', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800' },
    { name: '하늘 배경', value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' },
    { name: '집 앞 꽃', value: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8JUVCJUIyJTlBJUVBJUJEJTgzJTIwJUVCJUIwJUIwJUVBJUIyJUJEJUVEJTk5JTk0JUVCJUE5JUI0fGVufDB8fDB8fHww' }
  ];

  return (
    <div>
      {/* 컴포넌트 정보 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '8px 12px',
        backgroundColor: '#f0f2f5',
        borderRadius: 6
      }}>
        <span style={{ fontSize: 16 }}>📅</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d2129' }}>
            D-day
          </div>
          <div style={{ fontSize: 11, color: '#65676b' }}>
            {selectedComp.id}
          </div>
        </div>
      </div>
      
      <DateEditor
        value={targetDate}
        onChange={value => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, targetDate: value }
        })}
        label="목표 날짜"
      />

      {/* 배경 이미지 선택 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 6
        }}>
          배경 이미지
        </label>
        <select
          value={backgroundImage}
          onChange={(e) => onUpdate({
            ...selectedComp,
            props: { ...selectedComp.props, backgroundImage: e.target.value }
          })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          {backgroundOptions.map(option => (
            <option key={option.name} value={option.value}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* 배경색 선택 (기본 배경일 때만) */}
      {!backgroundImage && (
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 600,
            color: '#1d2129',
            marginBottom: 6
          }}>
            배경색
          </label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onUpdate({
              ...selectedComp,
              props: { ...selectedComp.props, backgroundColor: e.target.value }
            })}
            style={{
              width: '100%',
              height: 40,
              border: '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DdayEditor;
