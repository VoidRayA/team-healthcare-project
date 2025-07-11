package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.VitalSigns;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.repository.VitalSignArchiveRepository;
import com.example.backend.service.vital.VitalSignArchiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vital-signs")
@RequiredArgsConstructor
public class VitalSignArchiveController {

    private final VitalSignArchiveRepository archiveRepository;
    private final VitalSignArchiveService archiveService;

    // ====================================================================
    // 1. 연도별 조회 API
    // ====================================================================
    
    /**
     * 연도별 생체 데이터 조회
     * GET /api/vital-signs?year=2024&seniorId=1
     */
    @GetMapping
    public ResponseEntity<?> getVitalSignsByYear(
            @RequestParam(defaultValue = "2025") int year,
            @RequestParam Integer seniorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            // 권한 확인 (해당 senior에 대한 접근 권한이 있는지)
            if (!archiveService.hasAccessToSenior(guardian.getId(), seniorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("해당 Senior에 대한 접근 권한이 없습니다.");
            }

            // 페이징 처리된 데이터 조회
            List<VitalSigns> vitalSigns;
            if (page > 0 || size != 50) {
                int offset = page * size;
                vitalSigns = archiveRepository.findByYearAndSeniorIdWithPaging(
                    year, seniorId, offset, size);
            } else {
                vitalSigns = archiveRepository.findByYearAndSeniorId(year, seniorId);
            }

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("year", year);
            response.put("seniorId", seniorId);
            response.put("data", vitalSigns);
            response.put("totalCount", archiveRepository.getRecordCountByYear(year));
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("연도별 생체 데이터 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("생체 데이터 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 연도의 특정 기간 조회
     * GET /api/vital-signs/range?year=2024&seniorId=1&start=2024-01-01&end=2024-12-31
     */
    @GetMapping("/range")
    public ResponseEntity<?> getVitalSignsByDateRange(
            @RequestParam int year,
            @RequestParam Integer seniorId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate start,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            if (!archiveService.hasAccessToSenior(guardian.getId(), seniorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("해당 Senior에 대한 접근 권한이 없습니다.");
            }

            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59);

            List<VitalSigns> vitalSigns = archiveRepository.findByYearAndDateRange(
                year, seniorId, startDateTime, endDateTime);

            Map<String, Object> response = new HashMap<>();
            response.put("year", year);
            response.put("seniorId", seniorId);
            response.put("startDate", start);
            response.put("endDate", end);
            response.put("data", vitalSigns);
            response.put("count", vitalSigns.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("기간별 생체 데이터 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("생체 데이터 조회 중 오류가 발생했습니다.");
        }
    }

    // ====================================================================
    // 2. 연도 정보 API
    // ====================================================================
    
    /**
     * 사용 가능한 연도 목록 조회
     * GET /api/vital-signs/years
     */
    @GetMapping("/years")
    public ResponseEntity<?> getAvailableYears(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            List<VitalSignArchiveRepository.YearInfo> yearInfos = 
                archiveRepository.getYearInfoList();

            Map<String, Object> response = new HashMap<>();
            response.put("years", yearInfos);
            response.put("currentYear", LocalDateTime.now().getYear());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("연도 목록 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("연도 목록 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 특정 연도의 통계 정보 조회
     * GET /api/vital-signs/stats/2024
     */
    @GetMapping("/stats/{year}")
    public ResponseEntity<?> getYearStatistics(
            @PathVariable int year,
            @RequestParam(required = false) Integer seniorId,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            Map<String, Object> stats = archiveService.getYearStatistics(year, seniorId, guardian.getId());
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("연도별 통계 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("통계 조회 중 오류가 발생했습니다.");
        }
    }

    // ====================================================================
    // 3. 관리자용 API (아카이브 관리)
    // ====================================================================
    
    /**
     * 수동 아카이브 실행 (관리자용)
     * POST /api/vital-signs/archive/2024
     */
    @PostMapping("/archive/{year}")
    public ResponseEntity<?> manualArchive(
            @PathVariable int year,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            // 관리자 권한 확인 (필요시 구현)
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            String result = archiveService.manualArchive(year);
            return ResponseEntity.ok(Map.of("message", result));

        } catch (Exception e) {
            System.err.println("수동 아카이브 실행 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("아카이브 실행 중 오류가 발생했습니다.");
        }
    }

    /**
     * 아카이브 테이블 상태 확인
     * GET /api/vital-signs/archive/status
     */
    @GetMapping("/archive/status")
    public ResponseEntity<?> getArchiveStatus(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            Map<String, Object> status = archiveService.getArchiveStatus();
            return ResponseEntity.ok(status);

        } catch (Exception e) {
            System.err.println("아카이브 상태 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("상태 조회 중 오류가 발생했습니다.");
        }
    }

    // ====================================================================
    // 4. 기존 VitalController와의 호환성 유지
    // ====================================================================
    
    /**
     * 기존 API와 호환되는 전체 조회 (최신 데이터 우선)
     * GET /api/vital-signs/recent?seniorId=1&limit=100
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentVitalSigns(
            @RequestParam Integer seniorId,
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Guardian 정보가 없습니다.");
            }

            if (!archiveService.hasAccessToSenior(guardian.getId(), seniorId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("해당 Senior에 대한 접근 권한이 없습니다.");
            }

            // 현재 연도부터 최신 데이터 조회
            int currentYear = LocalDateTime.now().getYear();
            List<VitalSigns> recentData = archiveRepository.findByYearAndSeniorIdWithPaging(
                currentYear, seniorId, 0, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("seniorId", seniorId);
            response.put("data", recentData);
            response.put("count", recentData.size());
            response.put("year", currentYear);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("최근 생체 데이터 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("생체 데이터 조회 중 오류가 발생했습니다.");
        }
    }
}
