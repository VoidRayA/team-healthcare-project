# PowerShell 스크립트로 테스트

# 1. 로그인
$loginBody = @{
    loginId = "newuser2025"
    loginPw = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "로그인 성공!" -ForegroundColor Green
Write-Host "Access Token: $($loginResponse.accessToken.Substring(0, 20))..."
Write-Host "Refresh Token: $($loginResponse.refreshToken.Substring(0, 20))..."

$accessToken = $loginResponse.accessToken
$refreshToken = $loginResponse.refreshToken

# 2. 로그아웃
Write-Host "`n로그아웃 테스트..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $accessToken"
}

$logoutResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/logout" `
    -Method POST `
    -Headers $headers

Write-Host "로그아웃 결과: $($logoutResponse.message)" -ForegroundColor Green

# 3. 로그아웃 후 재발급 시도
Write-Host "`n비활성 토큰으로 재발급 시도..." -ForegroundColor Yellow
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/refresh" `
        -Method POST `
        -ContentType "application/json" `
        -Body $refreshBody
} catch {
    Write-Host "예상대로 실패: $($_.Exception.Message)" -ForegroundColor Red
}
