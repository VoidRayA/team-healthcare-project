package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Role;
import com.example.backend.dto.GuardiansDto;
import com.example.backend.dto.login.GuardianDto;
import com.example.backend.repository.GuardianRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * GuardianService.java - 보호자 비즈니스 로직 서비스
 * 
 * 👥 주요 기능:
 * - 보호자 CRUD 기능 (생성, 조회, 수정, 삭제)
 * - PasswordEncoder를 통한 비밀번호 안전 암호화
 * - 소프트 삭제 구현 (isActive 플래그 활용)
 * - 페이지네이션 및 다양한 조건 검색 기능
 * 
 * 🔍 검색 기능:
 * - 이름 부분 매칭 검색 (LIKE 연산)
 * - 역할(Role) 기반 검색 (GUARDIAN, ADMIN 등)
 * - 관계(relationship) 기반 검색 (자녀, 배우자 등)
 * - 활성 상태(isActive) 필터링
 * 
 * 🔒 보안 및 데이터 무결성:
 * - 중복 로그인 ID 체크 (createGuardian)
 * - 비밀번호 암호화 의무 처리
 * - 소프트 삭제 vs 물리적 삭제 옵션 제공
 * - Entity ↔ DTO 변환을 통한 데이터 은닉
 * 
 * 📊 주요 메서드:
 * - createGuardian(): 중복 체크 + 암호화 + 엔티티 생성
 * - searchGuardians(): 다양한 조건으로 보호자 검색
 * - deleteGuardian(), hardDeleteGuardian(): 소프트 vs 하드 삭제
 * - convertToDto(): 엔티티 → DTO 변환 (민감정보 제외)
 */

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianService {

    private final GuardianRepository guardianRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Guardian 생성 메서드
     * @param requestDto 회원가입 요청 데이터
     * @return 생성된 Guardian DTO
     * 
     * 🔒 보안 처리:
     * - 중복 로그인 ID 체크 (IllegalArgumentException 발생)
     * - PasswordEncoder로 비밀번호 암호화 의무 처리
     * - Role.GUARDIAN 기본 역할 설정
     * - isActive=true 기본 활성 상태 설정
     */
    @Transactional
    public GuardianDto createGuardian(GuardiansDto.GuardianCreateRequestDto requestDto) {
        // 중복 로그인 ID 체크
        if (guardianRepository.findByLoginId(requestDto.loginId()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 로그인 ID입니다: " + requestDto.loginId());
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(requestDto.loginPw());

        // Guardian 엔티티 생성
        Guardians guardian = Guardians.builder()
                .loginId(requestDto.loginId())
                .loginPw(encodedPassword)
                .guardianName(requestDto.guardianName())
                .phone(requestDto.phone())
                .email(requestDto.email())
                .relationship(requestDto.relationship())
                .role(Role.GUARDIAN) // 기본 역할 설정
                .isActive(true)
                .build();

        // 저장
        Guardians savedGuardian = guardianRepository.save(guardian);

        return convertToDto(savedGuardian);
    }

    /**
     * Guardian 단건 조회 (ID로)
     */
    public GuardianDto getGuardianById(Integer id) {
        Guardians guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Guardian을 찾을 수 없습니다: " + id));

        return convertToDto(guardian);
    }

    /**
     * Guardian 단건 조회 (로그인 ID로)
     */
    public GuardianDto getGuardianByLoginId(String loginId) {
        Guardians guardian = guardianRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian을 찾을 수 없습니다: " + loginId));

        return convertToDto(guardian);
    }

    /**
     * Guardian 목록 조회 (조건 검색)
     */
    public List<GuardianDto> searchGuardians(GuardiansDto.GuardianSearchDto searchDto) {
        if (searchDto.guardianName() != null && !searchDto.guardianName().trim().isEmpty()) {
            return guardianRepository.findByGuardianNameContainingAndIsActiveTrue(searchDto.guardianName())
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        if (searchDto.role() != null) {
            return guardianRepository.findByRoleAndIsActiveTrue(searchDto.role())
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        if (searchDto.relationship() != null && !searchDto.relationship().trim().isEmpty()) {
            return guardianRepository.findByRelationshipAndIsActiveTrue(searchDto.relationship())
                    .stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }

        // 기본적으로 활성화된 모든 Guardian 반환
        return guardianRepository.findByIsActiveTrue(null)
                .getContent()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Guardian 목록 조회 (페이징)
     */
    public Page<GuardianDto> searchGuardians(GuardiansDto.GuardianSearchDto searchDto, Pageable pageable) {
        // 기본적으로 활성화된 Guardian들만 페이징 조회
        Page<Guardians> guardianPage = guardianRepository.findByIsActiveTrue(pageable);

        return guardianPage.map(this::convertToDto);
    }

    /**
     * Guardian 삭제 (소프트 삭제)
     */
    @Transactional
    public void deleteGuardian(Integer id) {
        Guardians guardian = guardianRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Guardian을 찾을 수 없습니다: " + id));

        // 소프트 삭제 (isActive = false)
        guardian.setIsActive(false);
        guardianRepository.save(guardian);
    }

    /**
     * Guardian 물리적 삭제
     */
    @Transactional
    public void hardDeleteGuardian(Integer id) {
        if (!guardianRepository.existsById(id)) {
            throw new IllegalArgumentException("Guardian을 찾을 수 없습니다: " + id);
        }

        guardianRepository.deleteById(id);
    }

    /**
     * 활성화된 Guardian 목록 조회
     */
    public List<GuardianDto> getActiveGuardians() {
        return guardianRepository.findByIsActiveTrue(null)
                .getContent()
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Guardian 존재 여부 확인
     */
    public boolean existsById(Integer id) {
        return guardianRepository.existsById(id);
    }

    /**
     * 로그인 ID 중복 확인
     */
    public boolean existsByLoginId(String loginId) {
        return guardianRepository.findByLoginId(loginId).isPresent();
    }

    /**
     * Entity를 DTO로 변환
     */
    private GuardianDto convertToDto(Guardians guardian) {
        return GuardianDto.builder()
                .id(guardian.getId())
                .loginId(guardian.getLoginId())
                .guardianName(guardian.getGuardianName())
                .phone(guardian.getPhone())
                .email(guardian.getEmail())
                .relationship(guardian.getRelationship())
                .role(guardian.getRole().name())
                .isActive(guardian.getIsActive())
                .registeredAt(guardian.getRegisteredAt())
                .updatedAt(guardian.getUpdatedAt())
                .build();
    }
}