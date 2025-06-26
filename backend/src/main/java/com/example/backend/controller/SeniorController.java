
package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.service.SeniorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Senior(노인) 관련 API를 처리하는 컨트롤러
 * JWT 인증이 필요한 보호된 엔드포인트들을 포함
 */
@Slf4j
@RestController
@RequestMapping("/api/seniors")
@RequiredArgsConstructor
public class SeniorController {

    private final SeniorService seniorService;

    /**
     * 현재 Guardian이 관리하는 Senior 목록 조회
     * @param currentUser 현재 인증된 사용자 정보
     * @param page 페이지 번호 (0부터 시작)
     * @param size 페이지 크기
     * @param sort 정렬 기준
     * @return Senior 목록
     */
    @GetMapping
    public ResponseEntity<Page<SeniorDto.SeniorResponseDto>> getMySeniors(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {

        try {
            Guardians guardian = currentUser.getGuardians();
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));

            Page<SeniorDto.SeniorResponseDto> seniorDtoPage = seniorService.getMySeniors(guardian, pageable);

            log.debug("Guardian {}의 Senior 목록 조회: 페이지 {}, 크기 {}",
                    guardian.getLoginId(), page, size);
            return ResponseEntity.ok(seniorDtoPage);

        } catch (Exception e) {
            log.error("Senior 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 특정 Senior 상세 조회 (본인 소유 확인)
     * @param id Senior ID
     * @param currentUser 현재 인증된 사용자
     * @return Senior 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<SeniorDto.SeniorResponseDto> getSeniorById(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            Optional<SeniorDto.SeniorResponseDto> responseDto = seniorService.getSeniorById(id, guardian);

            if (responseDto.isPresent()) {
                return ResponseEntity.ok(responseDto.get());
            } else {
                log.warn("Senior {} 조회 실패: 소유권 없음 또는 존재하지 않음 (Guardian: {})",
                        id, guardian.getLoginId());
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Senior 조회 중 오류 발생: ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 새 Senior 등록
     * @param createRequest Senior 생성 요청
     * @param currentUser 현재 인증된 사용자
     * @return 생성된 Senior 정보
     */
    @PostMapping
    public ResponseEntity<SeniorDto.SeniorResponseDto> createSenior(
            @RequestBody SeniorDto.SeniorCreateRequestDto createRequest,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            SeniorDto.SeniorResponseDto responseDto = seniorService.createSenior(createRequest, guardian);

            log.info("새 Senior 등록 완료: {} (Guardian: {})",
                    responseDto.seniorName(), guardian.getLoginId());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);

        } catch (IllegalArgumentException e) {
            log.warn("Senior 등록 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Senior 등록 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Senior 정보 수정
     * @param id Senior ID
     * @param updateRequest 수정 요청
     * @param currentUser 현재 인증된 사용자
     * @return 수정된 Senior 정보
     */
    @PutMapping("/{id}")
    public ResponseEntity<SeniorDto.SeniorResponseDto> updateSenior(
            @PathVariable Integer id,
            @RequestBody SeniorDto.SeniorUpdateRequestDto updateRequest,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            Optional<SeniorDto.SeniorResponseDto> responseDto = seniorService.updateSenior(id, updateRequest, guardian);

            if (responseDto.isPresent()) {
                return ResponseEntity.ok(responseDto.get());
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Senior 수정 중 오류 발생: ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Senior 삭제 (소프트 삭제)
     * @param id Senior ID
     * @param currentUser 현재 인증된 사용자
     * @return 삭제 결과
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSenior(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            boolean isDeleted = seniorService.deleteSenior(id, guardian);

            if (isDeleted) {
                return ResponseEntity.ok(Map.of("message", "Senior가 삭제되었습니다."));
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            log.error("Senior 삭제 중 오류 발생: ID {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Senior 삭제 중 오류가 발생했습니다."));
        }
    }

    /**
     * Senior 이름으로 검색
     * @param name 검색할 이름
     * @param currentUser 현재 인증된 사용자
     * @return 검색 결과 목록
     */
    @GetMapping("/search")
    public ResponseEntity<List<SeniorDto.SeniorResponseDto>> searchSeniorsByName(
            @RequestParam String name,
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            List<SeniorDto.SeniorResponseDto> seniorDtos = seniorService.searchSeniorsByName(name, guardian);

            log.debug("Senior 이름 검색: '{}', 결과 {}건 (Guardian: {})",
                    name, seniorDtos.size(), guardian.getLoginId());
            return ResponseEntity.ok(seniorDtos);

        } catch (Exception e) {
            log.error("Senior 이름 검색 중 오류 발생: '{}'", name, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 현재 Guardian의 Senior 통계 조회
     * @param currentUser 현재 인증된 사용자
     * @return Senior 통계 정보
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSeniorStatistics(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        try {
            Guardians guardian = currentUser.getGuardians();

            Map<String, Object> statistics = seniorService.getSeniorStatistics(guardian);

            return ResponseEntity.ok(statistics);

        } catch (Exception e) {
            log.error("Senior 통계 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}