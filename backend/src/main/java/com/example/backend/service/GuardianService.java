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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuardianService {

    private final GuardianRepository guardianRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Guardian 생성
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