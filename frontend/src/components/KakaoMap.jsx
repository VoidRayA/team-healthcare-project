import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Button, GlobalStyles, useTheme } from '@mui/material';
import { loadKakaoMapScript, isKakaoMapLoaded } from '../utils/kakaoMapLoader';

/**
 * 카카오맵 컴포넌트
 * 
 * 주요 기능:
 * - 카카오맵 API를 사용한 지도 표시
 * - 줌 컨트롤: 우측 중앙에 [+][-] 버튼 (확대/축소)
 * - 지도타입 컨트롤: 우측 하단에 [지도][위성][하이브리드] 버튼
 * - MUI 테마 기반 스타일링 (다크모드 지원)
 * - 마커 추가 및 관리 기능
 * - 반응형 디자인 (모바일 지원)
 * 
 * 개선사항:
 * - 기존 TOPRIGHT에 있던 지도타입 컨트롤을 BOTTOMRIGHT로 이동
 * - 현재위치 마커와 컨트롤 버튼이 겹치는 문제 해결
 * - CSS 파일 없이 순수 MUI GlobalStyles로 스타일링
 */

const KakaoMap = ({ 
  width = '100%', 
  height = '400px',
  initialCenter = { lat: 35.1796, lng: 129.0756 }, // 부산 중심 좌표
  level = 3,
  markers = [],
  onMapLoad = null,
  showControls = true
}) => {
  const theme = useTheme();
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
        // 줌 컨트롤 (확대/축소 버튼) - 지도 우측 중앙에 위치
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        // 지도타입 컨트롤 (일반지도/위성지도/하이브리드 전환 버튼)
        // 기존 TOPRIGHT에서 BOTTOMRIGHT로 변경하여 현재위치 아이콘과 겹치지 않도록 함
        const mapTypeControl = new window.kakao.maps.MapTypeControl();
        map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.BOTTOMRIGHT);
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
    <>
      <GlobalStyles
        styles={{
          // =================================================================
          // 카카오맵 UI 컨트롤 스타일링 (MUI 테마 기반)
          // =================================================================
          
          // 지도타입 컨트롤 (일반/위성/하이브리드 전환 버튼)
          // 우측 하단에 위치하여 현재위치 마커와 겹치지 않도록 설정
          '.kakao-map-container .MapTypeControl': {
            bottom: `${theme.spacing(2.5)} !important`,
            right: `${theme.spacing(1.25)} !important`,
            zIndex: 1000, // 다른 요소보다 위에 표시
          },
          
          // 줌 컨트롤 (확대/축소 버튼)
          // 우측 중앙에 수직으로 정렬
          '.kakao-map-container .ZoomControl': {
            right: `${theme.spacing(1.25)} !important`,
            top: '50% !important',
            transform: 'translateY(-50%) !important', // 수직 중앙 정렬
            zIndex: 1000,
          },
          
          // 지도타입 컨트롤 버튼 스타일링
          // [지도] [위성] [하이브리드] 버튼들의 디자인
          '.kakao-map-container .MapTypeControl .map_type button': {
            backgroundColor: `${theme.palette.background.paper} !important`,
            border: `1px solid ${theme.palette.divider} !important`,
            borderRadius: `${theme.shape.borderRadius}px !important`,
            boxShadow: theme.shadows[2], // MUI elevation 2 그림자
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.short,
            }),
            '&:hover': {
              backgroundColor: `${theme.palette.background.default} !important`,
              boxShadow: theme.shadows[4], // 호버 시 더 깊은 그림자
            },
          },
          
          // 줌 컨트롤 버튼 스타일링  
          // [+] [−] 버튼들의 디자인
          '.kakao-map-container .ZoomControl .zoom_control': {
            backgroundColor: `${theme.palette.background.paper} !important`,
            border: `1px solid ${theme.palette.divider} !important`,
            borderRadius: `${theme.shape.borderRadius}px !important`,
            boxShadow: theme.shadows[2],
            transition: theme.transitions.create(['background-color', 'box-shadow'], {
              duration: theme.transitions.duration.short,
            }),
          },
          
          // 모든 컨트롤 버튼의 호버 효과
          '.kakao-map-container .MapTypeControl .map_type button:hover, .kakao-map-container .ZoomControl .zoom_control:hover': {
            backgroundColor: `${theme.palette.background.default} !important`,
            boxShadow: theme.shadows[4],
          },
          
          // =================================================================
          // 모바일 반응형 디자인 (md 브레이크포인트 이하)
          // =================================================================
          [theme.breakpoints.down('md')]: {
            // 모바일에서 지도타입 컨트롤 위치 조정
            '.kakao-map-container .MapTypeControl': {
              bottom: `${theme.spacing(2)} !important`, // 조금 더 위로
              right: `${theme.spacing(1)} !important`,   // 왼쪽으로 조금 이동
            },
            // 모바일에서 줌 컨트롤 위치 조정
            '.kakao-map-container .ZoomControl': {
              right: `${theme.spacing(1)} !important`,
            },
          },
        }}
      />
      <Box 
        sx={{ 
          position: 'relative', 
          width, 
          height,
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
          backgroundColor: theme.palette.grey[100],
        }}
      >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(3),
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[3],
          }}
        >
          <CircularProgress color="primary" />
          <Box sx={{ 
            mt: 2, 
            color: theme.palette.text.secondary,
            typography: 'body2'
          }}>
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
          transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.standard,
          }),
          backgroundColor: theme.palette.grey[200],
        }}
        className="kakao-map-container"
      />
      </Box>
    </>
  );
};

export default KakaoMap;
