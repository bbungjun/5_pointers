import React, { useState, useEffect } from 'react';
import { TextEditor } from '../PropertyEditors';
import DaumPostcode from 'react-daum-postcode';
import KakaoMapView from './MapView';

function loadKakaoMapsScript() {
  return new Promise((resolve) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      resolve();
      return;
    }
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      const check = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=37e5ce2cc5212815fd433917a0994f89&autoload=false&libraries=services';
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    document.head.appendChild(script);
  });
}

function MapEditor({ selectedComp, onUpdate }) {
  const props = selectedComp?.props || {};
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);

  const updateProperty = (keyOrObj, value) => {
    if (typeof keyOrObj === 'object') {
      onUpdate({
        ...selectedComp,
        props: {
          ...selectedComp.props,
          ...keyOrObj,
        },
      });
    } else {
      onUpdate({
        ...selectedComp,
        props: {
          ...selectedComp.props,
          [keyOrObj]: value,
        },
      });
    }
  };

  const handleAddressComplete = (data) => {
    updateProperty('address', data.address);
    setIsPostcodeOpen(false);
  };

  // 주소가 바뀔 때마다 카카오 geocoder로 좌표 변환
  useEffect(() => {
    const address = props.address;
    if (!address) return;
    
    loadKakaoMapsScript().then(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const newLat = parseFloat(result[0].y);
          const newLng = parseFloat(result[0].x);
          updateProperty({
            lat: newLat,
            lng: newLng,
          });
        }
      });
    }).catch(err => {
      // 에러 처리
    });
  }, [props.address]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <TextEditor
            value={props.address || ''}
            onChange={value => updateProperty('address', value)}
            label="주소"
            placeholder="도로명, 지번, 건물명 등 입력"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsPostcodeOpen(true)}
          style={{
            height: 36,
            padding: '0 16px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: 18
          }}
        >
          주소 검색
        </button>
      </div>
      {isPostcodeOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', padding: 16, position: 'relative' }}>
            <button onClick={() => setIsPostcodeOpen(false)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            <DaumPostcode
              onComplete={handleAddressComplete}
              style={{ width: 400, height: 400 }}
              autoClose
            />
          </div>
        </div>
      )}
      {/* 지도 미리보기 */}
      {props.address && props.lat && props.lng && (
        <div style={{ margin: '16px 0' }}>
          <KakaoMapView lat={props.lat} lng={props.lng} zoom={3} width={290} height={200} />
        </div>
      )}
    </div>
  );
}

export default MapEditor;