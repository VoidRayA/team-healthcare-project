import React from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const SeniorSelector = ({ 
  seniors, 
  selectedSenior, 
  onSeniorSelect, 
  loading 
}) => {
  if (loading || seniors.length === 0) {
    return (
      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2', fontSize: '1.2rem' }}>
          👥 관리 대상자
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 1 }}>
          대상자 정보를 불러오는 중...
        </Typography>
      </Paper>
    );
  }

  if (!selectedSenior) {
    return (
      <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1.25 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2', fontSize: '1.2rem' }}>
          👥 관리 대상자
        </Typography>
        <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 1 }}>
          등록된 대상자가 없습니다
        </Typography>
      </Paper>
    );
  }

  const handlePrevious = () => {
    const currentIndex = seniors.findIndex(s => s.id === selectedSenior.id);
    const prevIndex = currentIndex === 0 ? seniors.length - 1 : currentIndex - 1;
    onSeniorSelect(seniors[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = seniors.findIndex(s => s.id === selectedSenior.id);
    const nextIndex = (currentIndex + 1) % seniors.length;
    onSeniorSelect(seniors[nextIndex]);
  };

  return (
    <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1.25 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2', fontSize: '1.2rem' }}>
        👥 관리 대상자
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#333' }}>
          👤 {selectedSenior.seniorName} 님
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          📍 {selectedSenior.address || '주소 정보 없음'}
        </Typography>
        {selectedSenior.phoneNumber && (
          <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            📞 {selectedSenior.phoneNumber}
          </Typography>
        )}
        {selectedSenior.gender && (
          <Typography variant="caption" sx={{ color: '#999' }}>
            👥 {selectedSenior.gender === 'M' ? '남성' : '여성'} · {selectedSenior.birthDate ? `${new Date().getFullYear() - new Date(selectedSenior.birthDate).getFullYear()}세` : '연령 정보 없음'}
          </Typography>
        )}
        
        {/* 좌우 버튼 */}
        <Box sx={{                             
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
            {seniors.findIndex(s => s.id === selectedSenior.id) + 1} / {seniors.length}
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
      </Box>
    </Paper>
  );
};

export default SeniorSelector;