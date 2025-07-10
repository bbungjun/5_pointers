import React from 'react';
import { TextEditor, PhoneEditor } from '../PropertyEditors';

function WeddingContactEditor({ selectedComp, onUpdate }) {
  const updateProperty = (propKey, value) => {
    const updatedComp = {
      ...selectedComp,
      props: {
        ...selectedComp.props,
        [propKey]: value
      }
    };
    onUpdate(updatedComp);
  };

  const props = selectedComp.props;

  return (
    <div>
      
      {/* 신랑신부 정보 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        신랑신부 정보
      </div>

      <TextEditor
        value={props.groomName}
        onChange={(value) => updateProperty('groomName', value)}
        label="신랑 이름"
        placeholder="신랑 이름을 입력하세요"
      />

      <PhoneEditor
        value1={props.groomPhone1}
        value2={props.groomPhone2}
        value3={props.groomPhone3}
        onChange1={(value) => updateProperty('groomPhone1', value)}
        onChange2={(value) => updateProperty('groomPhone2', value)}
        onChange3={(value) => updateProperty('groomPhone3', value)}
        label="신랑 전화번호"
      />

      <TextEditor
        value={props.brideName}
        onChange={(value) => updateProperty('brideName', value)}
        label="신부 이름"
        placeholder="신부 이름을 입력하세요"
      />

      <PhoneEditor
        value1={props.bridePhone1}
        value2={props.bridePhone2}
        value3={props.bridePhone3}
        onChange1={(value) => updateProperty('bridePhone1', value)}
        onChange2={(value) => updateProperty('bridePhone2', value)}
        onChange3={(value) => updateProperty('bridePhone3', value)}
        label="신부 전화번호"
      />

      {/* 표시 순서 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
            표시 순서
          </span>
          <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={props.brideFirst || false}
              onChange={e => updateProperty('brideFirst', e.target.checked)}
              style={{ marginRight: 6 }}
            />
            신부 먼저 표시
          </label>
        </div>
      </div>

      <div style={{ height: 1, backgroundColor: '#eee', margin: '16px 0' }} />

      {/* 혼주 정보 */}
      <div style={{ 
        fontSize: 12, 
        color: '#65676b', 
        fontWeight: 600, 
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        혼주 정보
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
            혼주 사용
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="useParents"
                checked={props.useParents !== false}
                onChange={() => updateProperty('useParents', true)}
                style={{ marginRight: 6 }}
              />
              사용함
            </label>
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <input
                type="radio"
                name="useParents"
                checked={props.useParents === false}
                onChange={() => updateProperty('useParents', false)}
                style={{ marginRight: 6 }}
              />
              사용안함
            </label>
          </div>
        </div>
      </div>

      {props.useParents !== false && (
        <>
          {/* 신랑측 */}
          <div style={{ 
            fontSize: 11, 
            color: '#65676b', 
            fontWeight: 600, 
            marginBottom: 8,
            marginTop: 16
          }}>
            신랑 측
          </div>

          <TextEditor
            value={props.groomFatherName}
            onChange={(value) => updateProperty('groomFatherName', value)}
            label="아버지 이름"
            placeholder="신랑 아버지 이름을 입력하세요"
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                아버지 (故)
              </span>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={props.groomFatherDeceased || false}
                  onChange={e => updateProperty('groomFatherDeceased', e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                故人
              </label>
            </div>
          </div>

          <PhoneEditor
            value1={props.groomFatherPhone1}
            value2={props.groomFatherPhone2}
            value3={props.groomFatherPhone3}
            onChange1={(value) => updateProperty('groomFatherPhone1', value)}
            onChange2={(value) => updateProperty('groomFatherPhone2', value)}
            onChange3={(value) => updateProperty('groomFatherPhone3', value)}
            label="아버지 전화번호"
          />

          <TextEditor
            value={props.groomMotherName}
            onChange={(value) => updateProperty('groomMotherName', value)}
            label="어머니 이름"
            placeholder="신랑 어머니 이름을 입력하세요"
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                어머니 (故)
              </span>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={props.groomMotherDeceased || false}
                  onChange={e => updateProperty('groomMotherDeceased', e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                故人
              </label>
            </div>
          </div>

          <PhoneEditor
            value1={props.groomMotherPhone1}
            value2={props.groomMotherPhone2}
            value3={props.groomMotherPhone3}
            onChange1={(value) => updateProperty('groomMotherPhone1', value)}
            onChange2={(value) => updateProperty('groomMotherPhone2', value)}
            onChange3={(value) => updateProperty('groomMotherPhone3', value)}
            label="어머니 전화번호"
          />

          {/* 신부측 */}
          <div style={{ 
            fontSize: 11, 
            color: '#65676b', 
            fontWeight: 600, 
            marginBottom: 8,
            marginTop: 16
          }}>
            신부 측
          </div>

          <TextEditor
            value={props.brideFatherName}
            onChange={(value) => updateProperty('brideFatherName', value)}
            label="아버지 이름"
            placeholder="신부 아버지 이름을 입력하세요"
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                아버지 (故)
              </span>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={props.brideFatherDeceased || false}
                  onChange={e => updateProperty('brideFatherDeceased', e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                故人
              </label>
            </div>
          </div>

          <PhoneEditor
            value1={props.brideFatherPhone1}
            value2={props.brideFatherPhone2}
            value3={props.brideFatherPhone3}
            onChange1={(value) => updateProperty('brideFatherPhone1', value)}
            onChange2={(value) => updateProperty('brideFatherPhone2', value)}
            onChange3={(value) => updateProperty('brideFatherPhone3', value)}
            label="아버지 전화번호"
          />

          <TextEditor
            value={props.brideMotherName}
            onChange={(value) => updateProperty('brideMotherName', value)}
            label="어머니 이름"
            placeholder="신부 어머니 이름을 입력하세요"
          />

          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>
                어머니 (故)
              </span>
              <label style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={props.brideMotherDeceased || false}
                  onChange={e => updateProperty('brideMotherDeceased', e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                故人
              </label>
            </div>
          </div>

          <PhoneEditor
            value1={props.brideMotherPhone1}
            value2={props.brideMotherPhone2}
            value3={props.brideMotherPhone3}
            onChange1={(value) => updateProperty('brideMotherPhone1', value)}
            onChange2={(value) => updateProperty('brideMotherPhone2', value)}
            onChange3={(value) => updateProperty('brideMotherPhone3', value)}
            label="어머니 전화번호"
          />
        </>
      )}
    </div>
  );
}

export default WeddingContactEditor;