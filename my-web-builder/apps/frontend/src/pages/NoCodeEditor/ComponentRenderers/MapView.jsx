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

function KakaoMapView({ lat = 37.5665, lng = 126.9780, zoom = 0, comp }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
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
            level: zoom,
          });
          mapRef.current._kakao_map_instance = map;
          markerRef.current = new window.kakao.maps.Marker({
            position: center,
            map: map,
          });
          map.setLevel(zoom);
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
          map.setLevel(zoom);
          // 컨테이너 크기 변경 후 지도 리사이즈
          setTimeout(() => {
            map.relayout();
          }, 100);
        }
      }
      renderMap();
    });
  }, [lat, lng, zoom, comp?.width, comp?.height]);

  // 컨테이너 크기 변화 감지
  useEffect(() => {
    if (!mapRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      const map = mapRef.current?._kakao_map_instance;
      if (map) {
        setTimeout(() => {
          map.relayout();
        }, 50);
      }
    });
    
    resizeObserver.observe(mapRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{ width: comp?.width || 340, height: comp?.height || 240, borderRadius: 8, border: '1px solid #ccc' }}
    />
  );
}

export default KakaoMapView; 