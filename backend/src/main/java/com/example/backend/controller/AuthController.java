package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Role;
import com.example.backend.config.JwtTokenProvider;
import com.example.backend.dto.login.AuthResponseDto;
import com.example.backend.dto.login.AuthResponseDto;
import com.example.backend.dto.login.LoginRequestDto;
import com.example.backend.dto.login.RegisterRequestDto;
import com.example.backend.repository.GuardianRepository;
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
import java.util.HashMap;
import java.util.Map;

/**
 * 인증 관련 API를 처리하는 컨트롤러
 * 회원가입, 로그인, 토큰 검증 등의 기능을 담당
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
    public ResponseEntity<?> login(@RequestBody LoginRequestDto loginRequest) {
        try {
            // Spring Security 인증 처리
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getLoginId(),
                            loginRequest.getLoginPw()
                    )
            );

            // 인증 성공 시 JWT 토큰 생성
            String jwt = jwtTokenProvider.generateToken(loginRequest.getLoginId());

            // 사용자 정보 조회
            Guardians guardian = guardianRepository.findByLoginId(loginRequest.getLoginId())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            // 응답 DTO 생성
            AuthResponseDto response = AuthResponseDto.builder()
                    .accessToken(jwt)
                    .tokenType("Bearer")
                    .loginId(guardian.getLoginId())
                    .guardianName(guardian.getGuardianName())
                    .role(guardian.getRole().getKey())        // ✅ Role의 key 사용 (ROLE_GUARDIAN)
                    .build();

            log.info("로그인 성공: {}", loginRequest.getLoginId());
            return ResponseEntity.ok(response);

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
     * 로그아웃 API (클라이언트 측에서 토큰 삭제)
     * @return 로그아웃 결과
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // JWT는 stateless이므로 서버에서 별도 처리 불필요
        // 클라이언트에서 토큰을 삭제하면 됨
        return ResponseEntity.ok(Map.of("message", "로그아웃이 완료되었습니다."));
    }
}