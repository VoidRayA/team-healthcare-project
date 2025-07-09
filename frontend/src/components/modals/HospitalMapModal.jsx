import React, { useEffect, useRef, useState } from 'react';
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
  Button,
  CircularProgress
} from '@mui/material';
import { Close, LocalHospital, Phone, LocationOn, Navigation } from '@mui/icons-material';

const HospitalMapModal = ({ open, onClose, hospitals, currentPosition }) => {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [map, setMap] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  useEffect(() => {
    console.log('HospitalMapModal useEffect - open:', open);
    console.log('hospitals:', hospitals);
    console.log('currentPosition:', currentPosition);
    
    if (open && mapContainer.current) {
      setMapLoading(true);
      
      // 카카오맵이 로드될 때까지 대기
      const checkKakaoMap = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakaoMap);
          console.log('카카오맵 로드 완료!');
          
          try {
            // 지도 초기화
            const options = {
              center: new window.kakao.maps.LatLng(
                currentPosition?.latitude || 35.1796,
                currentPosition?.longitude || 129.0756
              ),
              level: 5
            };

            const mapObj = new window.kakao.maps.Map(mapContainer.current, options);
            mapInstance.current = mapObj;
            setMap(mapObj);
            setMapLoading(false);

            // 현재 위치 마커 추가
            if (currentPosition) {
              const currentMarker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude),
                map: mapObj,
                image: new window.kakao.maps.MarkerImage(
                  'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                  new window.kakao.maps.Size(24, 35)
                )
              });

              // 현재 위치에 인포윈도우 추가
              const currentInfowindow = new window.kakao.maps.InfoWindow({
                content: '<div style="padding:5px;font-size:12px;">현재 위치</div>'
              });
              currentInfowindow.open(mapObj, currentMarker);
            }

            // 병원 마커 추가
            hospitals.forEach((hospital, index) => {
              console.log(`병원 ${index}:`, hospital);
              
              if (hospital.latitude && hospital.longitude) {
                const position = new window.kakao.maps.LatLng(
                  parseFloat(hospital.latitude), 
                  parseFloat(hospital.longitude)
                );
                
                const marker = new window.kakao.maps.Marker({
                  position: position,
                  map: mapObj,
                  title: hospital.yadmNm
                });

                // 마커 클릭 이벤트
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  setSelectedHospital(hospital);
                  
                  // 지도 중심 이동
                  mapObj.panTo(position);
                });

                markersRef.current.push(marker);
              }
            });

            // 모든 마커가 보이도록 지도 범위 재설정
            if (markersRef.current.length > 0 || currentPosition) {
              const bounds = new window.kakao.maps.LatLngBounds();
              
              // 현재 위치 포함
              if (currentPosition) {
                bounds.extend(new window.kakao.maps.LatLng(currentPosition.latitude, currentPosition.longitude));
              }
              
              // 병원 위치들 포함
              markersRef.current.forEach(marker => {
                bounds.extend(marker.getPosition());
              });
              
              // 범위가 너무 좁으면 레벨 조정
              if (markersRef.current.length === 0 && currentPosition) {
                mapObj.setLevel(4);
              } else {
                mapObj.setBounds(bounds);
              }
            }
          } catch (error) {
            console.error('카카오맵 초기화 오류:', error);
            setMapLoading(false);
          }
        }
      }, 100); // 100ms마다 체크
      
      // 10초 후에도 로드되지 않으면 타임아웃
      setTimeout(() => {
        if (mapLoading) {
          clearInterval(checkKakaoMap);
          setMapLoading(false);
          console.error('카카오맵 로드 타임아웃');
        }
      }, 10000);
    }

    return () => {
      // 클린업: 마커 제거
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [open, hospitals, currentPosition]);

  const handleHospitalClick = (hospital) => {
    setSelectedHospital(hospital);
    
    if (mapInstance.current && hospital.latitude && hospital.longitude) {
      const position = new window.kakao.maps.LatLng(
        parseFloat(hospital.latitude), 
        parseFloat(hospital.longitude)
      );
      mapInstance.current.panTo(position);
      mapInstance.current.setLevel(3);
    }
  };

  const handleDirections = (hospital) => {
    // 카카오맵 길찾기 URL
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(hospital.yadmNm)},${hospital.latitude},${hospital.longitude}`;
    window.open(url, '_blank');
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }} component="span">
                        <LocationOn sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {hospital.addr}
                        </Typography>
                      </Box>
                      {hospital.telno && hospital.telno !== '전화번호 정보 없음' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} component="span">
                          <Phone sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="caption" color="text.secondary" component="span">
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
          {/* 로딩 표시 */}
          {mapLoading && (
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1
            }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>지도를 불러오는 중...</Typography>
            </Box>
          )}
          
          {/* 지도 컨테이너 */}
          <div
            ref={mapContainer}
            style={{
              width: '100%',
              height: '100%'
            }}
          />
          
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
