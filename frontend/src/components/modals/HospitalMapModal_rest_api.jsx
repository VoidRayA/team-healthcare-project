import React, { useState, useCallback } from 'react';
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

const HospitalMapModal = ({ open, onClose, hospitals, currentPosition }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const handleClose = () => {
    clearRoute();
    setRouteError(null);
    onClose();
  };

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

  // T-map API를 통한 경로 검색 개선 버전
  const handleDirections = useCallback(async (hospital) => {
    if (!currentPosition || !mapRef) {
      setRouteError('현재 위치 정보가 없습니다.');
      return;
    }

    setIsLoadingRoute(true);
    setRouteError(null);
    clearRoute();

    try {
      console.log('🚀 T-map 경로 검색 시작...');
      console.log('출발:', currentPosition.latitude, currentPosition.longitude);
      console.log('도착:', hospital.latitude, hospital.longitude);

      // 1. T-map API 우선 시도
      const tmapSuccess = await tryTmapRoute(hospital);
      if (tmapSuccess) {
        setIsLoadingRoute(false);
        return;
      }

      // T-map API 전용 모드 - 실패 시 명확한 에러 메시지
      console.log('T-map 실패 - T-map API 필수 사용 모드');
      
      // T-map API 403 에러 시 사용자에게 명확한 안내
      if (tmapData && tmapData.response && tmapData.response.header) {
        const header = tmapData.response.header;
        if (header.resultCode === '99' && header.resultMsg.includes('403')) {
          setRouteError(`T-map API 인증 오류 (403): SK OpenAPI 콘솔에서 도메인 등록 및 API 키 확인이 필요합니다.`);
          setIsLoadingRoute(false);
          return;
        }
      }
      
      // 기타 T-map 에러
      setRouteError('T-map API 오류: ' + (tmapData?.response?.header?.resultMsg || '알 수 없는 오류'));
      setIsLoadingRoute(false);

    } catch (error) {
      console.error('경로 검색 중 오류:', error);
      setRouteError('경로를 찾을 수 없습니다. 네트워크 연결을 확인해주세요.');
    } finally {
      setIsLoadingRoute(false);
    }
  }, [currentPosition, mapRef]);

  // T-map API 호출 시도
  const tryTmapRoute = async (hospital) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/hospital/route/tmap?startLat=${currentPosition.latitude}&startLon=${currentPosition.longitude}&endLat=${hospital.latitude}&endLon=${hospital.longitude}&startName=현재위치&endName=${encodeURIComponent(hospital.yadmNm)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('🔍 T-map 응답 상태:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('T-map API 오류:', response.status, errorText);
        
        if (response.status === 403) {
          console.error('T-map API 403 Forbidden - API 키 또는 도메인 설정 확인 필요');
          setRouteError('T-map API 인증 오류 (403) - 카카오 API로 대체 시도 중...');
        }
        return false;
      }

      const tmapData = await response.json();
      console.log('🔍 T-map 전체 응답 데이터:', tmapData);

      // T-map 응답 구조 확인 - 에러 응답도 체크
      let routeData = null;
      
      // 백엔드 에러 응답 체크 먼저
      if (tmapData && tmapData.response && tmapData.response.header) {
        const header = tmapData.response.header;
        if (header.resultCode === '99') {
          console.warn('❌ 백엔드에서 T-map API 에러 응답:', header.resultMsg);
          return false;
        }
      }

      // 1. 기존 예상 구조: tmapData.features
      if (tmapData && tmapData.features && tmapData.features.length > 0) {
        console.log('✅ T-map 기본 구조 (features) 발견');
        routeData = tmapData;
      }
      // 2. 백엔드에서 래핑된 구조: tmapData.response
      else if (tmapData && tmapData.response) {
        console.log('🔍 T-map 백엔드 래핑 구조 발견:', tmapData.response);
        
        // 2-1. response 내부에 features가 있는 경우
        if (tmapData.response.features && tmapData.response.features.length > 0) {
          console.log('✅ T-map response.features 구조 발견');
          routeData = tmapData.response;
        }
        // 2-2. response 내부에 body가 있는 경우
        else if (tmapData.response.body) {
          console.log('🔍 T-map response.body 구조 발견:', tmapData.response.body);
          
          // body 내부에 features가 있는 경우
          if (tmapData.response.body.features && tmapData.response.body.features.length > 0) {
            console.log('✅ T-map response.body.features 구조 발견');
            routeData = tmapData.response.body;
          }
        }
      }
      // 3. 다른 구조들 확인
      else {
        console.log('🔍 T-map 응답 구조 분석:');
        console.log('- tmapData keys:', Object.keys(tmapData || {}));
        if (tmapData?.response) {
          console.log('- tmapData.response keys:', Object.keys(tmapData.response || {}));
        }
        
        // 혹시 다른 키에 경로 데이터가 있는지 확인
        for (const key of Object.keys(tmapData || {})) {
          const value = tmapData[key];
          if (value && typeof value === 'object' && value.features) {
            console.log(`✅ T-map 경로 데이터를 ${key}에서 발견`);
            routeData = value;
            break;
          }
        }
      }

      if (routeData && routeData.features && routeData.features.length > 0) {
        console.log('🎯 T-map 경로 데이터 파싱 시작, features 개수:', routeData.features.length);
        return drawTmapRoute(routeData, hospital);
      } else {
        console.warn('❌ T-map 응답에서 유효한 경로 데이터를 찾을 수 없음');
        console.log('전체 응답 구조:', JSON.stringify(tmapData, null, 2));
        return false;
      }

    } catch (error) {
      console.error('T-map API 호출 오류:', error);
      return false;
    }
  };

  // T-map 경로 그리기
  const drawTmapRoute = (tmapData, hospital) => {
    try {
      console.log('🎨 T-map 경로 그리기 시작');
      const path = [];
      let totalDistance = 0;
      let totalTime = 0;

      // T-map 응답에서 경로 좌표 추출
      tmapData.features.forEach((feature, index) => {
        console.log(`🔍 Feature ${index + 1}:`, {
          type: feature.geometry?.type,
          propertiesKeys: Object.keys(feature.properties || {}),
          coordinatesLength: feature.geometry?.coordinates?.length
        });

        if (feature.geometry) {
          if (feature.geometry.type === 'LineString') {
            // LineString의 좌표들을 경로에 추가
            feature.geometry.coordinates.forEach(coord => {
              const lng = coord[0]; // 경도
              const lat = coord[1]; // 위도
              if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                path.push(new window.kakao.maps.LatLng(lat, lng));
              }
            });
            console.log(`📍 LineString에서 ${feature.geometry.coordinates.length}개 좌표 추가`);
          } else if (feature.geometry.type === 'Point') {
            // Point도 처리 (시작점, 끝점 등)
            const coord = feature.geometry.coordinates;
            const lng = coord[0];
            const lat = coord[1];
            if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              path.push(new window.kakao.maps.LatLng(lat, lng));
            }
            console.log(`📍 Point 좌표 추가: ${lat}, ${lng}`);
          }
        }

        // 거리와 시간 정보 수집
        if (feature.properties) {
          console.log(`📊 Properties:`, feature.properties);
          
          // 다양한 속성명 시도
          const distance = feature.properties.distance || 
                          feature.properties.totalDistance || 
                          feature.properties.length || 
                          feature.properties.Distance;
          
          const time = feature.properties.time || 
                      feature.properties.totalTime || 
                      feature.properties.duration || 
                      feature.properties.Time;

          if (distance) {
            totalDistance += Number(distance);
            console.log(`📏 거리 추가: ${distance}m (누적: ${totalDistance}m)`);
          }
          if (time) {
            totalTime += Number(time);
            console.log(`⏱️ 시간 추가: ${time}초 (누적: ${totalTime}초)`);
          }
        }
      });

      console.log(`🏁 T-map 파싱 완료: ${path.length}개 지점, ${totalDistance}m, ${totalTime}초`);

      if (path.length > 1) {
        // 폴리라인 생성 및 지도에 표시
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

        // 경로 정보 설정 - 시간이 없으면 평균 도보속도로 계산
        const finalTime = totalTime > 0 ? totalTime : Math.ceil(totalDistance / 83); // 5km/h ≈ 83m/min
        
        setRouteInfo({
          distance: totalDistance >= 1000 ? 
            `${(totalDistance / 1000).toFixed(1)}km` : 
            `${Math.round(totalDistance)}m`,
          duration: `${Math.ceil(finalTime / 60)}분`,
          isTmapRoute: true,
          apiSource: 'T-map'
        });

        setShowRoute(true);
        console.log('✅ T-map 경로 표시 성공!');
        return true;
      } else {
        console.warn('❌ T-map 경로 지점이 충분하지 않음:', path.length);
        return false;
      }

    } catch (error) {
      console.error('T-map 경로 그리기 오류:', error);
      return false;
    }
  };

  // 카카오 API 시도
  const tryKakaoRoute = async (hospital) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/hospital/route/kakao?startLat=${currentPosition.latitude}&startLon=${currentPosition.longitude}&endLat=${hospital.latitude}&endLon=${hospital.longitude}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        console.warn('카카오 API 오류:', response.status);
        return false;
      }

      const data = await response.json();
      console.log('카카오 API 응답:', data);

      // 카카오 API도 백엔드에서 래핑될 수 있음 - 래핑 해제
      let routeData = data;
      
      // 백엔드에서 래핑된 경우 해제
      if (data.response && data.response.routes) {
        routeData = data.response;
        console.log('백엔드 래핑 해제:', routeData);
      }
      // 직접 routes가 있는 경우
      else if (data.routes) {
        routeData = data;
        console.log('직접 routes 구조:', routeData);
      }
      else {
        console.warn('알 수 없는 카카오 응답 구조:', data);
        return false;
      }

      if (routeData.routes && routeData.routes.length > 0) {
        return drawKakaoRoute(routeData.routes[0], hospital);
      }

      return false;
    } catch (error) {
      console.error('카카오 API 호출 오류:', error);
      return false;
    }
  };

  // 카카오 경로 그리기 (대체 API 지원)
  const drawKakaoRoute = (route, hospital) => {
    try {
      console.log('🎨 카카오 경로 그리기 시작, route:', route);
      const path = [];

      // 대체 API의 간단한 구조 처리
      if (route.sections && route.sections.length > 0) {
        route.sections.forEach(section => {
          if (section.roads && section.roads.length > 0) {
            section.roads.forEach(road => {
              if (road.vertexes && road.vertexes.length >= 4) {
                // vertexes: [lng1, lat1, lng2, lat2, ...]
                for (let i = 0; i < road.vertexes.length; i += 2) {
                  const lng = road.vertexes[i];
                  const lat = road.vertexes[i + 1];
                  if (lng && lat) {
                    path.push(new window.kakao.maps.LatLng(lat, lng));
                    console.log(`📍 좌표 추가: ${lat}, ${lng}`);
                  }
                }
              }
            });
          }
        });
      }
      
      console.log(`📏 총 ${path.length}개 좌표 추출 완료`);

      if (path.length > 1) {
        const polyline = new window.kakao.maps.Polyline({
          path: path,
          strokeWeight: 6,
          strokeColor: '#4CAF50', // 녹색 - 카카오 경로
          strokeOpacity: 0.9,
          strokeStyle: 'solid'
        });

        polyline.setMap(mapRef);
        window.currentPolyline = polyline;

        const bounds = new window.kakao.maps.LatLngBounds();
        path.forEach(point => bounds.extend(point));
        mapRef.setBounds(bounds, 50);

        const summary = route.summary;
        setRouteInfo({
          distance: summary.distance >= 1000 ? 
            `${(summary.distance / 1000).toFixed(1)}km` : 
            `${Math.round(summary.distance)}m`,
          duration: `${Math.ceil(summary.duration / 60)}분`,
          isRealRoute: true,
          apiSource: 'Kakao'
        });

        setShowRoute(true);
        console.log('✅ 카카오 경로 표시 성공!');
        return true;
      } else {
        console.warn('❌ 카카오 경로 좌표가 충분하지 않음:', path.length);
        return false;
      }

    } catch (error) {
      console.error('카카오 경로 그리기 오류:', error);
      return false;
    }
  };

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
      setRouteError('정확한 경로를 찾을 수 없어 직선 거리로 표시합니다.');
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
    if (routeInfo?.isRealRoute) return '#4caf50';
    if (routeInfo?.isDirectLine) return '#ff9800';
    return '#1976d2';
  };

  // 경로 상태에 따른 배경색 반환
  const getRouteStatusBgColor = () => {
    if (routeInfo?.isTmapRoute) return '#fce4ec';
    if (routeInfo?.isRealRoute) return '#e8f5e8';
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
              </Box>

              {/* 경로 로딩 상태 */}
              {isLoadingRoute && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    경로 검색 중... (T-map → 카카오 → 직선)
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
                    {routeInfo.isRealRoute && !routeInfo.isTmapRoute && '🗺️ 카카오 실제 경로'}
                    {routeInfo.isDirectLine && '📏 직선 거리 (참고용)'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    거리: {routeInfo.distance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(routeInfo.isTmapRoute || routeInfo.isRealRoute) ? '도보 시간' : '도보 시간 (추정)'}: {routeInfo.duration}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: getRouteStatusColor(),
                    fontStyle: 'italic',
                    display: 'block',
                    mt: 0.5
                  }}>
                    {routeInfo.isTmapRoute && '* T-map 정밀 도보 경로 (가장 정확)'}
                    {routeInfo.isRealRoute && !routeInfo.isTmapRoute && '* 카카오맵 실제 도보 경로'}
                    {routeInfo.isDirectLine && '* 실제 경로는 더 길 수 있습니다'}
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