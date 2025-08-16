package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.RefreshToken;
import com.example.backend.DB.Role;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.UserSetting;
import com.example.backend.config.JwtTokenProvider;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.login.AuthResponseDto;
import com.example.backend.dto.login.LoginRequestDto;
import com.example.backend.dto.login.RegisterRequestDto;
import com.example.backend.repository.GuardianRepository;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.service.UserSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;

/**
 * AuthController.java - 인증 관리 API 컨트롤러 
 * 
 * 🔐 주요 기능:
 * - JWT 기반 이중 토큰 인증 (액세스 + 리프레시)
 * - 회원가입시 기본 바이탈 설정 자동 생성
 * - IP 추적 및 디바이스 정보 로깅 (보안 강화)
 * - 토큰 재발급 및 전체 로그아웃 기능
 * 
 * 🔒 보안 체계:
 * - createDefaultVitalSettings(): 신규 가입자 기본 임계값 설정
 * - getClientIpAddress(): 프록시 고려한 정확한 IP 주소 추출
 * - RefreshToken 생명주기 관리 (만료, 비활성화, 삭제)
 * - 다중 디바이스 로그인 지원 및 전체 로그아웃
 * 
 * 📊 API 엔드포인트:
 * - POST /api/auth/register: 회원가입 + 기본 설정 생성
 * - POST /api/auth/login: 로그인 + JWT 발급 + 사용자 정보
 * - POST /api/auth/refresh: 리프레시 토큰으로 액세스 토큰 갱신
 * - POST /api/auth/logout: 모든 활성 리프레시 토큰 비활성화
 * - POST /api/auth/validate: JWT 토큰 유효성 검증
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final GuardianRepository guardianRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserSettingService userSettingService;

    /**
     * 생년월일로부터 만 나이 계산
     */
    private static Integer calculateAge(java.time.LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        
        java.time.LocalDate today = java.time.LocalDate.now();
        int age = today.getYear() - birthDate.getYear();
        
        // 아직 생일이 지나지 않았다면 나이 1 감소
        if (today.getMonthValue() < birthDate.getMonthValue() || 
            (today.getMonthValue() == birthDate.getMonthValue() && today.getDayOfMonth() < birthDate.getDayOfMonth())) {
            age--;
        }
        
        return age >= 0 ? age : null; // 음수 나이는 null 반환
    }

    /**
     * 회원가입 API
     * @param registerRequest 회원가입 요청 데이터
     * @return 회원가입 결과
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto registerRequest) {
        try {
            // 이미 존재하는 로그인 ID 확인
            if (guardianRepository.findByLoginId(registerRequest.getLoginId()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "이미 존재하는 로그인 ID입니다."));
            }

            // 이미 존재하는 이메일 확인
            if (guardianRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "이미 사용 중인 이메일입니다."));
            }

            // 새 사용자 엔티티 생성
            Guardians newGuardian = Guardians.builder()
                    .loginId(registerRequest.getLoginId())
                    .loginPw(passwordEncoder.encode(registerRequest.getLoginPw())) // 비밀번호 암호화
                    .guardianName(registerRequest.getGuardianName())
                    .phone(registerRequest.getPhone())
                    .email(registerRequest.getEmail())
                    .relationship(registerRequest.getRelationship())
                    .role(Role.GUARDIAN) // ✅ 기존 Role enum 사용
                    .isActive(true) // 기본값: 활성 상태
                    .registeredAt(LocalDateTime.now())
                    .build();

            // 데이터베이스에 저장
            Guardians savedGuardian = guardianRepository.save(newGuardian);
            
            // 신규 Guardian에 대한 기본 바이탈 사인 설정 생성
            createDefaultVitalSettings(savedGuardian.getId());
            log.info("기본 바이탈 사인 설정 생성 완료: {}", savedGuardian.getLoginId());

            // 응답 데이터 준비
            Map<String, Object> response = new HashMap<>();
            response.put("message", "회원가입이 성공적으로 완료되었습니다.");
            response.put("userId", savedGuardian.getId());
            response.put("loginId", savedGuardian.getLoginId());

            log.info("새 사용자 등록 완료: {}", savedGuardian.getLoginId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("회원가입 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "회원가입 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 로그인 API
     * @param loginRequest 로그인 요청 데이터
     * @return JWT 토큰이 포함된 로그인 결과
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest, HttpServletRequest request) {
        try {
            // Spring Security 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getLoginId(),
                            loginRequest.getLoginPw()
                    )
            );

            // 사용자 정보 조회
            Guardians guardian = guardianRepository.findByLoginId(loginRequest.getLoginId())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            // 인증 성공 시 JWT 토큰 생성
            String jwt = jwtTokenProvider.generateToken(loginRequest.getLoginId(), guardian.getId());

            // 리프레시 토큰 생성 및 저장
            try {
                String refreshToken = jwtTokenProvider.generateRefreshToken(loginRequest.getLoginId(), guardian.getId());
                log.info("리프레시 토큰 생성 완료: {}", refreshToken.substring(0, 20) + "...");
                
                // 기존 리프레시 토큰 삭제 (중복 방지)
                refreshTokenRepository.deleteByGuardianId(guardian.getId());
                log.info("기존 리프레시 토큰 삭제 완료");
                
                // 클라이언트 정보 추출
                String ipAddress = getClientIpAddress(request);
                String deviceInfo = request.getHeader("User-Agent");
                
                // 새 리프레시 토큰 저장
                RefreshToken refreshTokenEntity = RefreshToken.builder()
                        .guardianId(guardian.getId())
                        .tokenId(refreshToken)  // token -> tokenId로 변경
                        .tokenValue(refreshToken)
                        .deviceInfo(deviceInfo != null ? deviceInfo.substring(0, Math.min(deviceInfo.length(), 255)) : "Unknown")
                        .ipAddress(ipAddress)
                        .issuedAt(LocalDateTime.now())
                        .expiresAt(LocalDateTime.now().plusDays(7)) // 7일 후 만료
                        .isActive(true)
                        .build();
                
                RefreshToken savedToken = refreshTokenRepository.save(refreshTokenEntity);
                log.info("리프레시 토큰 저장 완료 - ID: {}, 사용자: {}", savedToken.getId(), loginRequest.getLoginId());
                
                // senior 정보도 같이 조회
                List<SeniorDto.SeniorResponseDto> seniorDto = new ArrayList<>();
                List<Seniors> seniors = guardian.getSeniors();
                if (seniors != null && !seniors.isEmpty()) {
                    seniorDto = seniors.stream()
                            .map(seniors1 -> SeniorDto.SeniorResponseDto.builder()
                                    .id(seniors1.getId())
                                    .guardianName(seniors1.getGuardian().getGuardianName())
                                    .seniorName(seniors1.getSeniorName())
                                    .birthDate(seniors1.getBirthDate())
                                    .age(calculateAge(seniors1.getBirthDate()))  // 나이 필드 추가
                                    .gender(seniors1.getGender())
                                    .address(seniors1.getAddress())
                                    .emergencyContact(seniors1.getEmergencyContact())
                                    .chronicDiseases(seniors1.getChronicDiseases())
                                    .medications(seniors1.getMedications())
                                    .notes(seniors1.getNotes())
                                    .phoneNumber(seniors1.getPhone())  // phone -> phoneNumber로 변경
                                    .isActive(seniors1.getIsActive())
                                    .build())
                            .collect(Collectors.toList());
                }

                // 응답 DTO 생성 (리프레시 토큰 포함)
                AuthResponseDto response = AuthResponseDto.builder()
                        .accessToken(jwt)
                        .refreshToken(refreshToken) // 리프레시 토큰 추가
                        .tokenType("Bearer")
                        .loginId(guardian.getLoginId())
                        .guardianName(guardian.getGuardianName())
                        .role(guardian.getRole().getKey())        // ✅ Role의 key 사용 (ROLE_GUARDIAN)
                        .senior(seniorDto)  // nullable로 들어감
                        .build();

                log.info("로그인 성공: {}", loginRequest.getLoginId());
                return ResponseEntity.ok(response);
                
            } catch (Exception refreshTokenError) {
                log.error("리프레시 토큰 처리 중 오류 발생", refreshTokenError);
                // 리프레시 토큰 오류가 있어도 액세스 토큰은 발급
                AuthResponseDto response = AuthResponseDto.builder()
                        .accessToken(jwt)
                        .tokenType("Bearer")
                        .loginId(guardian.getLoginId())
                        .guardianName(guardian.getGuardianName())
                        .role(guardian.getRole().getKey())
                        .build();
                return ResponseEntity.ok(response);
            }

        } catch (AuthenticationException e) {
            log.warn("로그인 실패: {} - {}", loginRequest.getLoginId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            log.error("로그인 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "로그인 처리 중 오류가 발생했습니다."));
        }
    }

    /**
     * 토큰 유효성 검증 API
     * @param token 검증할 JWT 토큰
     * @return 토큰 유효성 검증 결과
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        try {
            boolean isValid = jwtTokenProvider.validateToken(token);

            if (isValid) {
                String loginId = jwtTokenProvider.getLoginIdFromToken(token);
                return ResponseEntity.ok(Map.of(
                        "valid", true,
                        "loginId", loginId
                ));
            } else {
                return ResponseEntity.ok(Map.of("valid", false));
            }
        } catch (Exception e) {
            log.error("토큰 검증 중 오류 발생", e);
            return ResponseEntity.ok(Map.of("valid", false));
        }
    }

    /**
     * Refresh Token을 사용한 Access Token 재발급 API
     * @param refreshTokenRequest 리프레시 토큰이 포함된 요청
     * @return 새로운 Access Token
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshAccessToken(@RequestBody Map<String, String> refreshTokenRequest) {
        try {
            String refreshToken = refreshTokenRequest.get("refreshToken");
            
            if (refreshToken == null || refreshToken.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "리프레시 토큰이 제공되지 않았습니다."));
            }
            
            // 리프레시 토큰 유효성 검증
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "유효하지 않은 리프레시 토큰입니다."));
            }
            
            // 리프레시 토큰이 DB에 존재하고 활성 상태인지 확인
            RefreshToken storedToken = refreshTokenRepository
                    .findByTokenIdAndIsActiveTrue(refreshToken)
                    .orElse(null);
            
            if (storedToken == null) {
                log.warn("유효하지 않은 리프레시 토큰 사용 시도: {}", 
                        refreshToken != null ? refreshToken.substring(0, Math.min(20, refreshToken.length())) + "..." : "null");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "리프레시 토큰이 존재하지 않거나 비활성 상태입니다."));
            }
            
            // 리프레시 토큰 만료 시간 확인
            if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                // 만료된 토큰은 삭제
                refreshTokenRepository.delete(storedToken);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "리프레시 토큰이 만료되었습니다."));
            }
            
            // 리프레시 토큰에서 사용자 정보 추출
            String loginId = jwtTokenProvider.getLoginIdFromToken(refreshToken);
            
            // 사용자 정보 조회
            Guardians guardian = guardianRepository.findByLoginId(loginId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            
            // 새로운 Access Token 생성
            String newAccessToken = jwtTokenProvider.generateToken(loginId, guardian.getId());
            
            // 리프레시 토큰 사용 시간 업데이트
            storedToken.setLastUsedAt(LocalDateTime.now());
            refreshTokenRepository.save(storedToken);
            
            // senior 정보도 같이 조회
            List<SeniorDto.SeniorResponseDto> seniorDto = new ArrayList<>();
            List<Seniors> seniors = guardian.getSeniors();
            if (seniors != null && !seniors.isEmpty()) {
                seniorDto = seniors.stream()
                        .map(senior -> SeniorDto.SeniorResponseDto.builder()
                                .id(senior.getId())
                                .guardianName(senior.getGuardian().getGuardianName())
                                .seniorName(senior.getSeniorName())
                                .birthDate(senior.getBirthDate())
                                .age(calculateAge(senior.getBirthDate()))  // 나이 필드 추가
                                .gender(senior.getGender())
                                .address(senior.getAddress())
                                .emergencyContact(senior.getEmergencyContact())
                                .chronicDiseases(senior.getChronicDiseases())
                                .medications(senior.getMedications())
                                .notes(senior.getNotes())
                                .phoneNumber(senior.getPhone())  // phone -> phoneNumber로 변경
                                .isActive(senior.getIsActive())
                                .build())
                        .collect(Collectors.toList());
            }
            
            // 응답 생성
            AuthResponseDto response = AuthResponseDto.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken) // 기존 리프레시 토큰 유지
                    .tokenType("Bearer")
                    .loginId(guardian.getLoginId())
                    .guardianName(guardian.getGuardianName())
                    .role(guardian.getRole().getKey())
                    .senior(seniorDto)
                    .build();
            
            log.info("Access Token 재발급 성공 - 사용자: {}", loginId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("토큰 재발급 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "토큰 재발급 중 오류가 발생했습니다."));
        }
    }

    /**
     * 로그아웃 API - 리프레시 토큰 삭제
     * @param authHeader Authorization 헤더
     * @return 로그아웃 결과
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Authorization 헤더가 없으면 단순 성공 반환
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("로그아웃 요청에 Authorization 헤더가 없습니다.");
                return ResponseEntity.ok(Map.of("message", "로그아웃이 완료되었습니다."));
            }
            
            // Bearer 토큰에서 실제 토큰 추출
            String token = authHeader.replace("Bearer ", "");
            
            // 토큰에서 사용자 정보 추출
            String loginId = jwtTokenProvider.getLoginIdFromToken(token);
            
            // 사용자 조회
            Guardians guardian = guardianRepository.findByLoginId(loginId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            
            // 해당 사용자의 모든 활성 리프레시 토큰 비활성화
            List<RefreshToken> activeTokens = refreshTokenRepository
                    .findByGuardianIdAndIsActiveTrue(guardian.getId());
            
            activeTokens.forEach(refreshToken -> refreshToken.revoke("USER_LOGOUT"));
            refreshTokenRepository.saveAll(activeTokens);
            
            log.info("로그아웃 완료 - 사용자: {}, 비활성화된 토큰 수: {}", 
                    loginId, activeTokens.size());
            return ResponseEntity.ok(Map.of(
                "message", "로그아웃이 완료되었습니다.",
                "success", true
            ));
            
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생", e);
            // 에러가 발생해도 클라이언트 측에서는 로그아웃 처리하도록 성공 반환
            return ResponseEntity.ok(Map.of(
                "message", "로그아웃이 완료되었습니다.",
                "success", true
            ));
        }
    }
    
    /**
     * 클라이언트 IP 주소 추출
     * 프록시 서버를 통해 접속하는 경우도 고려
     * @param request HTTP 요청
     * @return 클라이언트 IP 주소
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "X-Real-IP"
        };
        
        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // 콤마로 구분된 첫 번째 IP 주소 반환
                return ip.split(",")[0].trim();
            }
        }
        
        // 헤더에서 IP를 찾지 못한 경우 기본 메서드 사용
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "Unknown";
    }
    
    /**
     * 신규 Guardian에 대한 기본 바이탈 사인 설정 생성
     * @param guardianId Guardian ID
     */
    private void createDefaultVitalSettings(Integer guardianId) {
        try {
            LocalDateTime now = LocalDateTime.now();
            
            // 혈압 기본 설정
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodPressureAttentionMin", "90", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodPressureAttentionMax", "180", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodPressureCautionMin", "100", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodPressureCautionMax", "140", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "diastolicAttentionMin", "60", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "diastolicAttentionMax", "110", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "diastolicCautionMin", "65", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "diastolicCautionMax", "90", now));
            
            // 심박수 기본 설정
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "heartRateAttentionMin", "50", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "heartRateAttentionMax", "100", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "heartRateCautionMin", "60", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "heartRateCautionMax", "90", now));
            
            // 체온 기본 설정
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bodyTemperatureAttentionMin", "35.5", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bodyTemperatureAttentionMax", "38.0", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bodyTemperatureCautionMin", "36.0", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bodyTemperatureCautionMax", "37.5", now));
            
            // 혈당 기본 설정
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodSugarAttentionMin", "70", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodSugarAttentionMax", "250", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodSugarCautionMin", "80", now));
            userSettingService.saveSetting(createUserSetting(guardianId, "설정", "bloodSugarCautionMax", "180", now));
            
            log.info("기본 바이탈 사인 설정 생성 완료 - Guardian ID: {}", guardianId);
            
        } catch (Exception e) {
            log.error("기본 바이탈 사인 설정 생성 실패 - Guardian ID: {}", guardianId, e);
        }
    }
    
    /**
     * UserSetting 엔티티 생성 헬퍼 메서드
     */
    private UserSetting createUserSetting(Integer guardianId, String category, String subCategory, String values, LocalDateTime now) {
        UserSetting setting = new UserSetting();
        setting.setGuardianId(guardianId.longValue());
        setting.setCategory(category);
        setting.setSubCategory(subCategory);
        setting.setValues(values);
        setting.setCreatedAt(now);
        setting.setUpdatedAt(now);
        return setting;
    }
}