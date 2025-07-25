import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material';
import { EventNote, AccessTime, CalendarToday } from '@mui/icons-material';
import { getAuthToken } from '../../utils/auth';

// 한국 시간 기준 날짜 문자열 변환 함수
const getKoreanDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 날짜 비교 함수 (YYYY-MM-DD 형식)
const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  return getKoreanDateString(date1) === getKoreanDateString(date2);
};

const RecentActivities = ({ 
  selectedDate = new Date(),
  selectedSenior = null
}) => {
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedDate, setLastLoadedDate] = useState(null);
  const [lastLoadedSenior, setLastLoadedSenior] = useState(null);

  // 오늘의 일정 데이터 로드
  const loadTodaySchedules = async () => {
    if (!selectedSenior?.id || !selectedDate) {
      setTodaySchedules([]);
      setLastLoadedDate(null);
      setLastLoadedSenior(null);
      return;
    }

    // 중복 API 호출 방지 - 이미 로드한 날짜와 시니어인지 확인
    if (
      lastLoadedSenior?.id === selectedSenior.id && 
      isSameDate(lastLoadedDate, selectedDate)
    ) {
      console.log('💾 이미 로드된 데이터 사용:', getKoreanDateString(selectedDate));
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
      console.log('📅 일정 로드 요청:', {
        seniorId: selectedSenior.id,
        seniorName: selectedSenior.seniorName,
        date: dateString
      });
      
      // 일정 관리 API에서 특정 날짜 데이터 가져오기
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/seniors/${selectedSenior.id}/dailyActivities?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 일정 API 응답:', data);
        console.log('✨ 새로운 코드 적용됨!');
        
        // 백엔드에서 반환하는 새로운 구조에 맞게 데이터 추출
        let schedulesArray = data.dailyActivities || [];
        
        console.log('📋 추출된 일정 배열:', schedulesArray);
        console.log('📋 배열 타입:', Array.isArray(schedulesArray));
        console.log('📋 배열 길이:', schedulesArray.length);
        
        // 일정 데이터를 UI에 맞게 변환
        const formattedSchedules = schedulesArray.map((schedule, index) => {
          // 시간 추출 로직
          let timeDisplay = '--:--';
          
          if (schedule.createdAt) {
            try {
              const createdDate = new Date(schedule.createdAt);
              timeDisplay = createdDate.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              });
            } catch (e) {
              timeDisplay = '--:--';
            }
          }
          
          return {
            id: schedule.id || `schedule_${index}`,
            time: timeDisplay,
            category: schedule.activityCategory || '일정',
            notes: schedule.dailyNotes || '내용 없음',
            status: 'info',
            originalDate: schedule.activityDate
          };
        });
        
        // 시간순으로 정렬
        formattedSchedules.sort((a, b) => {
          if (a.time === '--:--' && b.time === '--:--') return 0;
          if (a.time === '--:--') return 1;
          if (b.time === '--:--') return -1;
          return a.time.localeCompare(b.time);
        });
        
        setTodaySchedules(formattedSchedules);
        setLastLoadedDate(selectedDate);
        setLastLoadedSenior(selectedSenior);
        
      } else {
        console.error('일정 데이터 로드 실패:', response.status, response.statusText);
        setTodaySchedules([]);
        
        if (response.status === 404) {
          // 404는 일정이 없는 것이므로 에러가 아님
          console.log('해당 날짜에 등록된 일정이 없습니다.');
        } else {
          setError(`일정 로드 실패 (${response.status})`);
        }
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
  }, [selectedSenior?.id, getKoreanDateString(selectedDate)]);

  // 날짜 표시 개선
  const getDateDisplayInfo = () => {
    if (!selectedDate) return { text: '', isToday: false };
    
    const today = new Date();
    const isToday = isSameDate(selectedDate, today);
    
    const dateText = selectedDate.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    });
    
    return { text: dateText, isToday };
  };

  const { text: dateText, isToday } = getDateDisplayInfo();

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
          📅 {isToday ? '오늘의 일정' : '선택한 날짜의 일정'}
        </Typography>
      </Box>
      
      {/* 선택된 날짜 표시 */}
      <Box sx={{ 
        mb: 2, 
        p: 1.5, 
        backgroundColor: isToday ? '#e3f2fd' : '#f5f5f5', 
        borderRadius: 1,
        border: isToday ? '1px solid #bbdefb' : 'none'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <CalendarToday sx={{ fontSize: 16, color: isToday ? '#1976d2' : '#666' }} />
          <Typography 
            variant="body2" 
            color={isToday ? 'primary' : 'text.secondary'}
            fontWeight={isToday ? 'bold' : 'normal'}
          >
            📆 {dateText}
            {isToday && ' (오늘)'}
          </Typography>
        </Box>
        {selectedSenior && (
          <Typography variant="body2" color="primary" sx={{ pl: 2.5 }}>
            👤 {selectedSenior.seniorName}님의 일정
          </Typography>
        )}
      </Box>
      
      {/* 에러 표시 */}
      {error && (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" color="error">
            ⚠️ {error}
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
            👤 보호 대상자를 선택해주세요.
          </Typography>
        </Box>
      ) : todaySchedules.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            📝 선택한 날짜에 등록된 일정이 없습니다.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {getKoreanDateString(selectedDate)}
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* 일정 개수 표시 */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Chip 
              label={`총 ${todaySchedules.length}개의 일정`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Box>
          
          {/* 일정 목록 */}
          <Box sx={{
            maxHeight: '300px', // 최대 높이 설정
            overflowY: 'auto', // 수직 스크롤 활성화
            pr: 1, // 스크롤바 공간 확보
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              }
            }
          }}>
            {todaySchedules.map((schedule) => (
              <Box key={schedule.id} sx={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: theme => theme.spacing(1.5, 0),
                borderBottom: theme => `1px solid ${theme.palette.grey[100]}`,
                '&:last-child': {
                  borderBottom: 'none'
                },
                '&:hover': {
                  backgroundColor: '#fafafa'
                }
              }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
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
                  
                  {/* 디버그 정보 (개발 환경에서만) */}
                  {import.meta.env.DEV && schedule.originalDate && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ pl: 3, display: 'block', mt: 0.5 }}
                    >
                      📅 원본 날짜: {schedule.originalDate}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default RecentActivities;