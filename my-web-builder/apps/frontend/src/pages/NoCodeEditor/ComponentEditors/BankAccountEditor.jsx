import React from 'react';
import { TextEditor } from '../PropertyEditors';

function BankAccountEditor({ selectedComp, onUpdate }) {
  console.log('BankAccountEditor rendered with:', selectedComp);
  
  if (!selectedComp || !selectedComp.props) {
    return <div>Loading...</div>;
  }
  
  const handlePropChange = (propName, value) => {
    onUpdate({
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propName]: value
      }
    });
  };
  
  const handlePersonChange = (side, person, field, value) => {
    const newProps = {
      ...selectedComp.props,
      [side]: {
        ...selectedComp.props[side],
        [person]: {
          ...selectedComp.props[side][person],
          [field]: value
        }
      }
    };
    onUpdate({ ...selectedComp, props: newProps });
  };
  
  const renderPersonEditor = (side, person, label) => {
    const sideData = selectedComp.props[side];
    if (!sideData || !sideData[person]) {
      return <div>No data for {label}</div>;
    }
    const data = sideData[person];
    const showEnabled = person !== 'groom' && person !== 'bride';
    
    return (
      <div style={{ marginBottom: 20, padding: 12, border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: '#333' }}>{label}</div>
        
        {showEnabled && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={data.enabled || false}
                onChange={(e) => handlePersonChange(side, person, 'enabled', e.target.checked)}
              />
              표시하기
            </label>
          </div>
        )}
        
        <div style={{ display: 'grid', gap: 8 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>이름</label>
            <TextEditor
              value={data.name || ''}
              onChange={(value) => handlePersonChange(side, person, 'name', value)}
              placeholder="이름을 입력하세요"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>은행</label>
            <TextEditor
              value={data.bank || ''}
              onChange={(value) => handlePersonChange(side, person, 'bank', value)}
              placeholder="은행명을 입력하세요"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>계좌번호</label>
            <TextEditor
              value={data.account || ''}
              onChange={(value) => handlePersonChange(side, person, 'account', value)}
              placeholder="계좌번호를 입력하세요"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>


      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          제목
        </label>
        <TextEditor
          value={selectedComp.props.title || ''}
          onChange={(value) => handlePropChange('title', value)}
          placeholder="제목을 입력하세요"
        />
      </div>
      
      <div>
        <h4 style={{ margin: '16px 0 8px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>신랑 측</h4>
        {selectedComp.props.groomSide && (
          <>
            {renderPersonEditor('groomSide', 'groom', '신랑')}
            {renderPersonEditor('groomSide', 'groomFather', '신랑 아버지')}
            {renderPersonEditor('groomSide', 'groomMother', '신랑 어머니')}
          </>
        )}
      </div>
      
      <div>
        <h4 style={{ margin: '16px 0 8px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>신부 측</h4>
        {selectedComp.props.brideSide && (
          <>
            {renderPersonEditor('brideSide', 'bride', '신부')}
            {renderPersonEditor('brideSide', 'brideFather', '신부 아버지')}
            {renderPersonEditor('brideSide', 'brideMother', '신부 어머니')}
          </>
        )}
      </div>
      
      <div>
        <label style={{
          display: 'block', fontSize: 13, fontWeight: 500,
          color: '#333', marginBottom: 8
        }}>
          배경색
        </label>
        <input
          type="color"
          value={selectedComp.props.backgroundColor || '#f8f9fa'}
          onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
          style={{
            width: '100%', height: 40, border: '1px solid #ddd',
            borderRadius: 6, cursor: 'pointer'
          }}
        />
      </div>
    </div>
  );
}

export default BankAccountEditor;