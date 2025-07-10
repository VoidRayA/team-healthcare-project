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

  // 지도용 마커 데이터 생성
  const markers = React.useMemo(() => {
    const allMarkers = [];
    
    // 현재 위치 마커를 먼저 추가 (파란색 특별 마커)
    if (currentPosition) {
      allMarkers.push({
        lat: currentPosition.latitude,
        lng: currentPosition.longitude,
        title: '내 위치',
        content: `
          <div style="padding: 10px; text-align: center;">
            <strong style="color: #1976d2; font-size: 14px;">📍 현재 위치</strong><br/>
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

  const handleDirections = (hospital) => {
    // 카카오맵 길찾기 URL
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(hospital.yadmNm)},${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
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
      onClose={onClose}
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
              label="현재 위치 기준"
              size="small"
              color="primary"
              variant="outlined"              
            />
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#666' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', height: 'calc(100% - 70px)' }}>
        {/* 왼쪽: 병원 목록 */}
        <Box sx={{
          width: '350px',
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: 'white' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              검색된 병원 ({hospitals.length}개)
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {hospitals.map((hospital, index) => (
              <ListItem
                key={index}
                onClick={() => handleHospitalClick(hospital)}
                sx={{
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: selectedHospital?.yadmNm === hospital.yadmNm ? '#e3f2fd' : 'white',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {hospital.yadmNm}
                      </Typography>
                      {hospital.distance && (
                        <Chip
                          label={hospital.distance}
                          size="small"
                          sx={{
                            backgroundColor: '#1976d2',
                            color: 'white',
                            fontSize: '12px'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box component="span">
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {hospital.addr}
                        </Typography>
                      </Box>
                      {hospital.telno && hospital.telno !== '전화번호 정보 없음' && (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone sx={{ fontSize: 16, color: '#666' }} />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {hospital.telno}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* 오른쪽: 지도 */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* KakaoMap 컴포넌트 사용 */}
          <KakaoMap
            width="100%"
            height="100%"
            markers={markers}
            level={5}
            initialCenter={
              currentPosition 
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
                right: 10,
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
                title="현재 위치로 이동"
              >
                <MyLocation color="primary" />
              </IconButton>
            </Paper>
          )}
          
          {/* 선택된 병원 정보 오버레이 */}
          {selectedHospital && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                p: 2,
                backgroundColor: 'white',
                borderRadius: 2,
                zIndex: 2
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedHospital.yadmNm}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedHospital.addr}
              </Typography>
              {selectedHospital.telno && selectedHospital.telno !== '전화번호 정보 없음' && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📞 {selectedHospital.telno}
                </Typography>
              )}
              <Button
                variant="contained"
                startIcon={<Navigation />}
                onClick={() => handleDirections(selectedHospital)}
                sx={{
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
                fullWidth
              >
                길찾기
              </Button>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalMapModal;
