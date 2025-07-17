import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Button
} from '@mui/material';
import { Close, LocalHospital, Phone, LocationOn, Navigation, MyLocation } from '@mui/icons-material';
import KakaoMap from '../KakaoMap';

const HospitalMapModal = ({ open, onClose, hospitals, currentPosition }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleClose = () => {
    clearRoute(); // 모달 닫힐 때 경로 제거
    onClose();
  };

  // 지도용 마커 데이터 생성
  const markers = React.useMemo(() => {
    const allMarkers = [];
    
    // 현재 위치 마커를 먼저 추가 (파란색 특별 마커)
    if (currentPosition) {
      allMarkers.push({
        lat: currentPosition.latitude,
        lng: currentPosition.longitude,
        title: currentPosition.isSeniorLocation ? '대상자 위치' : '내 위치',
        content: `
          <div style="padding: 10px; text-align: center;">
            <strong style="color: #1976d2; font-size: 14px;">📍 ${currentPosition.isSeniorLocation ? '대상자 위치' : '현재 위치'}</strong><br/>
            ${currentPosition.isSeniorLocation && currentPosition.address ? 
              `<span style="font-size: 12px; color: #666; font-weight: bold;">입력 주소: ${currentPosition.address}</span><br/>` : 
              ''}
            ${currentPosition.resolvedAddress ? 
              `<span style="font-size: 12px; color: #888;">변환된 주소: ${currentPosition.resolvedAddress}</span><br/>` : 
              ''}
            <span style="font-size: 12px; color: #666;">
              위도: ${currentPosition.latitude.toFixed(6)}<br/>
              경도: ${currentPosition.longitude.toFixed(6)}
            </span>
          </div>
        `,
        isCurrentLocation: true // 현재 위치 식별용
      });
    }
    
    // 병원 마커들 추가
    const hospitalMarkers = hospitals.map((hospital) => ({
      lat: parseFloat(hospital.latitude),
      lng: parseFloat(hospital.longitude),
      title: hospital.yadmNm,
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <strong style="font-size: 14px;">🏥 ${hospital.yadmNm}</strong><br/>
          <span style="font-size: 12px; color: #666;">
            ${hospital.addr}<br/>
            ${hospital.telno && hospital.telno !== '전화번호 정보 없음' ? `📞 ${hospital.telno}` : ''}
            ${hospital.distance ? `<br/>📏 거리: ${hospital.distance}` : ''}
          </span>
        </div>
      `,
      isHospital: true
    }));

    return [...allMarkers, ...hospitalMarkers];
  }, [hospitals, currentPosition]);

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    
    if (mapRef && hospital.latitude && hospital.longitude) {
      const position = new window.kakao.maps.LatLng(
        parseFloat(hospital.latitude), 
        parseFloat(hospital.longitude)
      );
      mapRef.panTo(position);
      mapRef.setLevel(3);
    }
  };

  const handleDirections = async (hospital) => {
    if (!currentPosition || !mapRef) {
      alert('현재 위치 정보가 없습니다.');
      return;
    }

    try {
      // 백엔드 T-map API 프록시를 통한 도보 경로 검색
      console.log('🚿 백엔드 T-map API로 도보 경로 검색 시작...');
      
      try {
        const tmapResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/hospital/route/tmap?startLat=${currentPosition.latitude}&startLon=${currentPosition.longitude}&endLat=${hospital.latitude}&endLon=${hospital.longitude}&startName=현재위치&endName=${encodeURIComponent(hospital.yadmNm)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('T-map API 응답 상태:', tmapResponse.status);
        
        if (tmapResponse.ok) {
          const tmapData = await tmapResponse.json();
          console.log('T-map API 응답:', tmapData);
          
          if (tmapData.features && tmapData.features.length > 0) {
            // 기존 폴리라인 제거
            if (window.currentPolyline) {
              window.currentPolyline.setMap(null);
            }
            
            // T-map에서 경로 좌표 추출
            const path = [];
            let totalDistance = 0;
            let totalTime = 0;
            
            tmapData.features.forEach(feature => {
              if (feature.geometry.type === 'LineString') {
                // LineString의 좌표들을 경로에 추가
                feature.geometry.coordinates.forEach(coord => {
                  const lng = coord[0]; // 경도
                  const lat = coord[1]; // 위도
                  path.push(new window.kakao.maps.LatLng(lat, lng));
                });
              }
              
              // 거리와 시간 정보 수집
              if (feature.properties) {
                if (feature.properties.distance) {
                  totalDistance += feature.properties.distance;
                }
                if (feature.properties.time) {
                  totalTime += feature.properties.time;
                }
              }
            });
            
            console.log(`T-map 경로 지점 수: ${path.length}`);
            console.log(`총 거리: ${totalDistance}m, 총 시간: ${totalTime}초`);
            
            if (path.length > 0) {
              const polyline = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: 6,
                strokeColor: '#FF4081', // 파크색 - T-map 경로
                strokeOpacity: 0.9,
                strokeStyle: 'solid'
              });
              
              polyline.setMap(mapRef);
              window.currentPolyline = polyline;
              
              // 지도 범위 조정
              const bounds = new window.kakao.maps.LatLngBounds();
              path.forEach(point => bounds.extend(point));
              mapRef.setBounds(bounds, 50);
              
              // T-map에서 제공하는 실제 경로 정보 사용
              setRouteInfo({
                distance: totalDistance >= 1000 ? 
                  `${(totalDistance / 1000).toFixed(1)}km` : 
                  `${Math.round(totalDistance)}m`,
                duration: `${Math.ceil(totalTime / 60)}분`,
                isTmapRoute: true // T-map 경로임을 표시
              });
              
              setShowRoute(true);
              console.log('✅ T-map 도보 경로 표시 완료!');
              console.log(`거리: ${totalDistance}m, 시간: ${Math.ceil(totalTime / 60)}분`);
              return;
            }
          }
        } else {
          const errorText = await tmapResponse.text();
          console.warn('T-map API 오류:', tmapResponse.status, errorText);
        }
      } catch (tmapError) {
        console.error('T-map API 호출 오류:', tmapError);
      }
    } catch (error) {
      console.error('T-map 처리 중 오류:', error);
    }
    
    // T-map 실패 시 백엔드 카카오 API로 시도
    try {
      console.log('🗺️ 백엔드 카카오 Directions API로 시도...');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/hospital/route/kakao?startLat=${currentPosition.latitude}&startLon=${currentPosition.longitude}&endLat=${hospital.latitude}&endLon=${hospital.longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('카카오 API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('카카오 Directions API 응답:', data);
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // 기존 폴리라인 제거
          if (window.currentPolyline) {
            window.currentPolyline.setMap(null);
          }
          
          // 카카오 경로 좌표 추출
          const path = [];
          
          route.sections.forEach(section => {
            section.roads.forEach(road => {
              for (let i = 0; i < road.vertexes.length; i += 2) {
                const lng = road.vertexes[i];
                const lat = road.vertexes[i + 1];
                if (lng && lat) {
                  path.push(new window.kakao.maps.LatLng(lat, lng));
                }
              }
            });
          });
          
          console.log(`카카오 경로 지점 수: ${path.length}`);
          
          if (path.length > 0) {
            const polyline = new window.kakao.maps.Polyline({
              path: path,
              strokeWeight: 6,
              strokeColor: '#4CAF50', // 녹색 - 카카오 경로
              strokeOpacity: 0.9,
              strokeStyle: 'solid'
            });
            
            polyline.setMap(mapRef);
            window.currentPolyline = polyline;
            
            // 지도 범위 조정
            const bounds = new window.kakao.maps.LatLngBounds();
            path.forEach(point => bounds.extend(point));
            mapRef.setBounds(bounds, 50);
            
            // 카카오 API에서 제공하는 경로 정보
            const summary = route.summary;
            setRouteInfo({
              distance: summary.distance >= 1000 ? 
                `${(summary.distance / 1000).toFixed(1)}km` : 
                `${Math.round(summary.distance)}m`,
              duration: `${Math.ceil(summary.duration / 60)}분`,
              isRealRoute: true // 카카오 실제 경로
            });
            
            setShowRoute(true);
            console.log('✅ 카카오 도보 경로 표시 완료!');
            return;
          }
        }
      } else {
        const errorText = await response.text();
        console.warn('카카오 Directions API 오류:', response.status, errorText);
      }
    } catch (error) {
      console.error('카카오 Directions API 호출 오류:', error);
    }
    
    // 모든 API 실패 시 직선 경로로 폴백
    console.log('폴백: 직선 경로로 표시');
    
    try {
      const startPos = new window.kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude);
      const endPos = new window.kakao.maps.LatLng(parseFloat(hospital.latitude), parseFloat(hospital.longitude));
      
      // 기존 폴리라인 제거
      if (window.currentPolyline) {
        window.currentPolyline.setMap(null);
      }
      
      // 직선 경로
      const linePath = [startPos, endPos];
      
      const polyline = new window.kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 5,
        strokeColor: '#FF9800', // 주황색 - 직선
        strokeOpacity: 0.8,
        strokeStyle: 'dashed'
      });
      
      polyline.setMap(mapRef);
      window.currentPolyline = polyline;
      
      // 지도 범위 조정
      const bounds = new window.kakao.maps.LatLngBounds();
      bounds.extend(startPos);
      bounds.extend(endPos);
      mapRef.setBounds(bounds, 50);
      
      // 직선 거리 계산
      const directDistance = getDistanceBetweenPoints(
        currentPosition.latitude, currentPosition.longitude,
        parseFloat(hospital.latitude), parseFloat(hospital.longitude)
      );
      
      const estimatedRoadDistance = directDistance * 1.3;
      
      setRouteInfo({
        distance: estimatedRoadDistance < 1000 ? 
          `${Math.round(estimatedRoadDistance)}m` : 
          `${(estimatedRoadDistance/1000).toFixed(1)}km`,
        duration: `약 ${Math.ceil(estimatedRoadDistance / 83)}분`,
        isDirectLine: true
      });
      
      setShowRoute(true);
      console.log('✅ 직선 경로 표시 완료 (폴백)');
      
    } catch (error) {
      console.error('경로 표시 오류:', error);
      alert('경로를 표시할 수 없습니다.');
    }
  };
  
  // 두 지점 간 거리 계산 함수 (단위: 미터)
  const getDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
  };
  
  const clearRoute = () => {
    if (window.currentPolyline) {
      window.currentPolyline.setMap(null);
      window.currentPolyline = null;
    }
    setShowRoute(false);
    setRouteInfo(null);
  };

  const handleMapLoad = (map) => {
    setMapRef(map);
    
    // 지도 로드 후 커스텀 마커 스타일 적용
    if (window.kakao && window.kakao.maps && currentPosition) {
      // 현재 위치에 특별한 마커 추가
      const markerImage = new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        new window.kakao.maps.Size(24, 35)
      );
      
      const currentMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
        map: map,
        image: markerImage,
        title: '현재 위치'
      });
    }
  };

  // 현재 위치 버튼
  const handleCenterToCurrentLocation = () => {
    if (mapRef && currentPosition) {
      const position = new window.kakao.maps.LatLng(
        currentPosition.latitude,
        currentPosition.longitude
      );
      mapRef.panTo(position);
      mapRef.setLevel(3);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '900px'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital sx={{ color: '#1976d2' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            주변 병원 지도
          </Typography>
          {currentPosition && (
            <Chip
              icon={<MyLocation />}
              label={currentPosition.isSeniorLocation ? "대상자 위치 기준" : "현재 위치 기준"}
              size="small"
              color="primary"
              variant="outlined"              
            />
          )}
        </Box>
        <IconButton onClick={handleClose} sx={{ color: '#666' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', height: 'calc(100% - 70px)' }}>
        {/* 왼쪽: 병원 정보 */}
        <Box sx={{
          width: '350px',
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              선택된 병원 정보
            </Typography>
          </Box>
          
          {hospitals.length > 0 ? (
            <Box sx={{ p: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                🏥 {hospitals[0].yadmNm}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 20, color: '#666', mt: 0.2 }} />
                  <Typography variant="body2" color="text.secondary">
                    {hospitals[0].addr}
                  </Typography>
                </Box>
                
                {hospitals[0].telno && hospitals[0].telno !== '전화번호 정보 없음' && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 20, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospitals[0].telno}
                    </Typography>
                  </Box>
                )}
                
                {hospitals[0].distance && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Navigation sx={{ fontSize: 20, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      거리: {hospitals[0].distance}
                    </Typography>
                  </Box>
                )}
                
                {hospitals[0].categoryName && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalHospital sx={{ fontSize: 20, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {hospitals[0].categoryName}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {showRoute && routeInfo && (
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  backgroundColor: routeInfo.isTmapRoute ? '#fce4ec' : routeInfo.isRealRoute ? '#e8f5e8' : '#fff3e0', 
                  borderRadius: 1,
                  border: routeInfo.isTmapRoute ? '1px solid #ff4081' : routeInfo.isRealRoute ? '1px solid #4caf50' : '1px solid #ff9800'
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 'bold', 
                    color: routeInfo.isTmapRoute ? '#ad1457' : routeInfo.isRealRoute ? '#2e7d32' : '#e65100', 
                    mb: 0.5 
                  }}>
                    {routeInfo.isTmapRoute ? '🚿 T-map 도보 경로' : routeInfo.isRealRoute ? '🗺️ 카카오 도보 경로' : '📏 직선 거리 (참고용)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    거리: {routeInfo.distance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(routeInfo.isTmapRoute || routeInfo.isRealRoute) ? '도보 시간' : '도보 시간 (추정)'}: {routeInfo.duration}
                  </Typography>
                  {routeInfo.isDirectLine && (
                    <Typography variant="caption" sx={{ 
                      color: '#e65100', 
                      fontStyle: 'italic',
                      display: 'block',
                      mt: 0.5
                    }}>
                      * 실제 도로는 더 길고 시간이 더 걸릴 수 있습니다
                    </Typography>
                  )}
                  {routeInfo.isTmapRoute && (
                    <Typography variant="caption" sx={{ 
                      color: '#ad1457', 
                      fontStyle: 'italic',
                      display: 'block',
                      mt: 0.5
                    }}>
                      * T-map에서 제공하는 정밀한 도보 경로입니다
                    </Typography>
                  )}
                  {routeInfo.isRealRoute && !routeInfo.isTmapRoute && (
                    <Typography variant="caption" sx={{ 
                      color: '#2e7d32', 
                      fontStyle: 'italic',
                      display: 'block',
                      mt: 0.5
                    }}>
                      * 카카오맵에서 제공하는 실제 도보 경로입니다
                    </Typography>
                  )}
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {!showRoute ? (
                  <Button
                    variant="contained"
                    startIcon={<Navigation />}
                    onClick={() => handleDirections(hospitals[0])}
                    sx={{
                      flex: 1,
                      backgroundColor: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#1565c0'
                      }
                    }}
                  >
                    경로 표시
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={clearRoute}
                      sx={{
                        flex: 1,
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#e3f2fd'
                        }
                      }}
                    >
                      경로 지우기
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Navigation />}
                      onClick={() => {
                        const url = `https://map.kakao.com/link/to/${encodeURIComponent(hospitals[0].yadmNm)},${hospitals[0].latitude},${hospitals[0].longitude}`;
                        window.open(url, '_blank');
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: '#1976d2',
                        '&:hover': {
                          backgroundColor: '#1565c0'
                        }
                      }}
                    >
                      내비 시작
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                선택된 병원이 없습니다.
              </Typography>
            </Box>
          )}
        </Box>

        {/* 오른쪽: 지도 */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* KakaoMap 컴포넌트 사용 */}
          <KakaoMap
            width="100%"
            height="100%"
            markers={markers}
            level={3}
            initialCenter={
              hospitals.length > 0 && hospitals[0].latitude && hospitals[0].longitude
                ? { lat: parseFloat(hospitals[0].latitude), lng: parseFloat(hospitals[0].longitude) }
                : currentPosition 
                  ? { lat: currentPosition.latitude, lng: currentPosition.longitude }
                  : { lat: 37.5665, lng: 126.9780 } // 서울 기본 좌표
            }
            onMapLoad={handleMapLoad}
          />
          
          {/* 현재 위치로 이동 버튼 */}
          {currentPosition && (
            <Paper
              elevation={2}
              sx={{
                position: 'absolute',
                top: 10,
                right: 50,
                zIndex: 2
              }}
            >
              <IconButton
                onClick={handleCenterToCurrentLocation}
                sx={{
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                title={currentPosition.isSeniorLocation ? "대상자 위치로 이동" : "현재 위치로 이동"}
              >
                <MyLocation color="primary" />
              </IconButton>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalMapModal;