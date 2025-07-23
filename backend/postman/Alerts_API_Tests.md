# Healthcare Project - Alerts API Postman 테스트

## 사전 준비
1. Postman에서 Environment 생성
2. 다음 변수들 설정:
   - `base_url`: http://localhost:8080
   - `jwt_token`: (로그인 후 받은 JWT 토큰)

---

## 1. 인증 (Authentication)

### Guardian 로그인
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "loginId": "your_guardian_login_id",
  "loginPw": "your_password"
}
```

**응답에서 `accessToken`을 복사해서 `jwt_token` 환경변수에 저장하세요**

---

## 2. 알림 관리 (Alerts Management)

### 2-1. 알림 생성 (POST)
```
POST {{base_url}}/api/guardian/alert
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "alertType": "WARNING",
  "title": "혈압 이상 감지",
  "description": "수축기 혈압이 정상 범위를 벗어났습니다.",
  "seniorId": 1,
  "relatedVitalId": 1
}
```

### 2-2. 모든 알림 조회 - 페이징 (GET)
```
GET {{base_url}}/api/guardian/alert?page=0&size=10
Authorization: Bearer {{jwt_token}}
```

### 2-3. 확인된 알림 조회 (GET)
```
GET {{base_url}}/api/guardian/alert/confirmed
Authorization: Bearer {{jwt_token}}
```

### 2-4. 미확인 알림 조회 (GET)
```
GET {{base_url}}/api/guardian/alert/unconfirmed
Authorization: Bearer {{jwt_token}}
```

### 2-5. 특정 시니어의 모든 알림 조회 - 페이징 (GET)
```
GET {{base_url}}/api/guardian/alert/seniors/1?page=0&size=10
Authorization: Bearer {{jwt_token}}
```

### 2-6. 특정 시니어의 미확인 알림 조회 (GET)
```
GET {{base_url}}/api/guardian/alert/seniors/1/unconfirmed
Authorization: Bearer {{jwt_token}}
```

### 2-7. 특정 시니어의 확인된 알림 조회 (GET)
```
GET {{base_url}}/api/guardian/alert/seniors/1/confirmed
Authorization: Bearer {{jwt_token}}
```

### 2-8. 알림 삭제 (DELETE)
```
DELETE {{base_url}}/api/guardian/alert/1
Authorization: Bearer {{jwt_token}}
```

---

## 3. 생체신호 생성 (알림 자동 생성 테스트용)

### 3-1. 이상 생체신호 생성 - 자동 알림 생성 (POST)
```
POST {{base_url}}/api/seniors/1/vitalSign
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "measurementTime": "2025-07-14T15:30:00",
  "bloodPressureHigh": 180,
  "bloodPressureLow": 95,
  "heartRate": 100,
  "bloodSugar": 250,
  "bodyTemperature": 38.5,
  "notes": "이상 수치 테스트 - 자동 알림 생성 예상"
}
```

### 3-2. 정상 생체신호 생성 - 알림 생성 안됨 (POST)
```
POST {{base_url}}/api/seniors/1/vitalSign
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "measurementTime": "2025-07-14T16:00:00",
  "bloodPressureHigh": 120,
  "bloodPressureLow": 80,
  "heartRate": 70,
  "bloodSugar": 100,
  "bodyTemperature": 36.5,
  "notes": "정상 수치 테스트 - 알림 생성 안됨"
}
```

### 3-3. 생체신호 목록 조회 (GET)
```
GET {{base_url}}/api/seniors/1/vitalSign
Authorization: Bearer {{jwt_token}}
```

---

## 4. 테스트 시나리오

### 시나리오 1: 알림 자동 생성 테스트
1. **3-1번** 실행 (이상 생체신호 생성)
2. **2-4번** 실행 (미확인 알림 조회) → 새 알림 확인
3. **2-2번** 실행 (모든 알림 조회) → 알림 목록 확인

### 시나리오 2: 수동 알림 생성 테스트
1. **2-1번** 실행 (알림 수동 생성)
2. **2-4번** 실행 (미확인 알림 조회) → 생성된 알림 확인

### 시나리오 3: 특정 시니어 알림 조회
1. **2-5번** 실행 (특정 시니어 모든 알림)
2. **2-6번** 실행 (특정 시니어 미확인 알림)
3. **2-7번** 실행 (특정 시니어 확인된 알림)

### 시나리오 4: 알림 삭제 테스트
1. **2-2번** 실행 (알림 목록에서 ID 확인)
2. **2-8번** 실행 (해당 ID로 알림 삭제)
3. **2-2번** 재실행 (삭제 확인)

---

## 5. 예상 응답 형태

### 알림 생성 성공 응답:
```json
{
  "alertType": "WARNING",
  "title": "혈압 이상 감지",
  "description": "수축기 혈압이 정상 범위를 벗어났습니다.",
  "seniorId": 1,
  "relatedVitalId": 1
}
```

### 알림 목록 조회 응답:
```json
{
  "alerts": [
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
  ],
  "currentPage": 0,
  "totalPages": 1,
  "totalElements": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

## 주의사항
1. **JWT 토큰**은 로그인 후 받은 `accessToken`을 사용
2. **seniorId, vitalSignId**는 실제 존재하는 ID로 변경
3. **alertId**는 삭제 시 실제 존재하는 알림 ID 사용
4. 모든 요청에 **Authorization 헤더** 필수