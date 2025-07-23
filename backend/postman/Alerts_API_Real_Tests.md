# Healthcare Project - Alerts API 실제 테스트
# 팀원이 만든 AlertsController와 AlertsDto 분석 기반

## 🚨 발견된 문제점
1. @PathVariable("id") vs seniorId 매핑 오류 
2. 일부 엔드포인트에서 경로 변수 매핑이 잘못됨

---

## 1. 인증 (먼저 실행 필수)

### Guardian 로그인
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "loginId": "guardian_login_id",
  "loginPw": "password"
}
```
> 응답에서 `accessToken`을 복사해서 아래 요청들의 Bearer 토큰으로 사용

---

## 2. 알림 수동 생성 (POST)
```
POST http://localhost:8080/api/guardian/alert
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "혈압 이상 감지",
  "description": "수축기 혈압이 정상 범위를 벗어났습니다.",
  "relatedVitalId": 1
}
```
> alertType과 seniorId는 자동으로 생성됨

---

## 3. 알림 조회 API들

### 3-1. 가디언의 모든 알림 조회 (페이징)
```
GET http://localhost:8080/api/guardian/alert?page=0&size=10
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3-2. 가디언의 확인된 알림 조회
```
GET http://localhost:8080/api/guardian/alert/confirmed
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3-3. 가디언의 미확인 알림 조회
```
GET http://localhost:8080/api/guardian/alert/unconfirmed
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 4. 특정 시니어 관련 알림 조회

### ⚠️ 주의: @PathVariable 매핑 오류로 인해 다음 API들이 작동하지 않을 수 있음

### 4-1. 특정 시니어의 모든 알림 조회 (페이징) - 🚨 오류 가능성
```
GET http://localhost:8080/api/guardian/alert/seniors/1?page=0&size=10
Authorization: Bearer YOUR_JWT_TOKEN
```
> @PathVariable("id")가 seniorId 파라미터와 매핑되지 않음

### 4-2. 특정 시니어의 미확인 알림 조회 - 🚨 오류 가능성
```
GET http://localhost:8080/api/guardian/alert/seniors/1/unconfirmed
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4-3. 특정 시니어의 확인된 알림 조회 - 🚨 오류 가능성
```
GET http://localhost:8080/api/guardian/alert/seniors/1/confirmed
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 5. 알림 삭제
```
DELETE http://localhost:8080/api/guardian/alert/1
Authorization: Bearer YOUR_JWT_TOKEN
```
> 1을 실제 알림 ID로 변경

---

## 6. 생체신호 생성 (자동 알림 생성 테스트용)

### 6-1. 이상 생체신호 생성 - 자동 알림 생성됨
```
POST http://localhost:8080/api/seniors/1/vitalSign
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "measurementTime": "2025-07-14T15:30:00",
  "bloodPressureHigh": 180,
  "bloodPressureLow": 95,
  "heartRate": 100,
  "bloodSugar": 250,
  "bodyTemperature": 38.5,
  "notes": "이상 수치 - 자동 알림 생성 테스트"
}
```

### 6-2. 정상 생체신호 생성 - 알림 생성 안됨
```
POST http://localhost:8080/api/seniors/1/vitalSign
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "measurementTime": "2025-07-14T16:00:00",
  "bloodPressureHigh": 120,
  "bloodPressureLow": 80,
  "heartRate": 70,
  "bloodSugar": 100,
  "bodyTemperature": 36.5,
  "notes": "정상 수치 - 알림 생성 안됨"
}
```

---

## 📋 예상 응답 형태

### AlertsCreateDto 응답:
```json
{
  "alertType": "WARNING",
  "title": "혈압 이상 감지",
  "description": "수축기 혈압이 정상 범위를 벗어났습니다.",
  "seniorId": 1,
  "relatedVitalId": 1
}
```

### AlertsPageDto 응답:
```json
{
  "alerts": [
    {
      "id": 1,
      "alertType": "WARNING",
      "title": "혈압 이상 감지",
      "description": "...",
      "vitalSigns": {
        "id": 1,
        "bloodPressureHigh": 180,
        "bloodPressureLow": 95,
        "heartRate": 100,
        "measurementTime": "2025-07-14T15:30:00"
      },
      "createdAt": "2025-07-14T15:30:00",
      "isConfirmed": false,
      "confirmedByName": null,
      "confirmedAt": null
    }
  ],
  "currentPage": 0,
  "totalPages": 1,
  "totalElements": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

### AlertsSearchDto 리스트 응답:
```json
[
  {
    "id": 1,
    "alertType": "WARNING",
    "title": "혈압 이상 감지",
    "description": "...",
    "vitalSigns": {...},
    "createdAt": "2025-07-14T15:30:00",
    "isConfirmed": false,
    "confirmedByName": null,
    "confirmedAt": null
  }
]
```

---

## 🔧 발견된 버그 수정 필요

### AlertsController.java 수정 필요:
```java
// 현재 (오류):
@GetMapping("/seniors/{seniorId}")
public ResponseEntity<?> getAlerts(
    @PathVariable("id") Integer seniorId,  // 🚨 "id"와 seniorId 불일치
    
// 수정 후:
@GetMapping("/seniors/{seniorId}")
public ResponseEntity<?> getAlerts(
    @PathVariable("seniorId") Integer seniorId,  // ✅ 일치
```

이 오류는 모든 seniors/{seniorId} 관련 엔드포인트에서 발생합니다.