// =================================================================
// Vital Signs 관련 API 함수들 (2025.07.17 신규 추가)
// =================================================================

/**
 * 특정 Senior의 전체 생체 기록 조회
 * @param {number} seniorId - Senior ID
 * @returns {Promise} 생체 기록 데이터
 */
export const getVitalSigns = async (seniorId) => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}/vitalSign`);
    return response.data;
  } catch (error) {
    console.error('생체 기록 조회 실패:', error);
    throw error;
  }
};

/**
 * 드롭다운 항목 사용 여부 체크
 * @param {number} itemId - 체크할 항목 ID
 * @returns {Promise} 사용 여부 체크 결과
 */
export const checkItemUsage = async (itemId) => {
  try {
    console.log('🔍 항목 사용 여부 체크 시도:', itemId);
    
    const response = await apiClient.get(`/api/user-settings/dropdown-item/${itemId}/usage-check`);
    
    console.log('✅ 항목 사용 여부 체크 결과:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ 항목 사용 여부 체크 실패:', error);
    throw error;
  }
};

/**
 * 특정 날짜의 생체 기록 조회
 * @param {number} seniorId - Senior ID
 * @param {string} date - 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise} 해당 날짜의 생체 기록 데이터
 */
export const getVitalSignsByDate = async (seniorId, date) => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}/vitalSign/date/${date}`);
    return response.data;
  } catch (error) {
    console.error('날짜별 생체 기록 조회 실패:', error);
    throw error;
  }
};

/**
 * 날짜 범위 내 생체 기록 조회
 * @param {number} seniorId - Senior ID
 * @param {string} startDate - 시작 날짜 (YYYY-MM-DD 형식)
 * @param {string} endDate - 종료 날짜 (YYYY-MM-DD 형식)
 * @returns {Promise} 기간 내 생체 기록 데이터
 */
export const getVitalSignsByDateRange = async (seniorId, startDate, endDate) => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}/vitalSign/date/range`, {
      params: { start: startDate, end: endDate }
    });
    return response.data;
  } catch (error) {
    console.error('기간별 생체 기록 조회 실패:', error);
    throw error;
  }
};

/**
 * 생체 기록 생성
 * @param {number} seniorId - Senior ID
 * @param {Object} vitalData - 생체 기록 데이터
 * @returns {Promise} 생성 결과
 */
export const createVitalSign = async (seniorId, vitalData) => {
  try {
    const response = await apiClient.post(`/api/seniors/${seniorId}/vitalSign`, vitalData);
    return response.data;
  } catch (error) {
    console.error('생체 기록 생성 실패:', error);
    throw error;
  }
};

/**
 * 생체 기록 수정
 * @param {number} seniorId - Senior ID
 * @param {number} vitalId - Vital Sign ID
 * @param {Object} updateData - 수정할 데이터
 * @returns {Promise} 수정 결과
 */
export const updateVitalSign = async (seniorId, vitalId, updateData) => {
  try {
    const response = await apiClient.put(`/api/seniors/${seniorId}/vitalSign/${vitalId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('생체 기록 수정 실패:', error);
    throw error;
  }
};

/**
 * 생체 기록 삭제
 * @param {number} seniorId - Senior ID
 * @param {number} vitalId - Vital Sign ID
 * @returns {Promise} 삭제 결과
 */
export const deleteVitalSign = async (seniorId, vitalId) => {
  try {
    const response = await apiClient.delete(`/api/seniors/${seniorId}/vitalSign/${vitalId}`);
    return response.data;
  } catch (error) {
    console.error('생체 기록 삭제 실패:', error);
    throw error;
  }
};

// =================================================================
// API 클라이언트 통합 설정 (2025.07.08 통합 버전)
// 목적: axios 대신 중앙화된 API 클라이언트 사용
// 기능: 토큰 자동 관리, 에러 처리, 요청/응답 인터셉터
// =================================================================

import axios from 'axios';
import { getAuthToken, getRefreshToken, updateAccessToken, clearAuthData } from '../utils/auth';

// 기본 API 클라이언트 생성
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 중복 방지를 위한 변수
let refreshPromise = null;

// 요청 인터셉터 - 자동 JWT 토큰 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('=== API 요청 상세 ===');
    console.log('토큰 존재:', !!token);
    if (token) {
      console.log('토큰 첫 20자:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('토큰 없음 - 인증 헤더 미추가');
    }
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    console.log('요청 헤더:', config.headers);
    return config;
  },
  (error) => {
    console.error('API 요청 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API 응답: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('API 응답 에러:', error);
    
    const originalRequest = error.config;
    
    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 로그인 요청 자체가 실패한 경우는 갱신 시도하지 않음
      if (originalRequest.url.includes('/auth/login')) {
        return Promise.reject(error);
      }
      
      originalRequest._retry = true;
      
      // Refresh Token으로 토큰 갱신 시도
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        // 중복 갱신 방지
        if (!refreshPromise) {
          refreshPromise = axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then(response => {
            const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
            
            // 새 토큰 저장
            updateAccessToken(accessToken, expiresIn);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            
            return accessToken;
          })
          .catch(error => {
            // 토큰 갱신 실패 시 로그아웃
            clearAuthData();
            window.location.href = '/';
            throw error;
          })
          .finally(() => {
            refreshPromise = null;
          });
        }
        
        try {
          const newToken = await refreshPromise;
          // 새 토큰으로 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      // Refresh Token이 없으면 로그아웃
      console.error('인증 만료. 로그인이 필요합니다.');
      clearAuthData();
      
      // 자동 로그아웃 및 리다이렉트 (2025.07.08 활성화)
      alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      
      // 현재 페이지 정보 저장 (로그인 후 돌아오기 용)
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/register') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
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
// 일정관리 관련 API 함수들 (2025.07.10 추가)
// =================================================================

/**
 * 드롭다운 항목 ID 포함 조회 (일정관리 카테고리)
 * @returns {Promise} ID와 value를 포함한 항목 목록
 */
export const getScheduleDropdownItemsWithId = async () => {
  try {
    const response = await apiClient.get('/api/user-settings/dropdown-items-with-id');
    return response.data;
  } catch (error) {
    console.error('일정 드롭다운 ID 포함 조회 실패:', error);
    throw error;
  }
};

/**
 * 일정 항목 삭제
 * @param {number} itemId - 삭제할 일정 항목 ID
 * @returns {Promise} 삭제 결과
 */
export const deleteScheduleItem = async (itemId) => {
  try {
    const response = await apiClient.delete(`/api/user-settings/dropdown-item/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('일정 항목 삭제 실패:', error);
    throw error;
  }
};

/**
 * 드롭다운 항목 조회 (일정관리 카테고리)
 * @returns {Promise} 드롭다운 항목 목록
 */
export const getScheduleDropdownItems = async () => {
  try {
    const response = await apiClient.get('/api/user-settings/dropdown-items');
    return response.data;
  } catch (error) {
    console.error('일정 드롭다운 항목 조회 실패:', error);
    throw error;
  }
};

/**
 * 새로운 일정 항목 추가
 * @param {string} itemValue - 추가할 일정 항목
 * @returns {Promise} 추가 결과
 */
export const addScheduleItem = async (itemValue) => {
  try {
    const response = await apiClient.post('/api/user-settings/dropdown-item', {
      itemValue: itemValue,
      category: '일정관리'
    });
    return response.data;
  } catch (error) {
    console.error('일정 항목 추가 실패:', error);
    throw error;
  }
};

/**
 * 일일 활동 저장 (오늘의 할 일)
 * @param {Object} data - 저장할 일정 데이터
 * @returns {Promise} 저장 결과
 */
export const saveTodaySchedule = async (data) => {
  try {
    const response = await apiClient.post('/api/daily-activities/save', data);
    return response.data;
  } catch (error) {
    console.error('오늘의 할 일 저장 실패:', error);
    throw error;
  }
};

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
 * 페이지네이션을 지원하는 Senior 목록 조회
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 * @param {string} sort - 정렬 기준 (예: 'seniorName,asc')
 * @returns {Promise} Senior 목록 데이터
 */
export const getSeniorsWithPagination = async (page = 0, size = 10, sort = 'createdAt,desc') => {
  try {
    const response = await apiClient.get('/api/seniors', {
      params: { page, size, sort }
    });
    return response.data;
  } catch (error) {
    console.error('Senior 목록 페이지 조회 실패:', error);
    throw error;
  }
};

/**
 * 모든 Senior 목록 조회 (크기 증가)
 * @param {number} size - 한 번에 가져올 시니어 수 (기본값: 100)
 * @returns {Promise} Senior 목록 데이터
 */
export const getAllSeniors = async (size = 100) => {
  try {
    // 파라미터로 더 많은 데이터 요청
    const response = await apiClient.get('/api/seniors', {
      params: { size }
    });
    console.log('📊 getAllSeniors 요청 크기:', size, '응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('전체 Senior 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * Senior 정보 상세 조회
 * @param {number} seniorId - Senior ID
 * @returns {Promise} Senior 상세 정보
 */
export const getSeniorById = async (seniorId) => {
  try {
    const response = await apiClient.get(`/api/seniors/${seniorId}`);
    return response.data;
  } catch (error) {
    console.error('Senior 상세 정보 조회 실패:', error);
    throw error;
  }
};

/**
 * Senior 정보 등록
 * @param {Object} seniorData - 등록할 Senior 정보
 * @returns {Promise} 등록된 Senior 정보
 */
export const createSenior = async (seniorData) => {
  try {
    const response = await apiClient.post('/api/seniors', seniorData);
    return response.data;
  } catch (error) {
    console.error('Senior 등록 실패:', error);
    throw error;
  }
};

/**
 * Senior 정보 수정
 * @param {number} seniorId - 수정할 Senior ID
 * @param {Object} updateData - 수정할 정보
 * @returns {Promise} 수정된 Senior 정보
 */
export const updateSenior = async (seniorId, updateData) => {
  try {
    const response = await apiClient.put(`/api/seniors/${seniorId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Senior 정보 수정 실패:', error);
    throw error;
  }
};

/**
 * Senior 삭제
 * @param {number} seniorId - 삭제할 Senior ID
 * @returns {Promise} 삭제 결과
 */
export const deleteSenior = async (seniorId) => {
  try {
    const response = await apiClient.delete(`/api/seniors/${seniorId}`);
    return response.data;
  } catch (error) {
    console.error('Senior 삭제 실패:', error);
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
 * 전국 병원 목록 조회 (2025.07.17 부산 제한 제거)
 * @param {Object} options - 검색 옵션
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @param {number} options.size - 페이지 크기 (기본값: 10)
 * @param {string} options.sidoCd - 시도 코드 (옵션)
 * @returns {Promise} 병원 목록 데이터
 */
export const getAllHospitals = async (options = {}) => {
  try {
    const {
      page = 1,
      size = 10,
      sidoCd
    } = options;

    const params = { page, size };
    if (sidoCd) {
      params.sidoCd = sidoCd;
    }

    const response = await apiClient.get('/api/hospital/all', { params });
    return response.data;
  } catch (error) {
    console.error('전국 병원 목록 조회 실패:', error);
    throw error;
  }
};

// =================================================================
// 인증 관련 API 함수들 (추후 확장용)
// =================================================================

/**
 * 로그인 API
 * @param {Object} loginData - 로그인 정보 { loginId, loginPw }
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
 * 로그아웃 API
 * @returns {Promise} 로그아웃 응답
 */
export const logout = async () => {
  try {
    // 로그아웃 요청 (Authorization 헤더는 인터셉터가 자동 추가)
    const response = await apiClient.post('/api/auth/logout');
    
    // 로컬 인증 데이터 삭제
    clearAuthData();
    
    return response.data;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    // 에러가 발생해도 로컬 데이터는 정리
    clearAuthData();
    throw error;
  }
};

/**
 * 모든 기기에서 로그아웃 API
 * @returns {Promise} 로그아웃 응답
 */
export const logoutAll = async () => {
  try {
    const response = await apiClient.post('/api/auth/logout-all');
    clearAuthData();
    return response.data;
  } catch (error) {
    console.error('전체 로그아웃 실패:', error);
    clearAuthData();
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
// 카카오 API 연동 함수들 (2025.07.08 신규 추가)
// =================================================================

/**
 * 카카오 API를 사용한 전국 병원 검색 (2025.07.17 부산 제한 제거)
 * @param {Object} options - 검색 옵션
 * @param {string} options.query - 검색어 (기본값: '병원')
 * @param {number} options.page - 페이지 번호 (기본값: 1)
 * @param {number} options.size - 한 페이지 결과 수 (기본값: 15)
 * @param {number} options.lat - 검색 중심 위도
 * @param {number} options.lon - 검색 중심 경도
 * @param {number} options.radius - 검색 반경 (m, 기본값: 20000)
 * @returns {Promise} 카카오 API 기반 병원 정보
 */
export const getHospitalsByLocation = async (options = {}) => {
  try {
    const {
      query = '병원',
      page = 1,
      size = 15,
      lat = 37.5665,  // 서울시청 위도
      lon = 126.9780,  // 서울시청 경도
      radius = 20000   // 20km 반경
    } = options;

    const response = await apiClient.get('/api/hospital/kakao/search', {
      params: { query, page, size, lat, lon, radius }
    });
    
    console.log('카카오 API 병원 검색 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('카카오 병원 검색 실패:', error);
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
    const { searchPharmaciesByLocation } = await import('../utils/kakaoAPI');
    const result = await searchPharmaciesByLocation(location);
    
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

// =================================================================
// UserSetting 관련 API 함수들 (바이탈 설정)
// =================================================================

/**
 * 바이탈 사인 설정을 Map 형태로 조회
 * @returns {Promise} 바이탈 설정 Map (key-value)
 */
export const getVitalSettings = async () => {
  try {
    const response = await apiClient.get('/api/user-settings/vital-config');
    return response.data;
  } catch (error) {
    console.error('바이탈 설정 조회 실패:', error);
    throw error;
  }
};

/**
 * 특정 카테고리의 사용자 설정 조회
 * @param {string} category - 카테고리 (예: '설정')
 * @returns {Promise} 사용자 설정 배열
 */
export const getUserSettingsByCategory = async (category) => {
  try {
    const response = await apiClient.get('/api/user-settings', {
      params: { category }
    });
    return response.data;
  } catch (error) {
    console.error('사용자 설정 조회 실패:', error);
    throw error;
  }
};

/**
 * 사용자 설정 저장/수정
 * @param {Object} settingData - 설정 데이터 { category, subCategory, values }
 * @returns {Promise} 저장된 설정 데이터
 */
export const saveUserSetting = async (settingData) => {
  try {
    // guardianId가 없으면 인증 정보에서 가져오기
    if (!settingData.guardianId) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      settingData.guardianId = userInfo.id || 37; // 기본값 37
    }
    
    const response = await apiClient.post('/api/monitoring-settings/user-settings', settingData);
    return response.data;
  } catch (error) {
    console.error('사용자 설정 저장 실패:', error);
    throw error;
  }
};

/**
 * 드롭다운 항목 조회
 * @returns {Promise} 드롭다운 항목 배열
 */
export const getDropdownItems = async () => {
  try {
    const response = await apiClient.get('/api/user-settings/dropdown');
    return response.data;
  } catch (error) {
    console.error('드롭다운 항목 조회 실패:', error);
    throw error;
  }
};

// =================================================================
// 기준선 표시 설정 관련 API 함수들 (2025.07.24 신규 추가)
// =================================================================

/**
 * 기준선 표시 설정 조회
 * @returns {Promise} 기준선 표시 설정 오브젝트
 */
export const getThresholdDisplaySettings = async () => {
  try {
    const response = await getUserSettingsByCategory('그래프');  // 카테고리: '그래프'
    
    // 배열을 오브젝트로 변환
    const thresholdSettings = {};
    if (Array.isArray(response)) {
      response.forEach(setting => {
        // dropdown_threshold_ 로 시작하는 설정만 필터링
        if (setting.subCategory.startsWith('dropdown_threshold_')) {
          const cleanKey = setting.subCategory.replace('dropdown_threshold_', '');
          thresholdSettings[cleanKey] = setting.values === 'true';
        }
      });
    }
    
    console.log('📊 로드된 기준선 설정:', thresholdSettings);
    return thresholdSettings;
  } catch (error) {
    console.error('기준선 표시 설정 조회 실패:', error);
    throw error;
  }
};

/**
 * 기준선 표시 설정 저장
 * @param {string} thresholdKey - 기준선 키 (bloodPressureAttentionMaxShow 등)
 * @param {boolean} isVisible - 표시 여부
 * @returns {Promise} 저장된 설정 데이터
 */
export const saveThresholdDisplaySetting = async (thresholdKey, isVisible) => {
  try {
    const settingData = {
      category: '그래프',  // 카테고리: '그래프'
      subCategory: `dropdown_threshold_${thresholdKey}`,  // 서브카테고리: 'dropdown_threshold_xxx'
      values: isVisible.toString()
    };
    
    console.log('💾 기준선 설정 저장 시도:', settingData);
    
    const response = await saveUserSetting(settingData);
    console.log(`✅ 기준선 표시 설정 저장 성공: ${thresholdKey} = ${isVisible}`);
    return response;
  } catch (error) {
    console.error('❌ 기준선 표시 설정 저장 실패:', error);
    console.error('❌ 에러 상세:', error.response?.data || error.message);
    throw error;
  }
};

// =================================================================
// Chart Legend Settings 관련 API 함수들 (2025.07.25 신규 추가) - 이동됨
// =================================================================

/**
 * 차트 범례 설정 조회
 * @param {number} guardianId - Guardian ID
 * @param {string} chartType - 차트 타입 (기본값: 'vital_detail')
 * @returns {Promise<Object>} 범례 설정 데이터
 */
export const getMainChartLegendSettings = async (guardianId, chartType = 'vital_detail') => {
  try {
    // guardianId가 전달되지 않았다면 JWT에서 추출
    if (!guardianId) {
      const token = getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        guardianId = payload.guardianId || payload.guardian_id || payload.id;
        
        if (!guardianId && payload.sub) {
          console.warn('⚠️ JWT에 guardianId가 없음. 사용자 이름:', payload.sub);
          throw new Error('JWT에 guardianId가 포함되지 않았습니다. 다시 로그인해주세요.');
        }
      }
      
      if (!guardianId) {
        console.error('❌ guardianId가 없음 - JWT payload:', payload);
        throw new Error('JWT에서 guardianId를 추출할 수 없습니다. 다시 로그인해주세요.');
      }
    }
    
    const response = await apiClient.get(`/api/user-settings/chart-legend`, {
      params: { guardianId, chartType }
    });
    return response.data.data || {}; // { "legend_systolic_bp": true, "legend_heart_rate": false, ... }
  } catch (error) {
    console.error('범례 설정 조회 실패:', error);
    return {}; // 오류 시 빈 객체 반환
  }
};

/**
 * 차트 범례 설정 저장
 * @param {string} datasetLabel - 데이터셋 라벨
 * @param {boolean} isVisible - 가시성 여부
 * @param {string} chartType - 차트 타입 (기본값: 'vital_detail')
 * @returns {Promise} 저장 결과
 */
export const saveMainChartLegendSetting = async (datasetLabel, isVisible, chartType = 'vital_detail') => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다.');
    }
    
    // JWT 토큰에서 payload 추출
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔑 JWT payload:', payload); // 디버깅
    
    // guardianId 추출 시도 - 임시로 고정값 사용
    let guardianId = payload.guardianId || payload.guardian_id || payload.id;
    
    if (!guardianId) {
      console.error('❌ JWT에 guardianId가 없음 - payload:', payload);
      throw new Error('JWT에 guardianId가 포함되지 않았습니다. 다시 로그인해주세요.');
    }
    
    const requestData = {
      guardianId,
      chartType,
      datasetLabel,
      isVisible
    };
    
    console.log('📤 API 요청 데이터:', requestData); // 디버깅
    
    const response = await apiClient.post('/api/user-settings/chart-legend', requestData);
    
    return response.data;
  } catch (error) {
    console.error('범례 설정 저장 실패:', error);
    throw error;
  }
};

// =================================================================
// 기본 API 클라이언트 export (고급 사용자용)
// =================================================================
export default apiClient;
