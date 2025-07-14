# 기상청 API 연동 가이드

## 1. API 키 발급 절차

### 1.1 공공데이터포털 회원가입
1. [공공데이터포털](https://www.data.go.kr) 접속
2. 회원가입 진행

### 1.2 기상청 API 신청
1. 공공데이터포털에서 "기상청_단기예보 조회서비스" 검색
2. [기상청_단기예보 조회서비스](https://www.data.go.kr/data/15084084/openapi.do) 페이지 이동
3. "활용신청" 버튼 클릭
4. 활용 목적: "날씨 정보 표시" 등으로 입력
5. 승인 대기 (보통 1일 소요)

### 1.3 API 키 확인
1. 승인 후 마이페이지 > 서비스별 신청현황 에서 키 확인
2. 인증키(Encoding) 또는 인증키(Decoding) 중 하나 선택

## 2. 프로젝트 설정

### 2.1 환경변수 설정
1. `frontend` 폴더에 `.env` 파일 생성
2. 다음 내용 추가:
```
REACT_APP_WEATHER_API_KEY=발급받은_API_키_입력
```

### 2.2 예시
```
REACT_APP_WEATHER_API_KEY=AbCdEf123456789%2BgHiJkLmNoPqRsTuVwXyZ%3D
```

## 3. 동작 방식

### 3.1 API 키가 설정된 경우
- 기상청 실시간 데이터 사용
- 30분마다 자동 업데이트
- 부산 지역 기준 (nx=98, ny=76)

### 3.2 API 키가 없는 경우
- 더미 데이터 사용 (22°C, 맑음)
- 개발/테스트 환경에서 사용 가능

## 4. API 제한사항

- **개발계정**: 일일 10,000회 호출
- **운영계정**: 활용사례 등록시 증가 신청 가능
- **발표 주기**: 
  - 초단기실황: 매시 30분 발표
  - 단기예보: 02,05,08,11,14,17,20,23시 발표

## 5. 문제 해결

### 5.1 API 호출 오류
- 브라우저 개발자 도구 > 콘솔에서 오류 확인
- API 키 형식이 올바른지 확인
- CORS 문제 시 백엔드 프록시 설정 고려

### 5.2 더미 데이터 표시
- API 키가 설정되지 않았거나
- API 호출이 실패한 경우
- 네트워크 연결 문제

## 6. 사용 함수

### 6.1 주요 함수들
- `getCurrentWeather()`: 현재 날씨 조회
- `getWeatherForecast()`: 최고/최저 기온 조회
- `getWeatherInfo()`: 통합 날씨 정보 조회

### 6.2 호출 예시
```javascript
import { getWeatherInfo } from '../utils/weatherAPI';

const weatherData = await getWeatherInfo(API_KEY);
console.log(weatherData);
// 출력: { temperature: '22°C', condition: '맑음', humidity: '65%', ... }
```

## 7. 지역 변경

현재는 부산 지역으로 고정되어 있습니다. 다른 지역을 사용하려면:

1. `weatherAPI.js` 파일의 `BUSAN_GRID` 수정
2. [기상청 격자 좌표 파일](https://www.data.go.kr/data/15084084/openapi.do) 다운로드
3. 원하는 지역의 nx, ny 좌표 확인 후 변경

```javascript
const SEOUL_GRID = {
  nx: 60,  // 서울 X 좌표
  ny: 127  // 서울 Y 좌표
};
```

## 8. 테스트 방법

1. 개발 서버 실행: `npm start`
2. 홈 화면에서 날씨 정보 섹션 확인
3. "새로고침" 버튼으로 수동 업데이트 테스트
4. 브라우저 개발자 도구에서 API 호출 로그 확인

---

**참고**: API 키 발급 전에도 더미 데이터로 UI 테스트가 가능하므로, 개발을 먼저 진행하고 나중에 API 키를 적용할 수 있습니다.
