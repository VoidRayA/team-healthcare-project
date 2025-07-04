@echo off
echo ====================================
echo  Healthcare Project 전체 실행 스크립트
echo ====================================
echo.

echo [1/3] 백엔드 서버 시작 중... (포트 8080)
start "Backend Server" cmd /k "cd /d C:\jihyeon\team-healthcare-project-voidraya\backend && gradlew.bat bootRun"

echo [2/3] 잠깐 기다리는 중... (백엔드 초기화)
timeout /t 10

echo [3/3] 프론트엔드 서버 시작 중... (포트 3000) 
start "Frontend Server" cmd /k "cd /d C:\jihyeon\team-healthcare-project-voidraya\frontend && npm run dev"

echo.
echo ====================================
echo  모든 서버가 시작되었습니다!
echo  - 백엔드: http://localhost:8080
echo  - 프론트엔드: http://localhost:3000
echo  - 병원 API: http://localhost:8081/api/hospital/busan
echo ====================================
echo.
pause