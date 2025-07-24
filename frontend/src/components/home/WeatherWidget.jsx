import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getWeatherInfo } from '../../utils/weatherAPI';

// 밤 아이콘 코드 끝 'n'을 낮 'd'로 바꾸는 함수
const convertNightToDayIcon = (icon) => {
  if (!icon) return icon;
  return icon.endsWith('n') ? icon.slice(0, -1) + 'd' : icon;
};

const WeatherWidget = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0); // 슬라이드 인덱스
  const [weather, setWeather] = useState({
    temperature: '로딩 중...',
    condition: '로딩 중...',
    humidity: '로딩 중...',
    location: '서울',
    maxTemp: '-',
    minTemp: '-',
    icon: null,
    weeklyForecast: []
  });

  const today = new Date();
  const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 슬라이드 내비게이션 함수
  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < weather.weeklyForecast.length) {  // -1 제거로 4일 모두 보이게
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  // 현재 보여줄 날씨 데이터 선택
  const getCurrentWeatherData = () => {
    if (currentDayIndex === 0) {
      // 오늘 날씨
      return {
        day: '오늘',
        temperature: weather.temperature, // 이미 °C 포함
        maxTemp: weather.maxTemp?.replace('°C', ''), // °C 제거
        minTemp: weather.minTemp?.replace('°C', ''), // °C 제거
        icon: weather.icon,
        condition: weather.condition,
        humidity: weather.humidity,
        isToday: true
      };
    } else {
      // 예보 날씨
      const forecast = weather.weeklyForecast[currentDayIndex - 1];
      return {
        day: forecast?.day || '날짜',
        temperature: `${forecast?.maxTemp || '-'}°C`, // 예보는 최고온도 표시
        maxTemp: forecast?.maxTemp || '-', // 이미 숫자만
        minTemp: forecast?.minTemp || '-', // 이미 숫자만
        icon: forecast?.icon,
        condition: forecast?.condition || '-',
        humidity: forecast?.humidity || '70%',
        isToday: false
      };
    }
  };

  const currentData = getCurrentWeatherData();

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

        if (!apiKey) {
          console.error('OpenWeatherMap API 키가 설정되지 않았습니다.');
          return;
        }

        console.log('🌍 자동 위치 감지로 날씨 정보 조회...');
        const weatherData = await getWeatherInfo(apiKey);

        console.log('현재 날씨 아이콘 코드:', weatherData.icon);
        if (weatherData.weeklyForecast && weatherData.weeklyForecast.length > 0) {
          console.log('주간 예보 아이콘 코드:', weatherData.weeklyForecast.map(f => f.icon));
        }

        setWeather(weatherData);
      } catch (error) {
        console.error('❌ 날씨 정보 로드 오류:', error);
      }
    };

    loadWeatherData();
  }, []);

  return (
    <Box sx={{ marginTop: '20px' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        🌦️ 오늘 날씨 ({formattedDate})
      </Typography>
      <Box
        sx={{
          flex: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1.25,
          padding: 1.25,
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.625,
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* 하단 내비게이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={handlePrevDay}
            disabled={currentDayIndex === 0}
            size="small"
            sx={{ 
              '&:disabled': { 
                color: '#ccc' 
              },
              color: '#1976d2'
            }}
          >
            <ChevronLeft />
          </IconButton>
          
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              minWidth: '80px',
              textAlign: 'center'
            }}
          >
            {currentData.day}
          </Typography>
          
          <IconButton 
            onClick={handleNextDay}
            disabled={currentDayIndex >= weather.weeklyForecast.length}  // 예보 데이터 끝까지
            size="small"
            sx={{ 
              '&:disabled': { 
                color: '#ccc' 
              },
              color: '#1976d2'
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>

        {/* 위치 정보 */}
        <Box sx={{ textAlign: 'center', mb: 0.2 }}>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontWeight: 'bold',
              fontSize: '1.8rem'
            }}
          >
            {weather.location}
          </Typography>
        </Box>

        {/* 메인 날씨 정보 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',  // 균등하게 배치
            gap: 2,  // 간격 줄임
            mb: 1,
            px: 1  // 좌우 패딩 추가
          }}
        >
          {/* 온도 정보 */}
          <Box sx={{ textAlign: 'center', flex: 1.2 }}>  {/* textAlign: center로 복구, flex 비율 약간 조정 */}
            <Typography
              variant="h3"
              sx={{
                fontSize: '50px',
                color: '#1976d2',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {currentData.temperature}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 0.3 }}>  {/* alignItems: center로 가운데 정렬 */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#d32f2f'
                }}
              >
                최고 {currentData.maxTemp}°
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '20px',
                  color: '#1976d2'
                }}
              >
                최저 {currentData.minTemp}°
              </Typography>
            </Box>
          </Box>

          {/* 아이콘 + 상태 + 습도 */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            {currentData.icon && (
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  margin: '0 auto 8px auto'
                }}
              >
                <img
                  src={`https://openweathermap.org/img/wn/${currentData.isToday ? currentData.icon : convertNightToDayIcon(currentData.icon)}@2x.png`}
                  alt={currentData.condition}
                  onError={(e) => console.error('아이콘 로드 실패:', e.target.src)}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}            
            
            {/* 날씨 상태 텍스트 */}
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '1.25rem',
                mt: 0.5,
                textAlign: 'center',
                lineHeight: 1.2,
                display: 'block'  // 명시적 블록 요소
              }}
            >
              {currentData.condition || '맑음'}
            </Typography>
            
            {/* 습도 정보 - 오늘만 표시 */}
            {currentData.isToday ? (
              <Typography
                variant="caption"
                sx={{
                  color: '#666',
                  fontSize: '0.8rem',
                  mt: 0.8,  // gap 증가
                  textAlign: 'center',
                  display: 'block'  // 명시적 블록 요소
                }}
              >
                습도: {currentData.humidity}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: '#999',
                  fontSize: '0.8rem',
                  mt: 0.8,  // gap 증가                  
                  textAlign: 'center',
                  display: 'block'  // 명시적 블록 요소
                }}
              >
                습도: 오늘만 제공
              </Typography>
            )}
          </Box>
        </Box>

        {/* 출처 표시 */}
        <Box
          sx={{
            textAlign: 'center',
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            mt: 1
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#999',
              fontSize: '0.65rem',
              fontStyle: 'italic'
            }}
          >
            Powered by{' '}
            <Box
              component="a"
              href="https://openweathermap.org/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: '#1976d2',
                textDecoration: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              OpenWeatherMap
            </Box>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default WeatherWidget;