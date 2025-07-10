// =================================================================
// API 클라이언트 통합 설정 (2025.07.08 통합 버전)
// 목적: axios 대신 중앙화된 API 클라이언트 사용
// 기능: 토큰 자동 관리, 에러 처리, 요청/응답 인터셉터
// =================================================================

import axios from 'axios';

// 기본 API 클라이언트 생성
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 자동 JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('API 응답 에러:', error);
    
    if (error.response?.status === 401) {
      console.error('인증 만료. 로그인이 필요합니다.');
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      localStorage.removeItem('jwt');
      localStorage.removeItem('loginId');
      localStorage.removeItem('guardianName');
      localStorage.removeItem('role');
      
      // 자동 로그아웃 및 리다이렉트 (2025.07.08 활성화)
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      
      // 현재 페이지 정보 저장 (로그인 후 돌아오기 용)
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/register') {
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      console.error('접근 권한이 없습니다.');
    } else if (error.response?.status === 404) {
      console.error('요청한 리소스를 찾을 수 없습니다.');
    } else if (error.response?.status >= 500) {
      console.error('서버 내부 오류가 발생했습니다.');
    }
    
    return Promise.reject(error);
  }
);

// =================================================================
// Guardian (보호자) 관련 API 함수들 (2025.07.08 신규 추가)
// =================================================================

/**
 * Guardian 프로필 정보 조회
 * @returns {Promise} Guardian 프로필 데이터
 */
export const getGuardianProfile = async () => {
  try {
    const response = await apiClient.get('/api/guardians/me');
    const data = response.data;
    
    // 백엔드 필드명을 프론트엔드에서 사용하는 필드명으로 매핑
    return {
      ...data,
      phoneNumber: data.phone  // phone -> phoneNumber
    };
  } catch (error) {
    console.error('Guardian 프로필 조회 실패:', error);
    throw error;
  }
};

/**
 * Guardian 비밀번호 확인
 * @param {string} password - 확인할 비밀번호
 * @returns {Promise} 비밀번호 확인 결과
 */
export const verifyGuardianPassword = async (password) => {
  try {
    const response = await apiClient.post('/api/guardians/me/verify-password', {
      password: password
    });
    return response.data;
  } catch (error) {
    console.error('Guardian 비밀번호 확인 실패:', error);
    throw error;
  }
};

/**
 * Guardian 프로필 정보 수정
 * @param {Object} updateData - 수정할 프로필 정보
 * @returns {Promise} 수정된 프로필 데이터
 */
export const updateGuardianProfile = async (updateData) => {
  try {
    // 비밀번호 변경이 포함된 경우
    if (updateData.currentPassword && updateData.newPassword) {
      // 비밀번호 변경 요청
      await apiClient.put('/api/guardians/me/password', {
        currentPassword: updateData.currentPassword,
        newPassword: updateData.newPassword
      });
      
      // 비밀번호 필드 제거 후 기본 정보 업데이트
      const { currentPassword, newPassword, ...profileData } = updateData;
      if (Object.keys(profileData).length > 0) {
        // 필드명 매핑: 백엔드에서 기대하는 필드명으로 변경
        const mappedData = {
          guardianName: profileData.guardianName,
          phone: profileData.phoneNumber, // phoneNumber -> phone
          email: profileData.email
        };
        const response = await apiClient.put('/api/guardians/me', mappedData);
        return response.data;
      }
      
      return { message: '비밀번호가 성공적으로 변경되었습니다.' };
    } else {
      // 기본 정보만 업데이트
      // 필드명 매핑: 백엔드에서 기대하는 필드명으로 변경
      const mappedData = {
        guardianName: updateData.guardianName,
        phone: updateData.phoneNumber, // phoneNumber -> phone
        email: updateData.email
      };
      const response = await apiClient.put('/api/guardians/me', mappedData);
      return response.data;
    }
  } catch (error) {
    console.error('Guardian 프로필 수정 실패:', error);
    throw error;
  }
};

// =================================================================
// Senior 관련 API 함수들
// =================================================================

/**
 * 특정 날짜의 Senior 목록 조회
 * @param {string} date - YYYY-MM-DD 형식의 날짜
 * @returns {Promise} Senior 목록 데이터
 */
export const getSeniorsForDate = async (date) => {
  try {
    const response = await apiClient.get(`/api/seniors?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Senior 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 모든 Senior 목록 조회
 * @returns {Promise} Senior 목록 데이터
 */
export const getAllSeniors = async () => {
  try {
    const response = await apiClient.get('/api/seniors');
    return response.data;
  } catch (error) {
    console.error('전체 Senior 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 Senior의 일일 활동 데이터 조회
 * @param {number} seniorId - Senior ID
 * @returns {Promise} Daily Activities 데이터
 */
export const getSeniorDailyActivities = async (seniorId) => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}/dailyActivities`);
    return response.data;
  } catch (error) {
    console.error('Senior Daily Activities 조회 실패:', error);
    throw error;
  }
};

// =================================================================
// 병원 관련 API 함수들
// =================================================================

/**
 * 부산 지역 병원 목록 조회
 * @returns {Promise} 부산 병원 목록 데이터
 */
export const getBusanHospitals = async () => {
  try {
    const response = await apiClient.get('/api/hospital/busan');
    return response.data;
  } catch (error) {
    console.error('부산 병원 목록 조회 실패:', error);
    throw error;
  }
};

// =================================================================
// 인증 관련 API 함수들 (추후 확장용)
// =================================================================

/**
 * 로그인 API
 * @param {Object} loginData - 로그인 정보 { loginId, password }
 * @returns {Promise} 로그인 응답 데이터
 */
export const login = async (loginData) => {
  try {
    const response = await apiClient.post('/api/auth/login', loginData);
    return response.data;
  } catch (error) {
    console.error('로그인 실패:', error);
    throw error;
  }
};

/**
 * 회원가입 API
 * @param {Object} registerData - 회원가입 정보
 * @returns {Promise} 회원가입 응답 데이터
 */
export const register = async (registerData) => {
  try {
    const response = await apiClient.post('/api/auth/register', registerData);
    return response.data;
  } catch (error) {
    console.error('회원가입 실패:', error);
    throw error;
  }
};

// =================================================================
// 기본 API 클라이언트 export (고급 사용자용)
// =================================================================
export default apiClient;

// =================================================================
// 카카오 API 연동 함수들 (2025.07.08 신규 추가)
// =================================================================

/**
 * 백엔드 카카오 API를 사용한 부산 지역 병원 검색 (2025.07.08 수정)
 * @param {Object} options - 검색 옵션
 * @returns {Promise} 병원 검색 결과
 */
export const getBusanHospitalsFromKakaoBackend = async (options = {}) => {
  try {
    const {
      query = '병원',
      page = 1,
      size = 15,
      lat = 35.1796,  // 부산시청 위도
      lon = 129.0756   // 부산시청 경도
    } = options;

    const response = await apiClient.get('/api/hospital/kakao/busan', {
      params: { query, page, size, lat, lon }
    });
    
    console.log('백엔드 카카오 API 병원 검색 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('백엔드 카카오 병원 검색 실패:', error);
    throw error;
  }
};

/**
 * 카카오 API를 사용한 주소 검색
 * @param {string} address - 검색할 주소
 * @returns {Promise} 주소 검색 결과
 */
export const searchAddress = async (address) => {
  try {
    const { searchAddressToCoord } = await import('../utils/kakaoAPI');
    const result = await searchAddressToCoord(address);
    
    if (result.success) {
      return {
        success: true,
        address: result.address,
        roadAddress: result.roadAddress,
        coordinates: { x: result.x, y: result.y }
      };
    } else {
      throw new Error(result.message || '주소 검색 실패');
    }
  } catch (error) {
    console.error('주소 검색 실패:', error);
    throw error;
  }
};

/**
 * 현재 위치 기반 주변 약국 검색
 * @param {Object} location - 위치 정보 { x, y }
 * @returns {Promise} 약국 검색 결과
 */
export const getNearbyPharmacies = async (location) => {
  try {
    const { searchBusanPharmacies } = await import('../utils/kakaoAPI');
    const result = await searchBusanPharmacies(location);
    
    if (result.success) {
      return {
        success: true,
        pharmacies: result.places,
        totalCount: result.totalCount
      };
    } else {
      throw new Error(result.message || '약국 검색 실패');
    }
  } catch (error) {
    console.error('약국 검색 실패:', error);
    throw error;
  }
};

/**
 * 응급실 검색
 * @param {Object} location - 위치 정보 { x, y }
 * @returns {Promise} 응급실 검색 결과
 */
export const getEmergencyRooms = async (location) => {
  try {
    const { searchEmergencyRooms } = await import('../utils/kakaoAPI');
    const result = await searchEmergencyRooms(location);
    
    if (result.success) {
      return {
        success: true,
        emergencyRooms: result.places,
        totalCount: result.totalCount
      };
    } else {
      throw new Error(result.message || '응급실 검색 실패');
    }
  } catch (error) {
    console.error('응급실 검색 실패:', error);
    throw error;
  }
};
