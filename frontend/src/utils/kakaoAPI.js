// =================================================================
// 카카오 API 통합 클라이언트 (2025.07.08 신규 추가)
// 지원 API: 주소검색, 지도, 로컬검색, 키워드검색 등
// =================================================================

// 카카오 REST API 클라이언트 생성
const createKakaoClient = () => {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  
  if (!REST_API_KEY) {
    console.warn('카카오 REST API 키가 설정되지 않았습니다.');
    return null;
  }

  return {
    baseURL: 'https://dapi.kakao.com',
    headers: {
      'Authorization': `KakaoAK ${REST_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };
};

// =================================================================
// 1. 카카오 주소 검색 API
// =================================================================

/**
 * 주소로 좌표 검색 (Geocoding)
 * @param {string} address - 검색할 주소
 * @returns {Promise} 좌표 정보
 */
export const searchAddressToCoord = async (address) => {
  const kakaoClient = createKakaoClient();
  if (!kakaoClient) {
    throw new Error('카카오 API 키가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch(
      `${kakaoClient.baseURL}/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
      {
        method: 'GET',
        headers: kakaoClient.headers
      }
    );

    const data = await response.json();
    console.log('카카오 주소검색 응답:', data);

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      return {
        success: true,
        address: result.address_name,
        roadAddress: result.road_address?.address_name || '',
        x: parseFloat(result.x), // 경도
        y: parseFloat(result.y), // 위도
        addressType: result.address_type
      };
    } else {
      return {
        success: false,
        message: '검색 결과가 없습니다.'
      };
    }
  } catch (error) {
    console.error('카카오 주소검색 오류:', error);
    throw error;
  }
};

/**
 * 좌표로 주소 검색 (Reverse Geocoding)
 * @param {number} x - 경도
 * @param {number} y - 위도
 * @returns {Promise} 주소 정보
 */
export const searchCoordToAddress = async (x, y) => {
  const kakaoClient = createKakaoClient();
  if (!kakaoClient) {
    throw new Error('카카오 API 키가 설정되지 않았습니다.');
  }

  try {
    const response = await fetch(
      `${kakaoClient.baseURL}/v2/local/geo/coord2address.json?x=${x}&y=${y}`,
      {
        method: 'GET',
        headers: kakaoClient.headers
      }
    );

    const data = await response.json();
    console.log('카카오 좌표→주소 응답:', data);

    if (data.documents && data.documents.length > 0) {
      const result = data.documents[0];
      return {
        success: true,
        address: result.address?.address_name || '',
        roadAddress: result.road_address?.address_name || '',
        region1: result.address?.region_1depth_name || '',
        region2: result.address?.region_2depth_name || '',
        region3: result.address?.region_3depth_name || ''
      };
    } else {
      return {
        success: false,
        message: '주소를 찾을 수 없습니다.'
      };
    }
  } catch (error) {
    console.error('카카오 좌표→주소 변환 오류:', error);
    throw error;
  }
};

// =================================================================
// 2. 카카오 로컬 검색 API (병원, 약국 등)
// =================================================================

/**
 * 키워드로 장소 검색
 * @param {string} query - 검색 키워드 (예: "부산 병원", "약국")
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 장소 검색 결과
 */
export const searchPlacesByKeyword = async (query, options = {}) => {
  const kakaoClient = createKakaoClient();
  if (!kakaoClient) {
    throw new Error('카카오 API 키가 설정되지 않았습니다.');
  }

  const {
    x = null,        // 중심 좌표 X (경도)
    y = null,        // 중심 좌표 Y (위도)
    radius = 20000,  // 검색 반경 (미터, 최대 20000)
    page = 1,        // 페이지 번호
    size = 15,       // 한 페이지 결과 수 (최대 15)
    sort = 'accuracy' // 정렬 방식: accuracy(정확도) 또는 distance(거리)
  } = options;

  try {
    let url = `${kakaoClient.baseURL}/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
    
    if (x && y) {
      url += `&x=${x}&y=${y}&radius=${radius}&sort=${sort}`;
    }
    url += `&page=${page}&size=${size}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: kakaoClient.headers
    });

    const data = await response.json();
    console.log('카카오 키워드 검색 응답:', data);

    if (data.documents) {
      return {
        success: true,
        places: data.documents.map(place => ({
          id: place.id,
          name: place.place_name,
          category: place.category_name,
          phone: place.phone,
          address: place.address_name,
          roadAddress: place.road_address_name,
          x: parseFloat(place.x),
          y: parseFloat(place.y),
          placeUrl: place.place_url,
          distance: place.distance ? (parseInt(place.distance) >= 1000 ? `${(parseInt(place.distance) / 1000).toFixed(1)}km` : `${parseInt(place.distance)}m`) : null
        })),
        totalCount: data.meta.total_count,
        hasMore: !data.meta.is_end
      };
    } else {
      return {
        success: false,
        message: '검색 결과가 없습니다.',
        places: []
      };
    }
  } catch (error) {
    console.error('카카오 키워드 검색 오류:', error);
    throw error;
  }
};

/**
 * 카테고리로 장소 검색 (병원, 약국 등)
 * @param {string} categoryCode - 카테고리 코드 (HP8: 병원, PM9: 약국 등)
 * @param {number} x - 중심 좌표 X (경도)
 * @param {number} y - 중심 좌표 Y (위도)
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 카테고리 검색 결과
 */
export const searchPlacesByCategory = async (categoryCode, x, y, options = {}) => {
  const kakaoClient = createKakaoClient();
  if (!kakaoClient) {
    throw new Error('카카오 API 키가 설정되지 않았습니다.');
  }

  const {
    radius = 20000,  // 검색 반경 (미터)
    page = 1,        // 페이지 번호
    size = 15,       // 한 페이지 결과 수
    sort = 'distance' // 정렬 방식: accuracy(정확도) 또는 distance(거리)
  } = options;

  try {
    const url = `${kakaoClient.baseURL}/v2/local/search/category.json?category_group_code=${categoryCode}&x=${x}&y=${y}&radius=${radius}&page=${page}&size=${size}&sort=${sort}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: kakaoClient.headers
    });

    const data = await response.json();
    console.log('카카오 카테고리 검색 응답:', data);

    if (data.documents) {
      return {
        success: true,
        places: data.documents.map(place => ({
          id: place.id,
          name: place.place_name,
          category: place.category_name,
          phone: place.phone,
          address: place.address_name,
          roadAddress: place.road_address_name,
          x: parseFloat(place.x),
          y: parseFloat(place.y),
          placeUrl: place.place_url,
          distance: parseInt(place.distance) >= 1000 ? `${(parseInt(place.distance) / 1000).toFixed(1)}km` : `${parseInt(place.distance)}m`
        })),
        totalCount: data.meta.total_count,
        hasMore: !data.meta.is_end
      };
    } else {
      return {
        success: false,
        message: '검색 결과가 없습니다.',
        places: []
      };
    }
  } catch (error) {
    console.error('카카오 카테고리 검색 오류:', error);
    throw error;
  }
};

// =================================================================
// 3. 헬스케어 특화 함수들
// =================================================================

/**
 * 부산 지역 병원 검색 (카카오 API 사용)
 * @param {Object} location - 위치 정보 { x, y } 또는 null (부산 중심가 사용)
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 병원 검색 결과
 */
export const searchHospitalsByLocation = async (location = null, options = {}) => {
  // 기본 중심 좌표 (서울시청)
  const DEFAULT_CENTER = { x: 126.9780, y: 37.5665 };
  const searchLocation = location || DEFAULT_CENTER;

  return await searchPlacesByCategory('HP8', searchLocation.x, searchLocation.y, {
    radius: 20000,
    size: 15,
    sort: 'distance',
    ...options
  });
};

/**
 * 부산 지역 약국 검색 (카카오 API 사용)
 * @param {Object} location - 위치 정보 { x, y }
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 약국 검색 결과
 */
export const searchPharmaciesByLocation = async (location = null, options = {}) => {
  const DEFAULT_CENTER = { x: 126.9780, y: 37.5665 };
  const searchLocation = location || DEFAULT_CENTER;

  return await searchPlacesByCategory('PM9', searchLocation.x, searchLocation.y, {
    radius: 15000,
    size: 15,
    sort: 'distance',
    ...options
  });
};

/**
 * 응급실 검색
 * @param {Object} location - 위치 정보 { x, y }
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 응급실 검색 결과
 */
export const searchEmergencyRooms = async (location, options = {}) => {
  return await searchPlacesByKeyword('응급실', {
    x: location.x,
    y: location.y,
    radius: 30000,
    size: 10,
    sort: 'distance',
    ...options
  });
};

// =================================================================
// 4. 유틸리티 함수들
// =================================================================

/**
 * 두 좌표 간의 거리 계산 (km)
 * @param {number} x1 - 첫 번째 지점 경도
 * @param {number} y1 - 첫 번째 지점 위도  
 * @param {number} x2 - 두 번째 지점 경도
 * @param {number} y2 - 두 번째 지점 위도
 * @returns {number} 거리 (km)
 */
export const calculateDistance = (x1, y1, x2, y2) => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (y2 - y1) * Math.PI / 180;
  const dLon = (x2 - x1) * Math.PI / 180;
  const lat1Rad = y1 * Math.PI / 180;
  const lat2Rad = y2 * Math.PI / 180;

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

/**
 * 현재 위치 얻기 (브라우저 Geolocation API)
 * @returns {Promise} 현재 위치 좌표
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('브라우저에서 위치 서비스를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          x: position.coords.longitude,
          y: position.coords.latitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        console.error('위치 정보 획득 실패:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분간 캐시 사용
      }
    );
  });
};

// =================================================================
// 카카오맵 JavaScript SDK 관련 함수들
// =================================================================

/**
 * 카카오맵 JavaScript SDK 로드
 * @returns {Promise} SDK 로드 완료 여부
 */
export const loadKakaoMapSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(true);
      return;
    }

    const JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
    if (!JAVASCRIPT_KEY) {
      reject(new Error('카카오 JavaScript 키가 설정되지 않았습니다.'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JAVASCRIPT_KEY}&libraries=services`;
    script.async = true;
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        resolve(true);
      } else {
        reject(new Error('카카오맵 SDK 로드 실패'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('카카오맵 SDK 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });
};

// =================================================================
// 카테고리 코드 상수
// =================================================================
export const KAKAO_CATEGORY_CODES = {
  HOSPITAL: 'HP8',          // 병원
  PHARMACY: 'PM9',          // 약국
  CONVENIENCE_STORE: 'CS2', // 편의점
  CAFE: 'CE7',              // 카페
  GAS_STATION: 'OL7',       // 주유소
  SUBWAY_STATION: 'SW8',    // 지하철역
  BUS_STOP: 'BK9',          // 버스정류장
  PARKING: 'PK6',           // 주차장
  BANK: 'BK9',              // 은행
  RESTAURANT: 'FD6'         // 음식점
};
