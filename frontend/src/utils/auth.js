// 인증 관련 유틸리티 함수들 (Stateful JWT 지원 버전)

// 인증 데이터 저장
export const saveAuthData = (accessToken, refreshToken, userData) => {
  console.log('saveAuthData 호출됨:', { 
    accessToken: !!accessToken, 
    refreshToken: !!refreshToken, 
    userData 
  });
  
  if (!userData) {
    console.error('userData가 undefined입니다');
    // 기본값 사용
    userData = { loginId: '', guardianName: '', role: 'GUARDIAN' };
  }
  
  const expirationTime = new Date().getTime() + (60 * 60 * 1000); // Access Token 1시간
  
  // Access Token과 만료 시간은 sessionStorage에 저장
  sessionStorage.setItem('jwt', accessToken);
  sessionStorage.setItem('tokenExpiration', expirationTime.toString());
  
  // Refresh Token은 localStorage에 저장 (세션 종료 후에도 유지)
  localStorage.setItem('refreshToken', refreshToken);
  
  // 사용자 정보도 sessionStorage에 저장
  sessionStorage.setItem('loginId', userData.loginId || '');
  sessionStorage.setItem('guardianName', userData.guardianName || '');
  sessionStorage.setItem('role', userData.role || 'GUARDIAN');
  
  console.log('saveAuthData 완료');
};

// Refresh Token 가져오기
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// 인증 토큰 가져오기 (만료 체크 포함)
export const getAuthToken = () => {
  const token = sessionStorage.getItem('jwt');
  const expiration = sessionStorage.getItem('tokenExpiration');
  
  console.log('=== getAuthToken 호출 ===');
  console.log('토큰 존재:', !!token);
  console.log('만료 시간 존재:', !!expiration);
  
  if (!token || !expiration) {
    console.log('토큰 또는 만료시간 없음 - null 반환');
    return null;
  }
  
  const now = new Date().getTime();
  const expirationTime = parseInt(expiration);
  console.log('현재 시간:', new Date(now).toISOString());
  console.log('만료 시간:', new Date(expirationTime).toISOString());
  
  if (now > expirationTime) {
    // Access Token이 만료된 경우 (Refresh는 apiClient에서 처리)
    console.log('Access Token 만료됨 - null 반환');
    return null;
  }
  
  console.log('유효한 토큰 반환');
  return token;
};

// 인증 데이터 모두 삭제
export const clearAuthData = () => {
  // 모든 토큰 및 사용자 정보 삭제
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('tokenExpiration');
  sessionStorage.removeItem('loginId');
  sessionStorage.removeItem('guardianName');
  sessionStorage.removeItem('role');
  localStorage.removeItem('refreshToken');
};

// Access Token 업데이트 (토큰 갱신 후 사용)
export const updateAccessToken = (newAccessToken, expiresIn = 3600) => {
  const expirationTime = new Date().getTime() + (expiresIn * 1000);
  sessionStorage.setItem('jwt', newAccessToken);
  sessionStorage.setItem('tokenExpiration', expirationTime);
};

// 사용자 정보 가져오기
export const getUserInfo = () => {
  // 토큰이 유효한지 먼저 확인
  const token = getAuthToken();
  const refreshToken = getRefreshToken();
  
  // Access Token이 없어도 Refresh Token이 있으면 사용자 정보 반환
  if (!token && !refreshToken) return null;
  
  return {
    name: sessionStorage.getItem('guardianName'),
    loginId: sessionStorage.getItem('loginId'),
    role: sessionStorage.getItem('role')
  };
};

// 인증 상태 확인
export const isAuthenticated = () => {
  // Access Token이 있거나 Refresh Token이 있으면 인증된 상태
  return getAuthToken() !== null || getRefreshToken() !== null;
};

// 토큰 만료 시간 갱신 (활동 시 호출) - 더 이상 사용하지 않음
export const refreshTokenExpiration = () => {
  console.warn('refreshTokenExpiration은 더 이상 사용되지 않습니다. 서버에서 새 토큰을 발급받습니다.');
};

// JWT 디코딩 헬퍼 함수
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (e) {
    return null;
  }
};

// 토큰 만료 시간 확인
export const getTokenExpirationTime = (token) => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000; // milliseconds로 변환
};
