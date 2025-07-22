import React from 'react';
import { Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const HospitalInfo = ({ 
  recommendedHospital, 
  nearbyHospitals, 
  hospitalLoading, 
  onHospitalSelect,
  onShowMap 
}) => {
  const getIcon = () => {
    return '🏥';
  };

  const handlePrevious = () => {
    const currentIndex = nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
    const prevIndex = currentIndex === 0 ? nearbyHospitals.length - 1 : currentIndex - 1;
    onHospitalSelect(nearbyHospitals[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm);
    const nextIndex = (currentIndex + 1) % nearbyHospitals.length;
    onHospitalSelect(nearbyHospitals[nextIndex]);
  };

  return (
    <Paper sx={{ 
      p: 2, 
      backgroundColor: '#e3f2fd', 
      borderRadius: 1.25,
      height: '220px', // 완전 고정 높이
      overflow: 'hidden', // 넘치는 내용 숨김
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.2rem' }}>
          🏥 근처 병원 정보
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onShowMap}
          sx={{
            backgroundColor: '#1976d2',
            fontSize: '0.75rem',
            py: 0.8,
            px: 1.8,
            minWidth: 'auto',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          🗺️ 지도
        </Button>
      </Box>
      
      {hospitalLoading ? (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: 1
        }}>
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
            병원 정보를 불러오는 중...
          </Typography>
        </Box>
      ) : recommendedHospital ? (
        <Box sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5,
          overflow: 'hidden'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
            {getIcon()} {recommendedHospital.yadmNm}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            📍 {recommendedHospital.addr}
          </Typography>
          {recommendedHospital.telno && recommendedHospital.telno !== '전화번호 정보 없음' && (
            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              📞 {recommendedHospital.telno}
            </Typography>
          )}
          {recommendedHospital.distance && (
            <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
              📍 거리: {recommendedHospital.distance}
            </Typography>
          )}
          {recommendedHospital.categoryName && (
            <Typography variant="caption" sx={{ color: '#999' }}>
              🏷️ {recommendedHospital.categoryName}
            </Typography>
          )}

          {nearbyHospitals.length > 1 && (
            <Box sx={{
              mt: 'auto', // 자동으로 하단에 배치
              pt: 1, 
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 0.5
            }}>
              <IconButton 
                size="small" 
                onClick={handlePrevious}
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
                  },
                  width: 32,
                  height: 32
                }}
              >
                <ChevronLeft sx={{ color: '#1976d2', fontSize: 18 }} />
              </IconButton>
              
              <Typography variant="caption" sx={{ 
                color: '#666',
                minWidth: '40px',
                textAlign: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {nearbyHospitals.findIndex(h => h.yadmNm === recommendedHospital.yadmNm) + 1} / {nearbyHospitals.length}
              </Typography>
              
              <IconButton 
                size="small" 
                onClick={handleNext}
                sx={{ 
                  backgroundColor: '#f5f5f5',
                  '&:hover': {
                    backgroundColor: '#e0e0e0'
                  },
                  width: 32,
                  height: 32
                }}
              >
                <ChevronRight sx={{ color: '#1976d2', fontSize: 18 }} />
              </IconButton>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', fontStyle: 'italic' }}>
            근처 병원 정보를 찾을 수 없습니다
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default HospitalInfo;