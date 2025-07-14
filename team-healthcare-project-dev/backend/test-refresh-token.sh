#!/bin/bash
# Refresh Token 관리 기능 통합 테스트 스크립트

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 기본 URL
BASE_URL="http://localhost:8080/api"

echo "======================================"
echo "Refresh Token 관리 기능 통합 테스트"
echo "======================================"

# 1. 회원가입
echo -e "\n${GREEN}1. 회원가입 테스트${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "testuser'$(date +%s)'",
    "loginPw": "password123",
    "guardianName": "테스트유저",
    "phone": "010-1234-5678",
    "email": "test'$(date +%s)'@example.com",
    "relationship": "son"
  }')

echo "회원가입 응답: $REGISTER_RESPONSE"
LOGIN_ID=$(echo $REGISTER_RESPONSE | jq -r '.loginId')

# 2. 로그인
echo -e "\n${GREEN}2. 로그인 테스트${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "'$LOGIN_ID'",
    "loginPw": "password123"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:20}..."

# 3. 토큰 재발급 테스트
echo -e "\n${GREEN}3. 토큰 재발급 테스트${NC}"
sleep 2
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }')

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
echo "새로운 Access Token: ${NEW_ACCESS_TOKEN:0:20}..."

# 4. 로그아웃 테스트
echo -e "\n${GREEN}4. 로그아웃 테스트${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "로그아웃 응답: $LOGOUT_RESPONSE"

# 5. 로그아웃 후 재발급 시도 (실패해야 함)
echo -e "\n${GREEN}5. 로그아웃 후 재발급 시도 (실패 예상)${NC}"
FAILED_REFRESH=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "'$REFRESH_TOKEN'"
  }')

echo "재발급 시도 결과: $FAILED_REFRESH"

# 6. 다시 로그인
echo -e "\n${GREEN}6. 다시 로그인${NC}"
LOGIN_RESPONSE2=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "'$LOGIN_ID'",
    "loginPw": "password123"
  }')

ACCESS_TOKEN2=$(echo $LOGIN_RESPONSE2 | jq -r '.accessToken')
REFRESH_TOKEN2=$(echo $LOGIN_RESPONSE2 | jq -r '.refreshToken')

# 7. 비밀번호 변경
echo -e "\n${GREEN}7. 비밀번호 변경 테스트${NC}"
PASSWORD_CHANGE=$(curl -s -X PUT "$BASE_URL/guardians/me/password" \
  -H "Authorization: Bearer $ACCESS_TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newPassword456"
  }')

echo "비밀번호 변경 결과: $PASSWORD_CHANGE"

# 8. 기존 토큰으로 접근 시도 (실패해야 함)
echo -e "\n${GREEN}8. 비밀번호 변경 후 기존 토큰 사용 (실패 예상)${NC}"
FAILED_ACCESS=$(curl -s -X GET "$BASE_URL/guardians/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN2")

echo "기존 토큰 사용 결과: $FAILED_ACCESS"

echo -e "\n${GREEN}테스트 완료!${NC}"
