// OpenWeatherMap API 연동 유틸리티
// https://openweathermap.org/api 에서 API 키 발급 후 사용

// 부산 좌표
const BUSAN_COORDS = {
  lat: 35.1796,
  lon: 129.0756
};

// OpenWeatherMap API로 현재 날씨 + 예보 조회
export const getCurrentWeather = async (apiKey) => {
  try {
    if (!apiKey) {
      console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
      return getDummyWeatherData();
    }

    // 현재 날씨와 5일 예보를 동시에 호출
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${BUSAN_COORDS.lat}&lon=${BUSAN_COORDS.lon}&appid=${apiKey}&units=metric&lang=kr`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${BUSAN_COORDS.lat}&lon=${BUSAN_COORDS.lon}&appid=${apiKey}&units=metric&lang=kr`)
    ]);
    
    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    console.log('현재 날씨 API 응답:', currentData);
    console.log('예보 API 응답:', forecastData);
    
    console.log('API 온도 데이터 상세:', {
      현재온도: currentData.main.temp,
      최고온도: currentData.main.temp_max,
      최저온도: currentData.main.temp_min,
      체감온도: currentData.main.feels_like
    });

    if (currentResponse.ok && forecastResponse.ok) {
      // 오늘의 예보에서 최고/최저 온도 추출
      const today = new Date().toISOString().split('T')[0];
      const todayForecasts = forecastData.list.filter(item => 
        item.dt_txt.startsWith(today)
      );
      
      let maxTemp = currentData.main.temp_max;
      let minTemp = currentData.main.temp_min;
      
      // 예보 데이터에서 더 정확한 최고/최저 찾기
      if (todayForecasts.length > 0) {
        const temps = todayForecasts.map(item => item.main.temp);
        maxTemp = Math.max(maxTemp, ...temps);
        minTemp = Math.min(minTemp, ...temps);
      }
      
      // 5일 예보 데이터 처리
      const weeklyForecast = processWeeklyForecast(forecastData.list);
      
      console.log('계산된 온도:', {
        현재: currentData.main.temp,
        최고: maxTemp,
        최저: minTemp
      });
      console.log('주간 예보:', weeklyForecast);

      return {
        temperature: `${Math.round(currentData.main.temp)}°C`,
        condition: currentData.weather[0].description,
        humidity: `${currentData.main.humidity}%`,
        location: '부산',
        maxTemp: `${Math.round(maxTemp)}°C`,
        minTemp: `${Math.round(minTemp)}°C`,
        lastUpdate: new Date().toLocaleTimeString('ko-KR'),
        icon: currentData.weather[0].icon, // 메인 날씨 아이콘 추가
        weeklyForecast: weeklyForecast // 5일 예보 추가
      };
    } else {
      console.error('OpenWeatherMap API 오류:', currentData.message || forecastData.message);
      return getDummyWeatherData();
    }
  } catch (error) {
    console.error('날씨 정보 조회 실패:', error);
    return getDummyWeatherData();
  }
};

// 5일 예보 데이터를 요일별로 처리
const processWeeklyForecast = (forecastList) => {
  const dailyData = {};
  
  // 3시간마다의 데이터를 날짜별로 그룹화
  forecastList.forEach(item => {
    const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD 추출
    const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]); // 시간 추출
    
    if (!dailyData[date]) {
      dailyData[date] = {
        temps: [],
        conditions: [],
        midDayCondition: null // 오후 2시 경 날씨 (대표 날씨)
      };
    }
    
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].conditions.push(item.weather[0]);
    
    // 오후 2시(14시) 경 날씨를 대표 날씨로 사용
    if (hour >= 12 && hour <= 15 && !dailyData[date].midDayCondition) {
      dailyData[date].midDayCondition = item.weather[0];
    }
  });
  
  // 오늘을 제외한 4일간의 예보 데이터 생성
  const today = new Date().toISOString().split('T')[0];
  const weeklyForecast = [];
  
  Object.keys(dailyData)
    .filter(date => date > today) // 오늘 이후 날짜만
    .slice(0, 4) // 최대 4일
    .forEach(date => {
      const dayData = dailyData[date];
      const dateObj = new Date(date);
      
      // 요일 이름 배열 (한글)
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      const dayName = dayNames[dateObj.getDay()];
      
      // 최고/최저 온도 계산
      const maxTemp = Math.max(...dayData.temps);
      const minTemp = Math.min(...dayData.temps);
      
      // 대표 날씨 설정 (오후 시간대 우선, 없으면 가장 빈번한 날씨)
      let condition = dayData.midDayCondition;
      if (!condition && dayData.conditions.length > 0) {
        // 가장 빈번한 날씨 상태 찾기
        const conditionCounts = {};
        dayData.conditions.forEach(cond => {
          const key = cond.main;
          conditionCounts[key] = (conditionCounts[key] || 0) + 1;
        });
        const mostFrequent = Object.keys(conditionCounts).reduce((a, b) => 
          conditionCounts[a] > conditionCounts[b] ? a : b
        );
        condition = dayData.conditions.find(cond => cond.main === mostFrequent);
      }
      
      weeklyForecast.push({
        day: dayName,
        date: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`,
        condition: condition ? condition.description : '맑음',
        icon: condition ? condition.icon : '01d',
        maxTemp: Math.round(maxTemp),
        minTemp: Math.round(minTemp)
      });
    });
  
  return weeklyForecast;
};

// API 키가 없을 때 사용할 더미 데이터
const getDummyWeatherData = () => {
  return {
    temperature: '22°C',
    condition: '맑음',
    humidity: '65%',
    location: '부산',
    maxTemp: '25°C',
    minTemp: '18°C',
    lastUpdate: new Date().toLocaleTimeString('ko-KR'),
    icon: '01d', // 맑음 아이콘
    weeklyForecast: [
      { day: '내일', date: '7/4', condition: '구름많음', icon: '03d', maxTemp: 24, minTemp: 19 },
      { day: '모레', date: '7/5', condition: '비', icon: '10d', maxTemp: 21, minTemp: 17 },
      { day: '글피', date: '7/6', condition: '맑음', icon: '01d', maxTemp: 26, minTemp: 20 },
      { day: '일요', date: '7/7', condition: '흐림', icon: '04d', maxTemp: 23, minTemp: 18 }
    ]
  };
};

// 통합 날씨 정보 조회 함수
export const getWeatherInfo = async (apiKey = null) => {
  return await getCurrentWeather(apiKey);
};
