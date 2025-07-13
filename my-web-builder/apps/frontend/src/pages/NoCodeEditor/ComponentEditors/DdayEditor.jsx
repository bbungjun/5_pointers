import React from 'react';
import { DateEditor } from '../PropertyEditors';

function DdayEditor({ selectedComp, onUpdate }) {
  const { defaultProps = {} } = selectedComp;
  const targetDate = selectedComp.props.targetDate ?? defaultProps.targetDate ?? '';
  const targetTime = selectedComp.props.targetTime ?? defaultProps.targetTime ?? '14:00';
  const backgroundColor = selectedComp.props.backgroundColor ?? defaultProps.backgroundColor ?? '#f8fafc';
  const backgroundImage = selectedComp.props.backgroundImage ?? defaultProps.backgroundImage ?? '';

  const backgroundOptions = [
    { name: '기본', value: '' },
    { name: '웨딩 교회', value: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800' },
    { name: '웨딩 아치', value: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800' },
    { name: '웨딩 케이크', value: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800' },
    { name: '웨딩 반지', value: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800' },
    { name: '웨딩 부케', value: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800' },
    { name: '웨딩 드레스', value: 'https://images.unsplash.com/photo-1594736797933-d0ad7ac80409?w=800' },
    { name: '웨딩 테이블', value: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800' },
    { name: '웨딩 장식', value: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800' },
    { name: '순백 장미', value: 'https://images.unsplash.com/photo-1595348020847-b3ca7ad67df5?w=800' },
    { name: '모란 꽃', value: 'https://images.unsplash.com/photo-1518895312237-a2a964d95b11?w=800' },
    { name: '로맨틱 꽃다발', value: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800' },
    { name: '벚꽃 배경', value: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800' },
    { name: '라벤더 필드', value: 'https://images.unsplash.com/photo-1611858517488-9b05b3e3e93c?w=800' },
    { name: '골든 아워 자연', value: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800' },
    { name: '소프트 핑크', value: 'https://images.unsplash.com/photo-1502790671504-542ad42d5189?w=800' }
  ];

  return (
    <div>

      
      <DateEditor
        value={targetDate}
        onChange={value => onUpdate({
          ...selectedComp,
          props: { ...selectedComp.props, targetDate: value }
        })}
        label="결혼식 날짜"
      />

      {/* 목표 시간 입력 */}
      <div style={{ marginBottom: 16 }}>
        <label style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1d2129',
          marginBottom: 6
        }}>
          결혼식 시간
        </label>
        <input
          type="time"
          value={targetTime}
          onChange={(e) => onUpdate({
            ...selectedComp,
            props: { ...selectedComp.props, targetTime: e.target.value }
          })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: '#fff'
          }}
        />
      </div>

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
