// 인증 관련 유틸리티 함수들

// 인증 데이터 저장
export const saveAuthData = (token, userData) => {
  const expirationTime = new Date().getTime() + (8 * 60 * 60 * 1000); // 8시간
  
  // 토큰과 만료 시간은 sessionStorage에 저장
  sessionStorage.setItem('jwt', token);
  sessionStorage.setItem('tokenExpiration', expirationTime);
  
  // 사용자 정보도 sessionStorage에 저장 (일관성)
  sessionStorage.setItem('loginId', userData.loginId);
  sessionStorage.setItem('guardianName', userData.name);
  sessionStorage.setItem('role', userData.role || 'GUARDIAN');
};

// 인증 토큰 가져오기 (만료 체크 포함)
export const getAuthToken = () => {
  const token = sessionStorage.getItem('jwt');
  const expiration = sessionStorage.getItem('tokenExpiration');
  
  if (!token || !expiration) return null;
  
  const now = new Date().getTime();
  if (now > parseInt(expiration)) {
    // 토큰이 만료된 경우 모든 데이터 삭제
    clearAuthData();
    return null;
  }
  
  return token;
};

// 인증 데이터 모두 삭제
export const clearAuthData = () => {
  sessionStorage.removeItem('jwt');
  sessionStorage.removeItem('tokenExpiration');
  sessionStorage.removeItem('loginId');
  sessionStorage.removeItem('guardianName');
  sessionStorage.removeItem('role');
};

// 사용자 정보 가져오기
export const getUserInfo = () => {
  // 토큰이 유효한지 먼저 확인
  const token = getAuthToken();
  if (!token) return null;
  
  return {
    name: sessionStorage.getItem('guardianName'),
    loginId: sessionStorage.getItem('loginId'),
    role: sessionStorage.getItem('role')
  };
};

// 인증 상태 확인
export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

// 토큰 만료 시간 갱신 (활동 시 호출)
export const refreshTokenExpiration = () => {
  const token = sessionStorage.getItem('jwt');
  if (token) {
    const newExpirationTime = new Date().getTime() + (8 * 60 * 60 * 1000); // 8시간 연장
    sessionStorage.setItem('tokenExpiration', newExpirationTime);
  }
};
