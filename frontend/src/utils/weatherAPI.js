// OpenWeatherMap API 연동 유틸리티
// https://openweathermap.org/api 에서 API 키 발급 후 사용

// 기본 좌표 (서울)
const DEFAULT_COORDS = {
  lat: 37.5665,
  lon: 126.9780
};

// GPS 위치 권한 요청 및 좌표 획득
const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.warn('⚠️ 브라우저에서 GPS 위치 서비스를 지원하지 않습니다.');
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    console.log(`🌡️ 날씨 조회 시작 - 위치: ${locationSource}`, targetCoords);

    console.log('📍 GPS 위치 권한 요청 중...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        console.log(`✅ GPS 위치 획득 성공:`, coords);
        console.log(`📍 정확도: ${Math.round(coords.accuracy)}m`);
        resolve(coords);
      },
      (error) => {
        console.warn('⚠️ GPS 위치 권한 거부 또는 실패:', error.message);
        console.log('🔄 기본 좌표 사용 예정');
        reject(error);
      },
      {
        enableHighAccuracy: false, // 빠른 네트워크 기반 위치 사용
        timeout: 15000,           // 15초로 연장
        maximumAge: 300000        // 5분간 캐시 허용
      }
    );
  });
};

// 한국어 도시명 매핑 테이블
const CITY_NAME_MAP = {
  // 대한민국 광역시/특별시/특별자치시
  'Seoul': '서울',
  'Busan': '부산',
  'Incheon': '인천',
  'Daegu': '대구',
  'Daejeon': '대전',
  'Gwangju': '광주',
  'Ulsan': '울산',
  'Sejong': '세종',
  'Sejong City': '세종',
  
  // 경기도 주요 도시
  'Suwon': '수원',
  'Goyang': '고양',
  'Yongin': '용인',
  'Seongnam': '성남',
  'Bucheon': '부천',
  'Ansan': '안산',
  'Anyang': '안양',
  'Hwaseong': '화성',
  'Namyangju': '남양주',
  'Pyeongtaek': '평택',
  'Uijeongbu': '의정부',
  'Siheung': '시흥',
  'Gimpo': '김포',
  'Gwangju': '광주', // 경기도 광주
  'Gunpo': '군포',
  'Gwangmyeong': '광명',
  'Osan': '오산',
  'Icheon': '이천',
  
  // 강원도
  'Chuncheon': '춘천',
  'Wonju': '원주',
  'Gangneung': '강릉',
  'Donghae': '동해',
  'Taebaek': '태백',
  'Sokcho': '속초',
  'Samcheok': '삼척',
  
  // 충청북도
  'Cheongju': '청주',
  'Chungju': '충주',
  'Jecheon': '제천',
  
  // 충청남도
  'Cheonan': '천안',
  'Gongju': '공주',
  'Boryeong': '보령',
  'Asan': '아산',
  'Seosan': '서산',
  'Nonsan': '논산',
  'Gyeryong': '계룡',
  'Dangjin': '당진',
  
  // 전라북도
  'Jeonju': '전주',
  'Gunsan': '군산',
  'Iksan': '익산',
  'Jeongeup': '정읍',
  'Namwon': '남원',
  'Gimje': '김제',
  
  // 전라남도
  'Mokpo': '목포',
  'Yeosu': '여수',
  'Suncheon': '순천',
  'Naju': '나주',
  'Gwangyang': '광양',
  
  // 경상북도
  'Pohang': '포항',
  'Gyeongju': '경주',
  'Gimcheon': '김천',
  'Andong': '안동',
  'Gumi': '구미',
  'Yeongju': '영주',
  'Yeongcheon': '영천',
  'Sangju': '상주',
  'Mungyeong': '문경',
  'Gyeongsan': '경산',
  
  // 경상남도
  'Changwon': '창원',
  'Jinju': '진주',
  'Tongyeong': '통영',
  'Sacheon': '사천',
  'Gimhae': '김해',
  'Miryang': '밀양',
  'Geoje': '거제',
  'Yangsan': '양산',
  
  // 제주특별자치도
  'Jeju': '제주',
  'Jeju City': '제주시',
  'Seogwipo': '서귀포',
  
  // 해외 주요 도시 (한국 사용자들이 자주 방문하는 곳)
  'New York': '뉴욕',
  'Los Angeles': '로스앤젤레스',
  'San Francisco': '샌프란시스코',
  'London': '런던',
  'Paris': '파리',
  'Tokyo': '도쿄',
  'Osaka': '오사카',
  'Beijing': '베이징',
  'Shanghai': '상하이',
  'Hong Kong': '홍콩',
  'Singapore': '싱가포르',
  'Bangkok': '방콕',
  'Sydney': '시드니',
  'Melbourne': '멜버른',
  'Vancouver': '밴쿠버',
  'Toronto': '토론토',
  'Berlin': '베를린',
  'Rome': '로마',
  'Madrid': '마드리드',
  'Amsterdam': '암스테르담',
  'Zurich': '취리히',
  'Vienna': '비엔나',
  'Prague': '프라하',
  'Stockholm': '스톡홀름',
  'Copenhagen': '코펜하겐',
  'Helsinki': '헬싱키',
  'Moscow': '모스크바',
  'Istanbul': '이스탄불',
  'Dubai': '두바이',
  'Mumbai': '뭄바이',
  'Delhi': '델리',
  'Taipei': '타이베이',
  'Manila': '마닐라',
  'Kuala Lumpur': '쿠알라룸푸르',
  'Jakarta': '자카르타',
  'Ho Chi Minh City': '호치민',
  'Hanoi': '하노이'
};

// 한국어 국가명 매핑 테이블
const COUNTRY_NAME_MAP = {
  'South Korea': '대한민국',
  'Korea': '대한민국',
  'Republic of Korea': '대한민국',
  'KR': '대한민국',
  'United States': '미국',
  'United States of America': '미국',
  'US': '미국',
  'USA': '미국',
  'United Kingdom': '영국',
  'UK': '영국',
  'Great Britain': '영국',
  'China': '중국',
  'People\'s Republic of China': '중국',
  'CN': '중국',
  'Japan': '일본',
  'JP': '일본',
  'Canada': '캐나다',
  'CA': '캐나다',
  'Australia': '호주',
  'AU': '호주',
  'Germany': '독일',
  'DE': '독일',
  'France': '프랑스',
  'FR': '프랑스',
  'Italy': '이탈리아',
  'IT': '이탈리아',
  'Spain': '스페인',
  'ES': '스페인',
  'Netherlands': '네덜란드',
  'NL': '네덜란드',
  'Switzerland': '스위스',
  'CH': '스위스',
  'Austria': '오스트리아',
  'AT': '오스트리아',
  'Belgium': '벨기에',
  'BE': '벨기에',
  'Sweden': '스웨덴',
  'SE': '스웨덴',
  'Norway': '노르웨이',
  'NO': '노르웨이',
  'Denmark': '덴마크',
  'DK': '덴마크',
  'Finland': '핀란드',
  'FI': '핀란드',
  'Russia': '러시아',
  'RU': '러시아',
  'Singapore': '싱가포르',
  'SG': '싱가포르',
  'Thailand': '태국',
  'TH': '태국',
  'Vietnam': '베트남',
  'VN': '베트남',
  'Philippines': '필리핀',
  'PH': '필리핀',
  'Malaysia': '말레이시아',
  'MY': '말레이시아',
  'Indonesia': '인도네시아',
  'ID': '인도네시아',
  'India': '인도',
  'IN': '인도',
  'Turkey': '터키',
  'TR': '터키',
  'United Arab Emirates': '아랍에미리트',
  'AE': '아랍에미리트',
  'UAE': '아랍에미리트',
  'Taiwan': '대만',
  'TW': '대만',
  'Hong Kong': '홍콩',
  'HK': '홍콩'
};

// 한국어 지역명으로 변환하는 함수
const getKoreanLocationName = (englishName, type = 'city') => {
  if (!englishName) return null;
  
  const map = type === 'city' ? CITY_NAME_MAP : COUNTRY_NAME_MAP;
  const koreanName = map[englishName];
  
  if (koreanName) {
    console.log(`✅ ${type} 한국어 변환: ${englishName} → ${koreanName}`);
    return koreanName;
  } else {
    console.log(`ℹ️ ${type} 매핑 없음: ${englishName} (원본 사용)`);
    return englishName;
  }
};

// IP 기반 위치 정보 가져오기
const getLocationByIP = async () => {
  try {
    console.log('IP 기반 위치 정보 조회 시작...');
    
    // 실제로 CORS 없이 사용 가능한 IP 위치 서비스들 (더 많은 대안 추가)
    const services = [
      {
        url: 'https://ipapi.co/json/',
        parser: (data) => ({
          lat: data.latitude,
          lon: data.longitude,
          city: data.city,
          country: data.country_name,
          region: data.region
        })
      },
      {
        url: 'https://ipwhois.app/json/',
        parser: (data) => ({
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          city: data.city,
          country: data.country,
          region: data.region
        })
      },
      {
        url: 'https://ipwho.is/',
        parser: (data) => ({
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          city: data.city,
          country: data.country,
          region: data.region
        })
      },
      {
        url: 'https://api.db-ip.com/v2/free/self',
        parser: (data) => ({
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          city: data.city,
          country: data.countryName,
          region: data.stateProv
        })
      },
      {
        url: 'https://get.geojs.io/v1/ip/geo.json',
        parser: (data) => ({
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          city: data.city,
          country: data.country,
          region: data.region
        })
      }
    ];
    
    for (const service of services) {
      try {
        console.log(`IP 위치 서비스 시도 (${services.indexOf(service) + 1}/${services.length}): ${service.url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`IP 서비스 응답:`, data);
        
        const location = service.parser(data);
        
        // 유효한 좌표인지 확인
        if (location.lat && location.lon && 
            !isNaN(location.lat) && !isNaN(location.lon) &&
            Math.abs(location.lat) <= 90 && Math.abs(location.lon) <= 180) {
          
          console.log(`✅ IP 위치 정보 성공 (${location.city}, ${location.country}):`, {
            lat: location.lat,
            lon: location.lon,
            city: location.city,
            country: location.country
          });
          
          return {
            lat: location.lat,
            lon: location.lon,
            city: getKoreanLocationName(location.city, 'city') || '알 수 없는 도시',
            country: getKoreanLocationName(location.country, 'country') || '알 수 없는 국가',
            region: location.region,
            source: `IP 기반 위치 (${service.url})`,
            provider: service.url,
            originalCity: location.city, // 원본 영어명 보관
            originalCountry: location.country // 원본 영어명 보관
          };
        } else {
          console.warn(`유효하지 않은 좌표:`, location);
        }
      } catch (error) {
        console.warn(`IP 위치 서비스 ${service.url} 실패:`, error.message);
        continue;
      }
    }
    
    console.warn('❌ 모든 IP 위치 서비스 실패');
    return null;
  } catch (error) {
    console.error('❌ IP 위치 조회 전체 실패:', error);
    return null;
  }
};

// 브라우저 GPS 위치 정보 가져오기
const getBrowserLocation = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('브라우저에서 지리적 위치를 지원하지 않음');
      resolve(null);
      return;
    }
    
    console.log('브라우저 GPS 위치 정보 조회 시작...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy,
          city: '현재 위치', // GPS는 좌표만 제공하므로 기본값
          country: '대한민국', // 대부분 국내 사용자로 가정
          source: 'GPS 위치'
        };
        
        console.log('GPS 위치 정보 성공:', coords);
        resolve(coords);
      },
      (error) => {
        console.warn('GPS 위치 정보 실패:', error.message);
        resolve(null);
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000 // 5분간 캐시
      }
    );
  });
};

// 최적의 위치 정보 가져오기 (IP > GPS > 기본)
const getBestLocation = async () => {
  try {
    // 1. IP 기반 위치 시도 (더 안정적이고 권한 불필요)
    const ipLocation = await getLocationByIP();
    if (ipLocation) {
      return ipLocation;
    }
    
    // 2. GPS 위치 시도 (권한 필요)
    const gpsLocation = await getBrowserLocation();
    if (gpsLocation) {
      return gpsLocation;
    }
    
    // 3. 기본 위치 사용
    console.log('🏢 기본 위치 사용 (서울)');
    return {
      ...DEFAULT_COORDS,
      city: '서울',
      country: '대한민국',
      source: '기본 위치 (IP/GPS 실패)'
    };
  } catch (error) {
    console.error('❌ 위치 정보 조회 실패:', error);
    return {
      ...DEFAULT_COORDS,
      city: '서울', 
      country: '대한민국',
      source: '기본 위치 (오류)'
    };
  }
};

// OpenWeatherMap API로 현재 날씨 + 예보 조회
export const getCurrentWeather = async (apiKey, coords = null) => {
  try {
    if (!apiKey) {
      console.error('OpenWeatherMap API 키가 설정되지 않았습니다.');
      throw new Error('API 키 필요');
    }

    // 좌표 획득 우선순위: 1) GPS 위치 2) 사용자 지정 3) IP 위치 4) 기본값
    let targetCoords;
    let locationSource = '알 수 없음';
    
    if (coords) {
      targetCoords = coords;
      locationSource = '사용자 지정 좌표';
      console.log('사용자 지정 좌표 사용:', targetCoords);
    } else {
      console.log('🎯 최적 위치 감지 시작 (GPS → IP → 기본값)');
      
      // 1순위: GPS 위치 권한 요청
      try {
        const gpsCoords = await getUserLocation();
        targetCoords = gpsCoords;
        locationSource = `GPS 위치 (정확도: ${Math.round(gpsCoords.accuracy)}m)`;
        console.log('✅ GPS 위치 사용:', targetCoords);
      } catch (gpsError) {
        console.log('⚠️ GPS 실패, IP 위치로 폴백...');
        
        // 2순위: IP 기반 위치
        try {
          const locationInfo = await getBestLocation();
          targetCoords = {
            lat: locationInfo.lat,
            lon: locationInfo.lon
          };
          locationSource = locationInfo.source;
          console.log(`✅ 자동 감지된 위치 (${locationInfo.source}):`, targetCoords);
          if (locationInfo.city) {
            console.log(`📍 도시: ${locationInfo.city}, 국가: ${locationInfo.country}`);
          }
        } catch (ipError) {
          console.log('⚠️ IP 위치도 실패, 기본 좌표 사용');
          targetCoords = DEFAULT_COORDS;
          locationSource = '기본 좌표 (서울)';
        }
      }
    }

    // 현재 날씨와 5일 예보를 동시에 호출
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${targetCoords.lat}&lon=${targetCoords.lon}&appid=${apiKey}&units=metric&lang=kr`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${targetCoords.lat}&lon=${targetCoords.lon}&appid=${apiKey}&units=metric&lang=kr`)
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
        location: getKoreanLocationName(currentData.name, 'city') || currentData.name || '현재 위치',
        maxTemp: `${Math.round(maxTemp)}°C`,
        minTemp: `${Math.round(minTemp)}°C`,
        lastUpdate: new Date().toLocaleTimeString('ko-KR'),
        icon: currentData.weather[0].icon, // 메인 날씨 아이콘 추가
        weeklyForecast: weeklyForecast, // 5일 예보 추가
        source: `OpenWeatherMap API (한국어 변환: ${currentData.name} → ${getKoreanLocationName(currentData.name, 'city') || currentData.name})`
      };
    } else {
      console.error('OpenWeatherMap API 오류:', currentData.message || forecastData.message);
      throw new Error('API 오류: ' + (currentData.message || forecastData.message));
    }
  } catch (error) {
    console.error('날씨 정보 조회 실패:', error);
    throw error;
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

// 통합 날씨 정보 조회 함수
export const getWeatherInfo = async (apiKey = null, coords = null) => {
  return await getCurrentWeather(apiKey, coords);
};

// 한국어 지역명 변환 함수 export
export { getKoreanLocationName };
