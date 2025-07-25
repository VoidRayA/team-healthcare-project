import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { EventNote, AccessTime } from '@mui/icons-material';
import { getAuthToken } from '../../utils/auth';

// 한국 시간 기준 날짜 문자열 변환 함수
const getKoreanDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const RecentActivities = ({ 
  selectedDate = new Date(),
  selectedSenior = null
}) => {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 오늘의 일정 데이터 로드
  const loadTodaySchedules = async () => {
    if (!selectedSenior?.id || !selectedDate) {
      setTodaySchedules([]);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      
      if (!token) {
        console.log('JWT 토큰이 없습니다.');
        setTodaySchedules([]);
        return;
      }

      const dateString = getKoreanDateString(selectedDate);
      
      // 일정 관리 API에서 데이터 가져오기
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${selectedSenior.id}/dailyActivities?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('오늘의 일정 데이터:', data);
        
        // API 응답에서 일정 데이터 추출
        let schedulesArray = [];
        
        if (Array.isArray(data)) {
          schedulesArray = data;
        } else if (data && data.seniors && Array.isArray(data.seniors)) {
          const firstSenior = data.seniors[0];
          if (firstSenior && firstSenior.dailyActivities) {
            schedulesArray = firstSenior.dailyActivities;
          }
        }
        
        // 일정 데이터를 UI에 맞게 변환
        const formattedSchedules = schedulesArray.map((schedule, index) => ({
          id: schedule.id || index,
          time: schedule.createdAt ? 
            new Date(schedule.createdAt).toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : '--:--',
          category: schedule.activityCategory || '일정',
          notes: schedule.dailyNotes || '내용 없음',
          status: 'info' // 기본 상태
        }));
        
        setTodaySchedules(formattedSchedules);
      } else {
        console.error('일정 데이터 로드 실패:', response.status);
        setTodaySchedules([]);
      }
      
    } catch (error) {
      console.error('일정 데이터 로드 오류:', error);
      setError('일정을 불러오는데 실패했습니다.');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // selectedSenior나 selectedDate가 변경될 때 일정 로드
  useEffect(() => {
    loadTodaySchedules();
  }, [selectedSenior, selectedDate]);

  return (
    <Paper sx={{
      backgroundColor: '#ffffff',
      border: theme => `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      padding: 2.5,
      minHeight: '450px',
      overflow: 'auto',
      boxShadow: 2
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EventNote sx={{ color: '#1976d2' }} />
        <Typography variant="h6" fontWeight="bold">
          📅 오늘의 일정
        </Typography>
      </Box>
      
      {/* 선택된 날짜 표시 */}
      <Box sx={{ mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          📆 {selectedDate.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'short'
          })}
        </Typography>
        {selectedSenior && (
          <Typography variant="body2" color="primary">
            👤 {selectedSenior.seniorName}님의 일정
          </Typography>
        )}
      </Box>
      
      {/* 에러 표시 */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        </Box>
      )}
      
      {/* 로딩 상태 */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            일정을 불러오는 중...
          </Typography>
        </Box>
      ) : !selectedSenior ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            보호 대상자를 선택해주세요.
          </Typography>
        </Box>
      ) : todaySchedules.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            등록된 일정이 없습니다.
          </Typography>
        </Box>
      ) : (
        todaySchedules.map((schedule) => (
          <Box key={schedule.id} sx={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: theme => theme.spacing(1.5, 0),
            borderBottom: theme => `1px solid ${theme.palette.grey[100]}`,
            '&:last-child': {
              borderBottom: 'none'
            }
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: '#666' }} />
                <Typography variant="body2" color="text.secondary">
                  {schedule.time}
                </Typography>
                <Chip
                  label={schedule.category}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography 
                variant="body2" 
                color="text.primary" 
                sx={{ 
                  lineHeight: 1.4,
                  pl: 3,
                  fontWeight: 500
                }}
              >
                {schedule.notes}
              </Typography>
            </Box>
          </Box>
        ))
      )}
    </Paper>
  );
};

export default RecentActivities;