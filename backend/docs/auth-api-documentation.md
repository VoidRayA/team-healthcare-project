# 인증 API 문서

## 목차
1. [회원가입](#회원가입)
2. [로그인](#로그인)
3. [토큰 재발급](#토큰-재발급)
4. [토큰 검증](#토큰-검증)
5. [로그아웃](#로그아웃)

---

## 회원가입
새로운 보호자 계정을 생성합니다.

### Endpoint
```
POST /api/auth/register
```

### Request Body
```json
{
  "loginId": "string",
  "loginPw": "string",
  "guardianName": "string",
  "phone": "string",
  "email": "string",
  "relationship": "string"
}
```

### Response
**성공 (201 Created)**
```json
{
  "message": "회원가입이 성공적으로 완료되었습니다.",
  "userId": 1,
  "loginId": "test123"
}
```

**실패 (400 Bad Request)**
```json
{
  "error": "이미 존재하는 로그인 ID입니다."
}
```

---

## 로그인
보호자 계정으로 로그인합니다.

### Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "loginId": "string",
  "loginPw": "string"
}
```

### Response
**성공 (200 OK)**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "loginId": "test123",
  "guardianName": "홍길동",
  "role": "ROLE_GUARDIAN",
  "senior": [
    {
      "id": 1,
      "guardianName": "홍길동",
      "seniorName": "홍할머니",
      "birthDate": "1945-01-01",
      "gender": "FEMALE",
      "address": "서울시 강남구",
      "emergencyContact": "010-1234-5678",
      "chronicDiseases": "고혈압, 당뇨",
      "medications": "혈압약",
      "notes": "특이사항 없음",
      "phone": "010-8765-4321",
      "isActive": true
    }
  ]
}
```

**실패 (401 Unauthorized)**
```json
{
  "error": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

---

## 토큰 재발급
Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.

### Endpoint
```
POST /api/auth/refresh
```

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

### Response
**성공 (200 OK)**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "loginId": "test123",
  "guardianName": "홍길동",
  "role": "ROLE_GUARDIAN",
  "senior": [...]
}
```

**실패 (401 Unauthorized)**
```json
{
  "error": "유효하지 않은 리프레시 토큰입니다."
}
```

---

## 토큰 검증
JWT 토큰의 유효성을 검증합니다.

### Endpoint
```
POST /api/auth/validate?token={JWT_TOKEN}
```

### Response
**유효한 토큰**
```json
{
  "valid": true,
  "loginId": "test123"
}
```

**유효하지 않은 토큰**
```json
{
  "valid": false
}
```

---

## 로그아웃
현재 사용자를 로그아웃하고 모든 Refresh Token을 삭제합니다.

### Endpoint
```
POST /api/auth/logout
```

### Headers
```
Authorization: Bearer {ACCESS_TOKEN}
```

### Response
**성공 (200 OK)**
```json
{
  "message": "로그아웃이 완료되었습니다.",
  "success": true
}
```

---

## 토큰 사용 가이드

### Access Token
- 용도: API 요청 시 인증용
- 만료 시간: 24시간 (기본값)
- 사용 방법: `Authorization: Bearer {ACCESS_TOKEN}` 헤더에 포함

### Refresh Token
- 용도: Access Token 재발급용
- 만료 시간: 7일
- 저장 위치: 안전한 저장소 (예: HttpOnly Cookie, Secure Storage)
- 주의사항: Refresh Token은 탈취되면 위험하므로 안전하게 관리해야 함

### 토큰 갱신 플로우
1. Access Token으로 API 요청
2. 401 Unauthorized 응답 받음 (토큰 만료)
3. Refresh Token으로 `/api/auth/refresh` 호출
4. 새로운 Access Token 받음
5. 새로운 Access Token으로 원래 요청 재시도

### 보안 권장사항
1. Refresh Token은 HttpOnly Cookie에 저장 권장
2. HTTPS 환경에서만 사용
3. 로그아웃 시 반드시 `/api/auth/logout` 호출하여 서버측 토큰 삭제
4. 의심스러운 활동 감지 시 모든 토큰 무효화
