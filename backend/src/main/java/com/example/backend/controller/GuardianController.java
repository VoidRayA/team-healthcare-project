package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.login.GuardianDto;
import com.example.backend.repository.GuardianRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 보호자(Guardian) 관련 API를 처리하는 컨트롤러
 * JWT 인증이 필요한 보호된 엔드포인트들을 포함
 */
@Slf4j
@RestController
@RequestMapping("/api/guardians")
@RequiredArgsConstructor
public class GuardianController {

    private final GuardianRepository guardianRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 현재 인증된 사용자의 정보 조회
     * @param currentUser 현재 인증된 사용자 정보
     * @return 사용자 정보
     */
    @GetMapping("/me")
    public ResponseEntity<GuardianDto> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();
            GuardianDto guardianDto = convertToDto(guardian);

            log.debug("현재 사용자 정보 조회: {}", guardian.getLoginId());
            return ResponseEntity.ok(guardianDto);

        } catch (Exception e) {
            log.error("현재 사용자 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 전체 보호자 목록 조회 (페이징 지원)
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @param sort 정렬 기준
     * @return 보호자 목록
     */
    @GetMapping
    public ResponseEntity<Page<GuardianDto>> getAllGuardians(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "registeredAt") String sort) {

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));
            Page<Guardians> guardiansPage = guardianRepository.findByIsActiveTrue(pageable);

            Page<GuardianDto> guardianDtoPage = guardiansPage.map(this::convertToDto);

            log.debug("보호자 목록 조회: 페이지 {}, 크기 {}", page, size);
            return ResponseEntity.ok(guardianDtoPage);

        } catch (Exception e) {
            log.error("보호자 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * ID로 특정 보호자 조회
     * @param id 보호자 ID
     * @return 보호자 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<GuardianDto> getGuardianById(@PathVariable Integer id) {
        try {
            Optional<Guardians> guardianOpt = guardianRepository.findById(id);

            if (guardianOpt.isPresent() && guardianOpt.get().getIsActive()) {
                GuardianDto guardianDto = convertToDto(guardianOpt.get());
                return ResponseEntity.ok(guardianDto);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("보호자 조회 중 오류 발생: ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 보호자 이름으로 검색
     * @param name 검색할 이름
     * @return 검색 결과 목록
     */
    @GetMapping("/search")
    public ResponseEntity<List<GuardianDto>> searchGuardiansByName(@RequestParam String name) {
        try {
            List<Guardians> guardians = guardianRepository.findByGuardianNameContainingAndIsActiveTrue(name);
            List<GuardianDto> guardianDtos = guardians.stream()
                    .map(this::convertToDto)
                    .toList();

            log.debug("보호자 이름 검색: '{}', 결과 {}건", name, guardianDtos.size());
            return ResponseEntity.ok(guardianDtos);

        } catch (Exception e) {
            log.error("보호자 이름 검색 중 오류 발생: '{}'", name, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 사용자 정보 수정
     * @param currentUser 현재 인증된 사용자
     * @param updateRequest 수정할 정보
     * @return 수정된 사용자 정보
     */
    @PutMapping("/me")
    public ResponseEntity<GuardianDto> updateCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody GuardianDto updateRequest) {

        try {
            Guardians guardian = currentUser.getGuardians();

            // 수정 가능한 필드들 업데이트
            if (updateRequest.getGuardianName() != null) {
                guardian.setGuardianName(updateRequest.getGuardianName());
            }
            if (updateRequest.getPhone() != null) {
                guardian.setPhone(updateRequest.getPhone());
            }
            if (updateRequest.getEmail() != null) {
                // 이메일 중복 확인 (현재 사용자 제외)
                Optional<Guardians> existingGuardian = guardianRepository.findByEmail(updateRequest.getEmail());
                if (existingGuardian.isPresent() && !existingGuardian.get().getId().equals(guardian.getId())) {
                    return ResponseEntity.badRequest().build();
                }
                guardian.setEmail(updateRequest.getEmail());
            }
            if (updateRequest.getRelationship() != null) {
                guardian.setRelationship(updateRequest.getRelationship());
            }

            // 수정 시간 업데이트
            guardian.setUpdatedAt(LocalDateTime.now());

            Guardians savedGuardian = guardianRepository.save(guardian);
            GuardianDto responseDto = convertToDto(savedGuardian);

            log.info("사용자 정보 수정 완료: {}", guardian.getLoginId());
            return ResponseEntity.ok(responseDto);

        } catch (Exception e) {
            log.error("사용자 정보 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 사용자 비밀번호 변경
     * @param currentUser 현재 인증된 사용자
     * @param passwordChangeRequest 비밀번호 변경 요청
     * @return 변경 결과
     */
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, String> passwordChangeRequest) {

        try {
            String currentPassword = passwordChangeRequest.get("currentPassword");
            String newPassword = passwordChangeRequest.get("newPassword");

            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "현재 비밀번호와 새 비밀번호를 입력해주세요."));
            }

            Guardians guardian = currentUser.getGuardians();

            // 현재 비밀번호 확인
            if (!passwordEncoder.matches(currentPassword, guardian.getLoginPw())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "현재 비밀번호가 올바르지 않습니다."));
            }

            // 새 비밀번호 암호화 및 저장
            guardian.setLoginPw(passwordEncoder.encode(newPassword));
            guardian.setUpdatedAt(LocalDateTime.now());
            guardianRepository.save(guardian);

            log.info("비밀번호 변경 완료: {}", guardian.getLoginId());
            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));

        } catch (Exception e) {
            log.error("비밀번호 변경 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "비밀번호 변경 중 오류가 발생했습니다."));
        }
    }

    /**
     * 계정 비활성화 (소프트 삭제)
     * @param currentUser 현재 인증된 사용자
     * @return 비활성화 결과
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deactivateAccount(@AuthenticationPrincipal CustomUserDetails currentUser) {
        try {
            Guardians guardian = currentUser.getGuardians();
            guardian.setIsActive(false);
            guardian.setUpdatedAt(LocalDateTime.now());
            guardianRepository.save(guardian);

            log.info("계정 비활성화 완료: {}", guardian.getLoginId());
            return ResponseEntity.ok(Map.of("message", "계정이 비활성화되었습니다."));

        } catch (Exception e) {
            log.error("계정 비활성화 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "계정 비활성화 중 오류가 발생했습니다."));
        }
    }

    /**
     * Guardians 엔티티를 GuardianDto로 변환
     * @param guardian Guardians 엔티티
     * @return GuardianDto
     */
    private GuardianDto convertToDto(Guardians guardian) {
        return GuardianDto.builder()
                .id(guardian.getId())
                .loginId(guardian.getLoginId())
                .guardianName(guardian.getGuardianName())
                .phone(guardian.getPhone())
                .email(guardian.getEmail())
                .relationship(guardian.getRelationship())
                .role(guardian.getRole().getKey())
                .isActive(guardian.getIsActive())
                .registeredAt(guardian.getRegisteredAt())
                .updatedAt(guardian.getUpdatedAt())
                .build();
    }
}