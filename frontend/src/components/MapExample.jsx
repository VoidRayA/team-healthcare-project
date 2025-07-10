import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';
import KakaoMap from './KakaoMap';
import { searchBusanHospitals, searchBusanPharmacies, getCurrentLocation } from '../utils/kakaoAPI';

const MapExample = () => {
  const [markers, setMarkers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');

  // 현재 위치 가져오기
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      // 현재 위치 마커 추가
      setMarkers([{
        lat: location.y,
        lng: location.x,
        title: '현재 위치',
        content: '내 위치'
      }]);
      
      alert('현재 위치를 가져왔습니다.');
    } catch (error) {
      console.error('위치 가져오기 실패:', error);
      alert('위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 주변 병원 검색
  const handleSearchHospitals = async () => {
    try {
      setLoading(true);
      const location = currentLocation || { x: 129.0756, y: 35.1796 }; // 현재 위치 또는 부산 중심
      
      const result = await searchBusanHospitals(location, { size: 10 });
      
      if (result.success) {
        setHospitals(result.places);
        
        // 병원 마커 추가
        const hospitalMarkers = result.places.map(place => ({
          lat: place.y,
          lng: place.x,
          title: place.name,
          content: `
            <div>
              <strong>${place.name}</strong><br/>
              ${place.address}<br/>
              ${place.phone || '전화번호 없음'}<br/>
              거리: ${place.distance || '계산 불가'}
            </div>
          `
        }));
        
        // 현재 위치 마커 포함
        if (currentLocation) {
          hospitalMarkers.unshift({
            lat: currentLocation.y,
            lng: currentLocation.x,
            title: '현재 위치',
            content: '내 위치'
          });
        }
        
        setMarkers(hospitalMarkers);
      }
    } catch (error) {
      console.error('병원 검색 실패:', error);
      alert('병원 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주변 약국 검색
  const handleSearchPharmacies = async () => {
    try {
      setLoading(true);
      const location = currentLocation || { x: 129.0756, y: 35.1796 };
      
      const result = await searchBusanPharmacies(location, { size: 10 });
      
      if (result.success) {
        setPharmacies(result.places);
        
        // 약국 마커 추가
        const pharmacyMarkers = result.places.map(place => ({
          lat: place.y,
          lng: place.x,
          title: place.name,
          content: `
            <div>
              <strong>${place.name}</strong><br/>
              ${place.address}<br/>
              ${place.phone || '전화번호 없음'}<br/>
              거리: ${place.distance || '계산 불가'}
            </div>
          `
        }));
        
        // 현재 위치 마커 포함
        if (currentLocation) {
          pharmacyMarkers.unshift({
            lat: currentLocation.y,
            lng: currentLocation.x,
            title: '현재 위치',
            content: '내 위치'
          });
        }
        
        setMarkers(pharmacyMarkers);
      }
    } catch (error) {
      console.error('약국 검색 실패:', error);
      alert('약국 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        카카오맵 테스트
      </Typography>
      
      {/* 버튼 그룹 */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={handleGetCurrentLocation}
          disabled={loading}
        >
          현재 위치 가져오기
        </Button>
        <Button 
          variant="contained" 
          color="secondary"
          onClick={handleSearchHospitals}
          disabled={loading}
        >
          주변 병원 검색
        </Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={handleSearchPharmacies}
          disabled={loading}
        >
          주변 약국 검색
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {/* 지도 */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <KakaoMap 
          height="500px"
          markers={markers}
          level={4}
        />
      </Paper>

      {/* 검색 결과 */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 병원 목록 */}
        {hospitals.length > 0 && (
          <Paper sx={{ flex: 1, minWidth: 300, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              병원 목록 ({hospitals.length}개)
            </Typography>
            <List>
              {hospitals.map((hospital, index) => (
                <React.Fragment key={hospital.id}>
                  <ListItem>
                    <ListItemText
                      primary={hospital.name}
                      secondary={
                        <>
                          {hospital.address}<br/>
                          {hospital.phone && `전화: ${hospital.phone}`}<br/>
                          {hospital.distance && `거리: ${hospital.distance}`}
                        </>
                      }
                    />
                  </ListItem>
                  {index < hospitals.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* 약국 목록 */}
        {pharmacies.length > 0 && (
          <Paper sx={{ flex: 1, minWidth: 300, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              약국 목록 ({pharmacies.length}개)
            </Typography>
            <List>
              {pharmacies.map((pharmacy, index) => (
                <React.Fragment key={pharmacy.id}>
                  <ListItem>
                    <ListItemText
                      primary={pharmacy.name}
                      secondary={
                        <>
                          {pharmacy.address}<br/>
                          {pharmacy.phone && `전화: ${pharmacy.phone}`}<br/>
                          {pharmacy.distance && `거리: ${pharmacy.distance}`}
                        </>
                      }
                    />
                  </ListItem>
                  {index < pharmacies.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* 현재 위치 정보 */}
      {currentLocation && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="body2">
            현재 위치: 위도 {currentLocation.y.toFixed(6)}, 경도 {currentLocation.x.toFixed(6)}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default MapExample;
