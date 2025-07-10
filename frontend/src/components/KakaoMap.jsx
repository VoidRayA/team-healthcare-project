import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { loadKakaoMapScript, isKakaoMapLoaded } from '../utils/kakaoMapLoader';

const KakaoMap = ({ 
  width = '100%', 
  height = '400px',
  initialCenter = { lat: 35.1796, lng: 129.0756 }, // 부산 중심 좌표
  level = 3,
  markers = [],
  onMapLoad = null,
  showControls = true
}) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('카카오맵 스크립트 로딩 시작...');
      
      // 카카오맵 스크립트 동적 로드
      await loadKakaoMapScript();
      
      // 로드 확인
      if (!isKakaoMapLoaded()) {
        throw new Error('카카오맵 SDK가 올바르게 로드되지 않았습니다.');
      }

      console.log('지도 생성 시작');
      const container = mapContainer.current;
      
      if (!container) {
        throw new Error('지도 컨테이너를 찾을 수 없습니다.');
      }

      const options = {
        center: new window.kakao.maps.LatLng(initialCenter.lat, initialCenter.lng),
        level: level
      };

      const map = new window.kakao.maps.Map(container, options);
      mapInstance.current = map;
      console.log('지도 생성 완료');

      // 컨트롤 추가
      if (showControls) {
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);
      }

      // 마커 추가
      if (markers.length > 0) {
        addMarkers(map, markers);
      }

      // 지도 로드 완료 콜백
      if (onMapLoad) {
        onMapLoad(map);
      }

      setLoading(false);
      
    } catch (err) {
      console.error('카카오맵 초기화 오류:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeMap();

    // 클린업
    return () => {
      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      
      // 지도 인스턴스 정리
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [retryCount]); // retryCount가 변경될 때마다 다시 시도

  // 마커 업데이트
  useEffect(() => {
    if (mapInstance.current && !loading && isKakaoMapLoaded()) {
      // 기존 마커 제거
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];
      
      // 새 마커 추가
      if (markers.length > 0) {
        addMarkers(mapInstance.current, markers);
      }
    }
  }, [markers, loading]);

  // 마커 추가 함수
  const addMarkers = (map, markerData) => {
    if (!isKakaoMapLoaded()) {
      console.error('카카오맵 SDK가 아직 로드되지 않았습니다.');
      return;
    }

    markerData.forEach(data => {
      try {
        const markerPosition = new window.kakao.maps.LatLng(data.lat, data.lng);
        
        let markerOptions = {
          position: markerPosition,
          map: map,
          title: data.title || ''
        };
        
        // 현재 위치는 특별한 마커 이미지 사용
        if (data.isCurrentLocation) {
          const markerImage = new window.kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
            new window.kakao.maps.Size(24, 35)
          );
          markerOptions.image = markerImage;
        }
        
        const marker = new window.kakao.maps.Marker(markerOptions);

        // 인포윈도우 추가
        if (data.content) {
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${data.content}</div>`,
            removable: true
          });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
          });
        }

        markersRef.current.push(marker);
      } catch (err) {
        console.error('마커 추가 중 오류:', err);
      }
    });

    // 마커가 모두 보이도록 지도 범위 조정
    if (markerData.length > 1) {
      try {
        const bounds = new window.kakao.maps.LatLngBounds();
        markerData.forEach(data => {
          bounds.extend(new window.kakao.maps.LatLng(data.lat, data.lng));
        });
        map.setBounds(bounds);
      } catch (err) {
        console.error('지도 범위 조정 중 오류:', err);
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ m: 2 }}
        action={
          <Button color="inherit" size="small" onClick={handleRetry}>
            다시 시도
          </Button>
        }
      >
        <strong>지도를 불러올 수 없습니다</strong>
        <br />
        {error}
        <br />
        <small>
          가능한 원인:
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>인터넷 연결 확인</li>
            <li>카카오 API 키 확인</li>
            <li>브라우저 광고 차단기 비활성화</li>
          </ul>
        </small>
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', width, height }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center'
          }}
        >
          <CircularProgress />
          <Box sx={{ mt: 2, color: 'text.secondary' }}>
            카카오맵 로딩 중...
          </Box>
        </Box>
      )}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          opacity: loading ? 0.3 : 1,
          transition: 'opacity 0.3s',
          backgroundColor: '#f0f0f0'
        }}
      />
    </Box>
  );
};

export default KakaoMap;
