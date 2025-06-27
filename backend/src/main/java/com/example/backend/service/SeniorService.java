package com.example.backend.service;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.SeniorDto;
import com.example.backend.repository.SeniorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Senior(노인) 관련 비즈니스 로직을 처리하는 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeniorService {

    private final SeniorRepository seniorRepository;

    /**
     * Guardian이 관리하는 활성화된 Senior 목록 조회 (페이징)
     * @param guardian 현재 Guardian
     * @param pageable 페이징 정보
     * @return Senior 목록 (페이징)
     */
    public Page<SeniorDto.SeniorResponseDto> getMySeniors(Guardians guardian, Pageable pageable) {
        log.debug("Guardian {}의 Senior 목록 조회 시작", guardian.getLoginId());

        Page<Seniors> seniorsPage = seniorRepository.findByGuardianAndIsActiveTrue(guardian, pageable);
        Page<SeniorDto.SeniorResponseDto> seniorDtoPage = seniorsPage.map(SeniorDto.SeniorResponseDto::from);

        log.debug("Guardian {}의 Senior 목록 조회 완료: {}건",
                guardian.getLoginId(), seniorDtoPage.getTotalElements());
        return seniorDtoPage;
    }

    /**
     * 특정 Senior 상세 조회 (본인 소유 확인)
     * @param seniorId Senior ID
     * @param guardian 현재 Guardian
     * @return Senior 상세 정보
     */
    public Optional<SeniorDto.SeniorResponseDto> getSeniorById(Integer seniorId, Guardians guardian) {
        log.debug("Senior 조회 시작: ID {}, Guardian {}", seniorId, guardian.getLoginId());

        Optional<Seniors> seniorOpt = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId());

        if (seniorOpt.isPresent()) {
            SeniorDto.SeniorResponseDto responseDto = SeniorDto.SeniorResponseDto.from(seniorOpt.get());
            log.debug("Senior 조회 성공: {}", seniorOpt.get().getSeniorName());
            return Optional.of(responseDto);
        } else {
            log.warn("Senior 조회 실패: ID {} (Guardian: {})", seniorId, guardian.getLoginId());
            return Optional.empty();
        }
    }

    /**
     * 새 Senior 등록
     * @param createRequest Senior 생성 요청
     * @param guardian 현재 Guardian
     * @return 생성된 Senior 정보
     */
    @Transactional
    public SeniorDto.SeniorResponseDto createSenior(SeniorDto.SeniorCreateRequestDto createRequest,
                                                    Guardians guardian) {
        log.info("새 Senior 등록 시작: {} (Guardian: {})",
                createRequest.seniorName(), guardian.getLoginId());

        // 중복 체크 (같은 Guardian이 같은 이름의 Senior를 등록하는 경우)
        List<Seniors> existingSeniors = seniorRepository.findByGuardianAndSeniorNameContainingAndIsActiveTrue(
                guardian, createRequest.seniorName());

        if (!existingSeniors.isEmpty()) {
            log.warn("중복된 Senior 이름: {} (Guardian: {})",
                    createRequest.seniorName(), guardian.getLoginId());
            throw new IllegalArgumentException("이미 같은 이름의 Senior가 등록되어 있습니다.");
        }

        // 새 Senior 엔티티 생성
        Seniors newSenior = Seniors.builder()
                .guardian(guardian)
                .seniorName(createRequest.seniorName())
                .birthDate(createRequest.birthDate())
                .gender(createRequest.gender())
                .address(createRequest.address())
                .emergencyContact(createRequest.emergencyContact())
                .chronicDiseases(createRequest.chronicDiseases())
                .medications(createRequest.medications())
                .notes(createRequest.notes())
                .phone(createRequest.phone())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        Seniors savedSenior = seniorRepository.save(newSenior);

        log.info("새 Senior 등록 완료: {} (ID: {}, Guardian: {})",
                savedSenior.getSeniorName(), savedSenior.getId(), guardian.getLoginId());

        return SeniorDto.SeniorResponseDto.from(savedSenior);
    }

    /**
     * Senior 정보 수정
     * @param seniorId Senior ID
     * @param updateRequest 수정 요청
     * @param guardian 현재 Guardian
     * @return 수정된 Senior 정보
     */
    @Transactional
    public Optional<SeniorDto.SeniorResponseDto> updateSenior(Integer seniorId,
                                                              SeniorDto.SeniorUpdateRequestDto updateRequest,
                                                              Guardians guardian) {
        log.info("Senior 수정 시작: ID {} (Guardian: {})", seniorId, guardian.getLoginId());

        // 본인 소유 Senior 확인
        Optional<Seniors> seniorOpt = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId());

        if (seniorOpt.isEmpty()) {
            log.warn("Senior 수정 실패: 소유권 없음 - ID {} (Guardian: {})",
                    seniorId, guardian.getLoginId());
            return Optional.empty();
        }

        Seniors senior = seniorOpt.get();
        String originalName = senior.getSeniorName();

        // 수정 가능한 필드들 업데이트 (null이 아닌 경우만)
        updateSeniorFields(senior, updateRequest);
        senior.setUpdatedAt(LocalDateTime.now());

        Seniors savedSenior = seniorRepository.save(senior);

        log.info("Senior 수정 완료: {} -> {} (ID: {}, Guardian: {})",
                originalName, savedSenior.getSeniorName(), seniorId, guardian.getLoginId());

        return Optional.of(SeniorDto.SeniorResponseDto.from(savedSenior));
    }

    /**
     * Senior 삭제 (소프트 삭제)
     * @param seniorId Senior ID
     * @param guardian 현재 Guardian
     * @return 삭제 성공 여부
     */
    @Transactional
    public boolean deleteSenior(Integer seniorId, Guardians guardian) {
        log.info("Senior 삭제 시작: ID {} (Guardian: {})", seniorId, guardian.getLoginId());

        // 본인 소유 Senior 확인
        Optional<Seniors> seniorOpt = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId());

        if (seniorOpt.isEmpty()) {
            log.warn("Senior 삭제 실패: 소유권 없음 - ID {} (Guardian: {})",
                    seniorId, guardian.getLoginId());
            return false;
        }

        Seniors senior = seniorOpt.get();
        String seniorName = senior.getSeniorName();

        senior.setIsActive(false);
        senior.setUpdatedAt(LocalDateTime.now());
        seniorRepository.save(senior);

        log.info("Senior 삭제 완료: {} (ID: {}, Guardian: {})",
                seniorName, seniorId, guardian.getLoginId());
        return true;
    }

    /**
     * Senior 이름으로 검색
     * @param name 검색할 이름
     * @param guardian 현재 Guardian
     * @return 검색 결과 목록
     */
    public List<SeniorDto.SeniorResponseDto> searchSeniorsByName(String name, Guardians guardian) {
        log.debug("Senior 이름 검색: '{}' (Guardian: {})", name, guardian.getLoginId());

        List<Seniors> seniors = seniorRepository.findByGuardianAndSeniorNameContainingAndIsActiveTrue(
                guardian, name);

        List<SeniorDto.SeniorResponseDto> seniorDtos = seniors.stream()
                .map(SeniorDto.SeniorResponseDto::from)
                .toList();

        log.debug("Senior 이름 검색 완료: '{}', {}건 (Guardian: {})",
                name, seniorDtos.size(), guardian.getLoginId());
        return seniorDtos;
    }

    /**
     * 현재 Guardian의 Senior 통계 조회
     * @param guardian 현재 Guardian
     * @return Senior 통계 정보
     */
    public Map<String, Object> getSeniorStatistics(Guardians guardian) {
        log.debug("Senior 통계 조회 시작: Guardian {}", guardian.getLoginId());

        long totalCount = seniorRepository.countByGuardianAndIsActiveTrue(guardian);
        List<Object[]> genderStats = seniorRepository.countByGenderAndGuardian(guardian);

        Map<String, Object> statistics = Map.of(
                "totalSeniors", totalCount,
                "genderStatistics", genderStats,
                "guardianName", guardian.getGuardianName()
        );

        log.debug("Senior 통계 조회 완료: 총 {}명 (Guardian: {})",
                totalCount, guardian.getLoginId());
        return statistics;
    }

    /**
     * Senior 활성화/비활성화 토글
     * @param seniorId Senior ID
     * @param guardian 현재 Guardian
     * @return 변경된 Senior 정보
     */
    @Transactional
    public Optional<SeniorDto.SeniorResponseDto> toggleSeniorActive(Integer seniorId, Guardians guardian) {
        log.info("Senior 활성화 상태 토글: ID {} (Guardian: {})", seniorId, guardian.getLoginId());

        Optional<Seniors> seniorOpt = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId());

        if (seniorOpt.isEmpty()) {
            log.warn("Senior 토글 실패: 소유권 없음 - ID {} (Guardian: {})",
                    seniorId, guardian.getLoginId());
            return Optional.empty();
        }

        Seniors senior = seniorOpt.get();
        boolean oldStatus = senior.getIsActive();
        senior.setIsActive(!oldStatus);
        senior.setUpdatedAt(LocalDateTime.now());

        Seniors savedSenior = seniorRepository.save(senior);

        log.info("Senior 활성화 상태 변경: {} - {} -> {} (ID: {}, Guardian: {})",
                senior.getSeniorName(), oldStatus, !oldStatus, seniorId, guardian.getLoginId());

        return Optional.of(SeniorDto.SeniorResponseDto.from(savedSenior));
    }

    // ===== Private Helper Methods =====

    /**
     * Senior 필드 업데이트 (null이 아닌 필드만)
     */
    private void updateSeniorFields(Seniors senior, SeniorDto.SeniorUpdateRequestDto updateRequest) {
        if (updateRequest.seniorName() != null && !updateRequest.seniorName().trim().isEmpty()) {
            senior.setSeniorName(updateRequest.seniorName().trim());
        }
        if (updateRequest.gender() != null) {
            senior.setGender(updateRequest.gender());
        }
        if (updateRequest.address() != null) {
            senior.setAddress(updateRequest.address());
        }
        if (updateRequest.emergencyContact() != null) {
            senior.setEmergencyContact(updateRequest.emergencyContact());
        }
        if (updateRequest.chronicDiseases() != null) {
            senior.setChronicDiseases(updateRequest.chronicDiseases());
        }
        if (updateRequest.medications() != null) {
            senior.setMedications(updateRequest.medications());
        }
        if (updateRequest.notes() != null) {
            senior.setNotes(updateRequest.notes());
        }
        if (updateRequest.phone() != null) {
            senior.setPhone(updateRequest.phone());
        }
        if (updateRequest.isActive() != null) {
            senior.setIsActive(updateRequest.isActive());
        }
    }
}