// 카카오맵 SDK 동적 로딩 유틸리티

let isLoading = false;
let isLoaded = false;

export const loadKakaoMapScript = () => {
  return new Promise((resolve, reject) => {
    // 이미 로드되었거나 로딩 중이면 대기
    if (isLoaded && window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    if (isLoading) {
      // 로딩 중이면 완료될 때까지 대기
      const checkInterval = setInterval(() => {
        if (isLoaded && window.kakao && window.kakao.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    isLoading = true;

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.type = 'text/javascript';
    const JAVASCRIPT_KEY = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;
    
    if (!JAVASCRIPT_KEY || JAVASCRIPT_KEY === '여기에_JavaScript_키를_입력하세요') {
      console.error('카카오 JavaScript 키가 설정되지 않았습니다. .env 파일을 확인하세요.');
      reject(new Error('카카오 JavaScript 키가 설정되지 않았습니다.'));
      return;
    }
    
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JAVASCRIPT_KEY}&libraries=services&autoload=false`;
    
    script.onload = () => {
      console.log('카카오맵 스크립트 로드 완료');
      
      // kakao.maps.load를 호출하여 SDK 초기화
      if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
        window.kakao.maps.load(() => {
          console.log('카카오맵 SDK 초기화 완료');
          isLoaded = true;
          isLoading = false;
          resolve();
        });
      } else {
        console.error('카카오맵 SDK 구조가 예상과 다릅니다:', window.kakao);
        isLoading = false;
        reject(new Error('카카오맵 SDK 초기화 실패'));
      }
    };

    script.onerror = () => {
      console.error('카카오맵 스크립트 로드 실패');
      isLoading = false;
      reject(new Error('카카오맵 스크립트 로드 실패'));
    };

    // 스크립트를 head에 추가
    document.head.appendChild(script);
  });
};

// 카카오맵이 로드되었는지 확인
export const isKakaoMapLoaded = () => {
  return !!(window.kakao && window.kakao.maps && window.kakao.maps.LatLng);
};
