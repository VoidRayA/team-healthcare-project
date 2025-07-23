import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getWeatherInfo } from '../../utils/weatherAPI';

// 밤 아이콘 코드 끝 'n'을 낮 'd'로 바꾸는 함수
const convertNightToDayIcon = (icon) => {
  if (!icon) return icon;
  return icon.endsWith('n') ? icon.slice(0, -1) + 'd' : icon;
};

const WeatherWidget = () => {
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
            justifyContent: 'center',
            gap: 3.125,
            mb: 1
          }}
        >
          {/* 온도 정보 */}
          <Box sx={{ textAlign: 'center', flex: 1.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: '50px',
                color: '#1976d2',
                fontWeight: 'bold',
                mb: 1
              }}
            >
              {weather.temperature}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.625 }}>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#d32f2f'
                }}
              >
                최고 {weather.maxTemp}°
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '20px',
                  color: '#1976d2'
                }}
              >
                최저 {weather.minTemp}°
              </Typography>
            </Box>
          </Box>

          {/* 아이콘 + 상태 + 습도 */}
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            {weather.icon && (
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
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.condition}
                  onError={(e) => console.error('아이콘 로드 실패:', e.target.src)}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            )}            
            <Typography
              variant="caption"
              sx={{
                color: '#666',
                fontSize: '0.9rem'
              }}
            >
              습도: {weather.humidity}
            </Typography>
          </Box>
        </Box>

        {/* 4일간 예보 */}
        {weather.weeklyForecast && weather.weeklyForecast.length > 0 && (
          <Box
            sx={{
              pt: 2,
              borderTop: (theme) => `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                mb: 1.5,
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '1rem'
              }}
            >
              4일간 예보
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 1
              }}
            >
              {weather.weeklyForecast.map((forecast, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 1,
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent',
                    borderRadius: 1
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: '0.75rem',
                      mb: 0.5
                    }}
                  >
                    {forecast.day}
                  </Typography>

                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      margin: '0 auto 4px auto'
                    }}
                  >
                    <img
                      src={`https://openweathermap.org/img/wn/${convertNightToDayIcon(
                        forecast.icon
                      )}@2x.png`}
                      alt={forecast.condition}
                      title={forecast.condition}
                      onError={(e) => console.error('예보 아이콘 로드 실패:', e.target.src)}
                      style={{
                        width: '24px',
                        height: '24px',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 'bold',
                      color: '#d32f2f',
                      fontSize: '0.9rem'
                    }}
                  >
                    {forecast.maxTemp}°
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#1976d2',
                      fontSize: '0.9rem'
                    }}
                  >
                    {forecast.minTemp}°
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

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