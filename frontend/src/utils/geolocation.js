/**
 * 개선된 현재위치 획득 유틸리티
 * 
 * 주요 기능:
 * - 상세한 로깅 및 오류 처리
 * - 권한 상태 미리 확인
 * - 적절한 fallback 제공
 * - 사용자 친화적인 오류 메시지
 */

// 기본 위치 설정 (서울)
const DEFAULT_POSITION = {
  latitude: 37.5665,
  longitude: 126.9780,
  isDefault: true
};

/**
 * 현재 위치 획득 함수
 * @param {Object} options - 위치 옵션
 * @returns {Promise<Object>} 위치 정보 객체
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    console.log('🗺️ 현재위치 획득 시도 시작');
    
    // 1. Geolocation API 지원 확인
    if (!navigator.geolocation) {
      console.error('❌ 이 브라우저는 위치 서비스를 지원하지 않습니다.');
      console.log('🏢 서울 시청 기본 좌표로 대체');
      resolve({
        ...DEFAULT_POSITION,
        source: 'fallback',
        message: '브라우저가 위치 서비스를 지원하지 않음'
      });
      return;
    }

    // 2. HTTPS 확인 (localhost 제외)
    const isSecure = location.protocol === 'https:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      console.warn('⚠️ HTTP 환경에서는 위치 서비스가 제한될 수 있습니다.');
    }

    // 3. 기본 옵션 설정
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000,
      showAlert: true,
      ...options
    };

    // 4. 권한 상태 미리 확인
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({name: 'geolocation'});
          console.log(`🔐 현재 위치 권한 상태: ${permission.state}`);
          return permission.state;
        } catch (error) {
          console.warn('⚠️ 권한 상태 확인 실패:', error.message);
          return 'unknown';
        }
      }
      return 'unknown';
    };

    // 5. 위치 획득 시도
    const attemptGeolocation = () => {
      console.log('📍 위치 정보 요청 중...');
      
      const startTime = Date.now();
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log('✅ 위치 정보 획득 성공!');
          console.log(`📊 획득 시간: ${duration}ms`);
          console.log(`📍 좌표: ${position.coords.latitude}, ${position.coords.longitude}`);
          console.log(`🎯 정확도: ${position.coords.accuracy}m`);
          
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
            isDefault: false,
            source: 'gps',
            duration: duration
          });
        },
        (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.error('❌ 위치 정보 획득 실패');
          console.error(`🔢 에러 코드: ${error.code}`);
          console.error(`📝 에러 메시지: ${error.message}`);
          console.error(`⏱️ 시도 시간: ${duration}ms`);
          
          let errorMessage = '';
          let userAction = '';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 권한이 거부되었습니다';
              userAction = '브라우저 설정에서 위치 권한을 허용해주세요';
              console.log('💡 해결방법: 브라우저 주소창의 🔒 아이콘 → 위치 → 허용');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다';
              userAction = 'GPS나 네트워크 연결을 확인해주세요';
              console.log('💡 해결방법: GPS 활성화 또는 WiFi 연결 확인');
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다';
              userAction = '네트워크 상태를 확인하고 다시 시도해주세요';
              console.log('💡 해결방법: 인터넷 연결 상태 확인');
              break;
            default:
              errorMessage = '알 수 없는 오류가 발생했습니다';
              userAction = '브라우저를 새로고침하거나 재시작해주세요';
          }
          
          // 사용자에게 알림 표시 (옵션)
          if (defaultOptions.showAlert && error.code === error.PERMISSION_DENIED) {
            setTimeout(() => {
              alert(`위치 정보 오류: ${errorMessage}\n${userAction}\n\n서울 시청 위치로 대체합니다.`);
            }, 100);
          }
          
          resolve({
            ...DEFAULT_POSITION,
            source: 'error',
            error: {
              code: error.code,
              message: error.message,
              userMessage: errorMessage,
              userAction: userAction
            }
          });
        },
        defaultOptions
      );
    };

    // 6. 권한 확인 후 위치 획득 시도
    checkPermission().then((permissionState) => {
      if (permissionState === 'denied') {
        console.log('🏢 권한 거부로 인한 기본 좌표 사용');
        resolve({
          ...DEFAULT_POSITION,
          source: 'permission_denied',
          message: '위치 권한이 거부됨'
        });
        return;
      }
      
      attemptGeolocation();
    });
  });
};

/**
 * 고정밀 위치 획득 함수
 * @returns {Promise<Object>} 고정밀 위치 정보
 */
export const getHighAccuracyPosition = () => {
  return new Promise((resolve, reject) => {
    console.log('🎯 고정밀 위치 획득 시도');
    
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스 미지원'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ 고정밀 위치 획득 성공');
        console.log(`🎯 정확도: ${position.coords.accuracy}m`);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isDefault: false,
          source: 'high_accuracy_gps'
        });
      },
      (error) => {
        console.error('❌ 고정밀 위치 획득 실패:', error.message);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  });
};

/**
 * 위치 모니터링 시작
 * @param {Function} callback 위치 업데이트 콜백
 * @param {Function} errorCallback 오류 콜백
 * @returns {number|null} watch ID
 */
export const watchCurrentPosition = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('위치 서비스 미지원'));
    return null;
  }

  console.log('👀 위치 모니터링 시작');
  
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      console.log('📍 위치 업데이트:', position.coords.latitude, position.coords.longitude);
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        source: 'watch'
      });
    },
    (error) => {
      console.error('❌ 위치 모니터링 오류:', error.message);
      errorCallback(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000
    }
  );

  return watchId;
};

/**
 * 위치 모니터링 중지
 * @param {number} watchId watch ID
 */
export const stopWatchingPosition = (watchId) => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    console.log('⏹️ 위치 모니터링 중지');
  }
};

/**
 * 브라우저 위치 지원 상태 확인
 * @returns {Object} 지원 상태 정보
 */
export const checkGeolocationSupport = async () => {
  const result = {
    supported: 'geolocation' in navigator,
    secure: location.protocol === 'https:' || location.hostname === 'localhost',
    permission: 'unknown'
  };

  if (result.supported && 'permissions' in navigator) {
    try {
      const permission = await navigator.permissions.query({name: 'geolocation'});
      result.permission = permission.state;
    } catch (error) {
      console.warn('권한 상태 확인 실패:', error);
    }
  }

  return result;
};
