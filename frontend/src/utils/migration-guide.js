// 이 파일은 localStorage를 sessionStorage로 마이그레이션하는 가이드입니다.

// 1. Login.jsx에서 rememberMe 관련 부분은 그대로 localStorage 사용
//    - savedUserId, savedPassword, rememberMe는 브라우저를 닫아도 유지되어야 함

// 2. 나머지 모든 파일에서:
//    - localStorage.getItem('jwt') → getAuthToken()
//    - localStorage.getItem('guardianName') → getUserInfo().name
//    - localStorage.getItem('loginId') → getUserInfo().loginId
//    - localStorage.getItem('role') → getUserInfo().role
//    - localStorage.setItem/removeItem (인증 관련) → saveAuthData/clearAuthData 사용

// 3. 각 컴포넌트에 추가해야 할 import:
//    import { getUserInfo, clearAuthData, getAuthToken } from '../utils/auth';

// 4. 변경이 필요한 파일 목록:
//    - ProfileManagement.jsx
//    - SeniorList.jsx
//    - Sjoinpage.jsx

// 5. API 호출 시 토큰 사용 예시:
//    const token = getAuthToken();
//    if (!token) {
//      // 인증되지 않은 경우 처리
//      navigate('/login');
//      return;
//    }
