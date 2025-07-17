import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Avatar, Chip, Alert } from '@mui/material';
import { LocationOn, LocalHospital, LocalPharmacy, Warning } from '@mui/icons-material';
import KakaoMap from './KakaoMap';
import { searchHospitalsByLocation, searchPharmaciesByLocation } from '../utils/kakaoAPI';

const SeniorLocationMap = ({ seniorId, seniorName }) => {
  const [markers, setMarkers] = useState([]);
  const [seniorLocation, setSeniorLocation] = useState(null);
  const [nearbyFacilities, setNearbyFacilities] = useState({ hospitals: [], pharmacies: [] });
  const [showFacilities, setShowFacilities] = useState({ hospitals: false, pharmacies: false });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 시뮬레이션용 위치 (실제로는 GPS 트래커나 스마트폰에서 받아옴)
  const simulateLocation = () => {
    // 서울 지역 내 랜덤 위치
    const baseLatitude = 37.5665;
    const baseLongitude = 126.9780;
    const variance = 0.05; // 약 5km 범위

    return {
      lat: baseLatitude + (Math.random() - 0.5) * variance,
      lng: baseLongitude + (Math.random() - 0.5) * variance,
      timestamp: new Date()
    };
  };

  // 위치 업데이트 (실제로는 서버에서 받아옴)
  const updateSeniorLocation = () => {
    const newLocation = simulateLocation();
    setSeniorLocation(newLocation);
    setLastUpdate(new Date());
    
    // 마커 업데이트
    setMarkers([{
      lat: newLocation.lat,
      lng: newLocation.lng,
      title: seniorName || '보호 대상자',
      content: `
        <div style="padding: 10px;">
          <strong>${seniorName || '보호 대상자'}</strong><br/>
          최종 업데이트: ${new Date().toLocaleTimeString('ko-KR')}<br/>
          <small>위도: ${newLocation.lat.toFixed(6)}</small><br/>
          <small>경도: ${newLocation.lng.toFixed(6)}</small>
        </div>
      `
    }]);
  };

  // 주변 의료시설 검색
  const searchNearbyFacilities = async () => {
    if (!seniorLocation) return;

    setLoading(true);
    try {
      const [hospitalsResult, pharmaciesResult] = await Promise.all([
        searchHospitalsByLocation({ x: seniorLocation.lng, y: seniorLocation.lat }, { size: 5 }),
        searchPharmaciesByLocation({ x: seniorLocation.lng, y: seniorLocation.lat }, { size: 5 })
      ]);

      setNearbyFacilities({
        hospitals: hospitalsResult.places || [],
        pharmacies: pharmaciesResult.places || []
      });
    } catch (error) {
      console.error('주변 시설 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 병원 마커 표시/숨기기
  const toggleHospitals = () => {
    if (!seniorLocation) return;

    if (showFacilities.hospitals) {
      // 숨기기 - 보호 대상자 마커만 표시
      setMarkers([{
        lat: seniorLocation.lat,
        lng: seniorLocation.lng,
        title: seniorName || '보호 대상자',
        content: `<strong>${seniorName || '보호 대상자'}</strong>`
      }]);
      setShowFacilities(prev => ({ ...prev, hospitals: false }));
    } else {
      // 표시하기
      const hospitalMarkers = nearbyFacilities.hospitals.map(hospital => ({
        lat: hospital.y,
        lng: hospital.x,
        title: hospital.name,
        content: `
          <div style="padding: 5px;">
            <strong>🏥 ${hospital.name}</strong><br/>
            ${hospital.address}<br/>
            ${hospital.phone || '전화번호 없음'}<br/>
            거리: ${hospital.distance || '계산 중...'}m
          </div>
        `
      }));

      setMarkers([
        {
          lat: seniorLocation.lat,
          lng: seniorLocation.lng,
          title: seniorName || '보호 대상자',
          content: `<strong>${seniorName || '보호 대상자'}</strong>`
        },
        ...hospitalMarkers
      ]);
      setShowFacilities(prev => ({ ...prev, hospitals: true, pharmacies: false }));
    }
  };

  // 약국 마커 표시/숨기기
  const togglePharmacies = () => {
    if (!seniorLocation) return;

    if (showFacilities.pharmacies) {
      // 숨기기
      setMarkers([{
        lat: seniorLocation.lat,
        lng: seniorLocation.lng,
        title: seniorName || '보호 대상자',
        content: `<strong>${seniorName || '보호 대상자'}</strong>`
      }]);
      setShowFacilities(prev => ({ ...prev, pharmacies: false }));
    } else {
      // 표시하기
      const pharmacyMarkers = nearbyFacilities.pharmacies.map(pharmacy => ({
        lat: pharmacy.y,
        lng: pharmacy.x,
        title: pharmacy.name,
        content: `
          <div style="padding: 5px;">
            <strong>💊 ${pharmacy.name}</strong><br/>
            ${pharmacy.address}<br/>
            ${pharmacy.phone || '전화번호 없음'}<br/>
            거리: ${pharmacy.distance || '계산 중...'}m
          </div>
        `
      }));

      setMarkers([
        {
          lat: seniorLocation.lat,
          lng: seniorLocation.lng,
          title: seniorName || '보호 대상자',
          content: `<strong>${seniorName || '보호 대상자'}</strong>`
        },
        ...pharmacyMarkers
      ]);
      setShowFacilities(prev => ({ ...prev, pharmacies: true, hospitals: false }));
    }
  };

  // 컴포넌트 마운트 시 위치 업데이트
  useEffect(() => {
    updateSeniorLocation();
    
    // 30초마다 위치 업데이트 (실제로는 더 긴 간격 사용)
    const interval = setInterval(updateSeniorLocation, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // 위치가 업데이트되면 주변 시설 검색
  useEffect(() => {
    if (seniorLocation) {
      searchNearbyFacilities();
    }
  }, [seniorLocation]);

  return (
    <Box>
      {/* 상단 정보 바 */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LocationOn />
          </Avatar>
          <Box>
            <Typography variant="h6">{seniorName || '보호 대상자'} 님의 위치</Typography>
            <Typography variant="body2" color="text.secondary">
              마지막 업데이트: {lastUpdate ? lastUpdate.toLocaleTimeString('ko-KR') : '확인 중...'}
            </Typography>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          color="error" 
          startIcon={<Warning />}
          size="small"
        >
          긴급 호출
        </Button>
      </Paper>

      {/* 제어 버튼 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={updateSeniorLocation}
        >
          위치 새로고침
        </Button>
        <Button
          variant={showFacilities.hospitals ? 'contained' : 'outlined'}
          size="small"
          startIcon={<LocalHospital />}
          onClick={toggleHospitals}
          disabled={loading || nearbyFacilities.hospitals.length === 0}
        >
          주변 병원 ({nearbyFacilities.hospitals.length})
        </Button>
        <Button
          variant={showFacilities.pharmacies ? 'contained' : 'outlined'}
          size="small"
          startIcon={<LocalPharmacy />}
          onClick={togglePharmacies}
          disabled={loading || nearbyFacilities.pharmacies.length === 0}
        >
          주변 약국 ({nearbyFacilities.pharmacies.length})
        </Button>
      </Box>

      {/* 지도 */}
      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        <KakaoMap
          height="500px"
          markers={markers}
          level={4}
          initialCenter={seniorLocation ? { lat: seniorLocation.lat, lng: seniorLocation.lng } : undefined}
        />
      </Paper>

      {/* 위치 정보 */}
      {seniorLocation && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>현재 위치 정보</strong>
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={`위도: ${seniorLocation.lat.toFixed(6)}`} size="small" />
            <Chip label={`경도: ${seniorLocation.lng.toFixed(6)}`} size="small" />
            <Chip 
              label="정상 범위" 
              size="small" 
              color="success"
              variant="outlined"
            />
          </Box>
        </Paper>
      )}

      {/* 안전 구역 이탈 알림 (예시) */}
      <Alert severity="info" sx={{ mt: 2 }}>
        💡 안전 구역을 설정하면 보호 대상자가 지정된 범위를 벗어날 때 알림을 받을 수 있습니다.
      </Alert>
    </Box>
  );
};

export default SeniorLocationMap;
