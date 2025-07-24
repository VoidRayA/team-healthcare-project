import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { getLocalDateString } from '../utils/dateHelpers';

const EmptyDataView = ({ 
  currentSelectedSenior, 
  currentSelectedDate, 
  onDateChange,
  findLatestData,
  loading,
  setLoading,
  onClose 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%',
      textAlign: 'center'
    }}>
      <Box sx={{ 
        fontSize: '4rem', 
        mb: 2,
        opacity: 0.3 
      }}>
        📊
      </Box>
      <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary', fontWeight: 'bold' }}>
        해당 날짜에 등록된 데이터가 없습니다
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', maxWidth: 400 }}>
        {currentSelectedSenior?.seniorName}님의 {getLocalDateString(currentSelectedDate)} 바이탈 사인 측정 기록이 없습니다.
      </Typography>
      
      {/* 대안 제시 */}
      <Paper sx={{ p: 3, maxWidth: 500, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          💡 다음과 같이 시도해보세요
        </Typography>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>📅</span>
            다른 날짜를 선택해서 기존 데이터를 확인해보세요
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>👤</span>
            다른 시니어를 선택해서 비교해보세요
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>⏰</span>
            최근 며칠간의 데이터가 있는지 확인해보세요
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>🩺</span>
            외부 기기를 통해 새로운 바이탈 사인을 측정해보세요
          </Typography>
        </Box>
      </Paper>
      
      {/* 빠른 액션 버튼들 */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => {
            try {
              const yesterday = new Date(currentSelectedDate);
              yesterday.setDate(yesterday.getDate() - 1);
              onDateChange(yesterday);
            } catch (error) {
              console.error('어제 날짜 계산 오류:', error);
            }
          }}
          sx={{ fontSize: '0.9rem' }}
        >
          📅 어제 데이터 보기
        </Button>
        
        <Button
          variant="outlined"
          onClick={async () => {
            if (!currentSelectedSenior) return;
            
            try {
              setLoading(true);
              const result = await findLatestData(currentSelectedSenior.id);
              
              if (result.success) {
                const latestDate = new Date(result.date);
                latestDate.setHours(0, 0, 0, 0); // 날짜만 사용 (시간 제거)
                
                const dateText = getLocalDateString(latestDate);
                const measurementDate = new Date(result.measurementTime);
                const timeText = `${measurementDate.getHours()}:${measurementDate.getMinutes().toString().padStart(2, '0')}`;
                
                console.log(`📊 가장 최근 데이터: ${dateText} ${timeText}`);
                onDateChange(latestDate);
              } else {
                alert('등록된 데이터를 찾을 수 없습니다.');
              }
            } catch (error) {
              console.error('최근 데이터 찾기 오류:', error);
              alert('최근 데이터를 찾는 중 오류가 발생했습니다.');
            } finally {
              setLoading(false);
            }
          }}
          sx={{ fontSize: '0.9rem' }}
          disabled={loading}
        >
          🔍 최근 데이터 보기
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => {
            try {
              const today = new Date();
              onDateChange(today);
            } catch (error) {
              console.error('오늘 날짜 계산 오류:', error);
            }
          }}
          sx={{ fontSize: '0.9rem' }}
        >
          📅 오늘 데이터 보기
        </Button>
        
        <Button
          variant="contained"
          onClick={() => {
            if (currentSelectedSenior?.id) {
              console.log('🔌 기기 등록/관리 버튼 클릭');
              console.log('선택된 시니어 ID:', currentSelectedSenior.id);
              console.log('이동할 URL:', `/senior/edit/${currentSelectedSenior.id}`);
              
              onClose();
              // 정확한 라우트 경로로 이동
              window.location.href = `/senior/edit/${currentSelectedSenior.id}`;
            } else {
              alert('시니어를 먼저 선택해주세요.');
            }
          }}
          sx={{ fontSize: '0.9rem' }}
        >
          🔌 기기 등록/관리
        </Button>
      </Box>
    </Box>
  );
};

export default EmptyDataView;
