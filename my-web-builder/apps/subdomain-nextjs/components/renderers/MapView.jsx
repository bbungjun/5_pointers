import React, { useEffect, useRef } from 'react';

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

function KakaoMapView({ 
  lat = 37.5665, 
  lng = 126.9780, 
  zoom = 1,                // 확대된 상태로 기본 설정
  width = 400, 
  height = 300,
  interactive = false,     // 배포된 페이지에서는 기본적으로 상호작용 비활성화
  mode = 'live',           // 'preview' 또는 'live'
  comp = {}                // 컴포넌트 props
}) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // 배포된 페이지에서는 zoom을 1로 고정하여 확대된 상태로 표시
    const targetZoom = interactive ? zoom : 1;
    loadKakaoMapsScript().then(() => {
      function renderMap() {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng || !mapRef.current) {
          setTimeout(renderMap, 100);
          return;
        }
        let map = mapRef.current._kakao_map_instance;
        const center = new window.kakao.maps.LatLng(lat, lng);
        if (!map) {
          map = new window.kakao.maps.Map(mapRef.current, {
            center,
            level: targetZoom,
            draggable: interactive,          // 드래그 가능 여부
            scrollwheel: interactive,        // 휠 확대·축소 가능 여부
          });
          mapRef.current._kakao_map_instance = map;
          markerRef.current = new window.kakao.maps.Marker({
            position: center,
            map: map,
          });
          map.setLevel(targetZoom);
          // 인터랙션 설정 (드래그/줌)
          if (typeof map.setDraggable === 'function') {
            map.setDraggable(interactive);
          }
          if (typeof map.setZoomable === 'function') {
            map.setZoomable(interactive);
          }
        } else {
          map.setCenter(center);
          if (markerRef.current) {
            markerRef.current.setPosition(center);
          } else {
            markerRef.current = new window.kakao.maps.Marker({
              position: center,
              map: map,
            });
          }
          map.setLevel(targetZoom);
          // 인터랙션 설정을 업데이트
          if (typeof map.setDraggable === 'function') {
            map.setDraggable(interactive);
          }
          if (typeof map.setZoomable === 'function') {
            map.setZoomable(interactive);
          }
        }
      }
      renderMap();
    });
  }, [lat, lng, zoom, interactive]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{ width: `${comp?.width || width || 300}px`, height: `${comp?.height || height || 200}px`, borderRadius: 0, border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default KakaoMapView; 