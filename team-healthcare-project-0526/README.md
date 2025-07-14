# team-healthcare-project
team-healthcare-project

## API 키 설정

### 1. 카카오 API 키
- [Kakao Developers](https://developers.kakao.com/)에서 발급
- 앱 등록 후 JavaScript 키와 REST API 키를 발급받으세요

### 2. T-map API 키 (도보 경로 서비스)
- [T-ID 개발자센터](https://developers.t-id.co.kr/)에서 발급
- 회원가입 후 T-map API > 도보경로안내 서비스 신청
- API 키를 발급받은 후 백엔드 `application.properties`에 설정

### 3. OpenWeather API 키
- [OpenWeatherMap](https://openweathermap.org/api)에서 발급

## 경로 표시 기능 (백엔드 프록시 방식)

### 아키텍처 구조:
```
프론트엔드 (React) → 백엔드 (Spring Boot) → 외부 API (T-map/카카오)
```

**CORS 문제 해결**: 브라우저에서 직접 외부 API 호출 시 CORS 오류가 발생하므로, 백엔드를 통한 프록시 방식으로 해결

### 경로 표시 우선순위:

1. **T-map API** (최우선) - 가장 정밀한 도보 경로 (SK 텔레콤)
2. **카카오 Directions API** - 대체 도보 경로 서비스
3. **직선 거리** - 모든 API 실패 시 폴백

### 경로 색상 구분:
- **T-map**: 핑크색 (#FF4081) 실선
- **카카오**: 초록색 (#4CAF50) 실선
- **직선**: 주황색 (#FF9800) 점선

### 백엔드 API 엔드포인트:

1. **T-map 도보 경로**:
   ```
   GET /api/hospital/route/tmap
   매개변수: startLat, startLon, endLat, endLon, startName, endName
   ```

2. **카카오 도보 경로**:
   ```
   GET /api/hospital/route/kakao
   매개변수: startLat, startLon, endLat, endLon
   ```

## 백엔드 설정

`backend/src/main/resources/application.properties`에 다음 키들을 설정:

```properties
# 카카오 API 키
kakao.rest-api-key=여기에_카카오_REST_API_키_입력

# T-map API 키  
tmap.api-key=여기에_T-map_API_키_입력
```

## 실행 방법

### 1. 백엔드 시작
```bash
cd backend
./gradlew bootRun
# 또는
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

### 2. 프론트엔드 시작
```bash
cd frontend
npm install
npm run dev
```

## 테스트 방법

1. 백엔드와 프론트엔드 두 서버 모두 실행
2. 병원 검색 후 지도 모달 열기
3. "경로 표시" 버튼 클릭
4. 개발자 도구(`F12`) Console 탭에서 로그 확인:
   - T-map API 성공: 핑크색 실선 경로
   - 카카오 API 폴백: 초록색 실선 경로
   - 직선 폴백: 주황색 점선 경로
