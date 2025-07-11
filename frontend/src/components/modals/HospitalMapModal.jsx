import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Paper,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import { Close, LocalHospital, Phone, LocationOn, Navigation, MyLocation, Route } from '@mui/icons-material';
import KakaoMap from '../KakaoMap';

// T-map API 비활성화 - SK OpenAPI 도메인 등록 문제
// 임시로 카카오 API 만 사용

const HospitalMapModal = ({ open, onClose, hospitals, currentPosition }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  // T-map 관련 상태 제거

  const handleClose = () => {
    clearRoute();
    setRouteError(null);
    onClose();
  };

  // T-map API 제거 - 카카오 API만 사용

  // 지도용 마커 데이터 생성
  const markers = React.useMemo(() => {
    const allMarkers = [];
    
    // 현재 위치 마커
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
        isCurrentLocation: true
      });
    }
    
    // 병원 마커들
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

  // 백엔드 T-map API 호출 (강제 시도)
  const tryBackendTmapRoute = async (hospital) => {
    try {
      console.log('🚀 백엔드 T-map 도보 경로 API 호출... (강제 시도)');
      
      const response = await fetch(
        `http://localhost:8080/api/hospital/route/tmap?startLat=${currentPosition.latitude}&startLon=${currentPosition.longitude}&endLat=${hospital.latitude}&endLon=${hospital.longitude}&startName=현재위치&endName=${encodeURIComponent(hospital.yadmNm)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 백엔드 T-map API 응답:', data);
        
        // T-map 응답 처리 - response 래핑 확인
        let tmapData = data;
        if (data.response) {
          tmapData = data.response; // response 래핑이 있다면 언래핑
        }
        
        console.log('🔍 T-map 데이터 구조 분석:', tmapData);
        
        // T-map 에러 응답 처리 (header/body 구조)
        if (tmapData && tmapData.header && tmapData.header.resultCode !== '00') {
          console.error('❌ T-map API 공공데이터 형식 에러:', tmapData.header.resultMsg);
          return false;
        }
        
        // T-map 에러 응답 처리 (error 필드)
        if (tmapData && tmapData.error) {
          console.error('❌ T-map API 에러:', tmapData.error);
          return false;
        }
        
        if (tmapData && tmapData.features && tmapData.features.length > 0) {
          console.log('✅ T-map features 발견:', tmapData.features.length, '개');
          return drawTmapRoute(tmapData, hospital);
        } else {
          console.warn('⚠️ T-map 데이터에 features가 없음:', Object.keys(tmapData));
        }
      } else {
        console.error('❌ 백엔드 T-map API 오류:', response.status, await response.text());
      }
      
      return false;
    } catch (error) {
      console.error('❌ 백엔드 T-map API 예외:', error);
      return false;
    }
  };

  // T-map 경로 그리기 (카카오맵에 표시)
  const drawTmapRoute = (tmapResult, hospital) => {
    try {
      console.log('🎨 T-map 경로를 카카오맵에 그리기 시작');
      
      if (!tmapResult || !tmapResult.features) {
        console.warn('T-map 결과에 features가 없습니다');
        return false;
      }

      const path = [];
      let totalDistance = 0;
      let totalTime = 0;

      // T-map features에서 경로 좌표 추출
      tmapResult.features.forEach(feature => {
        if (feature.geometry && feature.geometry.type === 'LineString') {
          feature.geometry.coordinates.forEach(coord => {
            const lng = coord[0];
            const lat = coord[1];
            if (lat && lng) {
              path.push(new window.kakao.maps.LatLng(lat, lng));
            }
          });
        }

        // 거리와 시간 정보 수집
        if (feature.properties) {
          if (feature.properties.totalDistance) {
            totalDistance = feature.properties.totalDistance;
          }
          if (feature.properties.totalTime) {
            totalTime = feature.properties.totalTime;
          }
          if (feature.properties.distance) {
            totalDistance += feature.properties.distance;
          }
          if (feature.properties.time) {
            totalTime += feature.properties.time;
          }
        }
      });

      if (path.length > 1) {
        // 기존 경로 제거
        if (window.currentPolyline) {
          window.currentPolyline.setMap(null);
        }

        // 카카오맵에 T-map 경로 표시
        const polyline = new window.kakao.maps.Polyline({
          path: path,
          strokeWeight: 6,
          strokeColor: '#FF4081', // 핑크색 - T-map 경로
          strokeOpacity: 0.9,
          strokeStyle: 'solid'
        });

        polyline.setMap(mapRef);
        window.currentPolyline = polyline;

        // 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        mapRef.setBounds(bounds, 50);

        // 경로 정보 설정
        setRouteInfo({
          distance: totalDistance >= 1000 ? 
            `${(totalDistance / 1000).toFixed(1)}km` : 
            `${Math.round(totalDistance)}m`,
          duration: totalTime > 0 ? `${Math.ceil(totalTime / 60)}분` : '정보 없음',
          isTmapRoute: true,
          apiSource: 'T-map'
        });

        setShowRoute(true);
        console.log('✅ T-map 경로 표시 성공!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('T-map 경로 그리기 오류:', error);
      return false;
    }
  };

  // 경로 검색 메인 함수
  const handleDirections = useCallback(async (hospital) => {
    if (!currentPosition || !mapRef) {
      setRouteError('현재 위치 정보가 없습니다.');
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);
    clearRoute();

    try {
      console.log('🚀 T-map 도보 경로 검색 시작... (강제 시도)');
      
      // 백엔드 T-map API 시도
      const tmapSuccess = await tryBackendTmapRoute(hospital);
      
      if (!tmapSuccess) {
        // T-map 실패 시 직선 경로로 폴백
        console.log('T-map 실패, 직선 경로로 폴백...');
        setRouteError('T-map API 401 오류로 직선 거리로 표시합니다.');
        await showDirectLineRoute(hospital);
      }

    } catch (error) {
      console.error('경로 검색 중 오류:', error);
      setRouteError('경로 검색에 실패했습니다. 직선 거리로 표시합니다.');
      await showDirectLineRoute(hospital);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [currentPosition, mapRef]);

  // 직선 경로 표시 (폴백)
  const showDirectLineRoute = async (hospital) => {
    try {
      const startPos = new window.kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude);
      const endPos = new window.kakao.maps.LatLng(parseFloat(hospital.latitude), parseFloat(hospital.longitude));

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
        isDirectLine: true,
        apiSource: 'Direct'
      });

      setShowRoute(true);
      console.log('✅ 직선 경로 표시 완료 (폴백)');
    } catch (error) {
      console.error('직선 경로 표시 오류:', error);
      setRouteError('경로를 표시할 수 없습니다.');
    }
  };

  // 거리 계산 함수
  const getDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
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

  // 경로 지우기
  const clearRoute = () => {
    if (window.currentPolyline) {
      window.currentPolyline.setMap(null);
      window.currentPolyline = null;
    }
    setShowRoute(false);
    setRouteInfo(null);
  };

  // 지도 로드 핸들러
  const handleMapLoad = (map) => {
    setMapRef(map);
  };

  // 현재 위치로 이동
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

  // 경로 상태에 따른 색상 반환
  const getRouteStatusColor = () => {
    if (routeInfo?.isTmapRoute) return '#ff4081';
    if (routeInfo?.isDirectLine) return '#ff9800';
    return '#1976d2';
  };

  // 경로 상태에 따른 배경색 반환
  const getRouteStatusBgColor = () => {
    if (routeInfo?.isTmapRoute) return '#fce4ec';
    if (routeInfo?.isDirectLine) return '#fff3e0';
    return '#e3f2fd';
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
            주변 병원 지도 (T-map 경로 강제 시도)
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
              </Box>

              {/* 경로 로딩 상태 */}
              {isLoadingRoute && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    T-map 경로 검색 중... (강제 시도)
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {/* 경로 에러 표시 */}
              {routeError && !isLoadingRoute && (
                <Alert severity="warning" sx={{ mt: 2, fontSize: '0.875rem' }}>
                  {routeError}
                </Alert>
              )}
              
              {/* 경로 정보 표시 */}
              {showRoute && routeInfo && !isLoadingRoute && (
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  backgroundColor: getRouteStatusBgColor(),
                  borderRadius: 1,
                  border: `1px solid ${getRouteStatusColor()}`
                }}>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 'bold', 
                    color: getRouteStatusColor(),
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Route fontSize="small" />
                    {routeInfo.isTmapRoute && '🚀 T-map 정밀 경로'}
                    {routeInfo.isDirectLine && '📏 직선 거리 (참고용)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    거리: {routeInfo.distance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {routeInfo.isTmapRoute ? '도보 시간' : '도보 시간 (추정)'}: {routeInfo.duration}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: getRouteStatusColor(),
                    fontStyle: 'italic',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {routeInfo.isTmapRoute && '* T-map에서 제공하는 정밀 도보 경로'}
                    {routeInfo.isDirectLine && '* T-map API 401 오류로 직선 거리 표시'}
                  </Typography>
                </Box>
              )}
              
              {/* 버튼 그룹 */}
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {!showRoute && !isLoadingRoute ? (
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
                ) : !isLoadingRoute && (
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
                  : { lat: 35.1796, lng: 129.0756 }
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