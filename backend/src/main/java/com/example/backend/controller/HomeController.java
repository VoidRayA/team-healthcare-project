package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.HospitalDetailItem;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.service.location.HospitalLocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 홈 화면 전용 API 컨트롤러
 * 대시보드에 필요한 통합 정보 제공
 */
@Slf4j
@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
public class HomeController {
    
    private final SeniorRepository seniorRepository;
    private final HospitalLocationService hospitalLocationService;
    
    /**
     * 현재 Guardian의 시니어들 주소 기반 추천 병원 조회
     * @param currentUser 현재 인증된 사용자
     * @return 추천 병원 정보
     */
    @GetMapping("/recommended-hospital")
    public ResponseEntity<HospitalDetailItem> getRecommendedHospital(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            
            // 현재 Guardian의 시니어 목록 조회
            List<Seniors> seniors = seniorRepository.findByGuardian(guardian);
            
            if (seniors.isEmpty()) {
                // 시니어가 없으면 기본 병원 (부산대병원) 반환
                HospitalDetailItem defaultHospital = hospitalLocationService.getRecommendedHospital("");
                return ResponseEntity.ok(defaultHospital);
            }
            
            // 첫 번째 시니어의 주소 기반으로 병원 추천
            Seniors firstSenior = seniors.get(0);
            String seniorAddress = firstSenior.getAddress();
            
            log.info("시니어 주소 기반 병원 추천: {} -> {}", seniorAddress, "추천 병원");
            
            HospitalDetailItem recommendedHospital = hospitalLocationService.getRecommendedHospital(seniorAddress);
            
            return ResponseEntity.ok(recommendedHospital);
            
        } catch (Exception e) {
            log.error("추천 병원 조회 중 오류 발생", e);
            
            // 오류 시 기본 병원 반환
            HospitalDetailItem defaultHospital = hospitalLocationService.getRecommendedHospital("");
            return ResponseEntity.ok(defaultHospital);
        }
    }
    
    /**
     * 홈 화면 요약 정보 조회
     * @param currentUser 현재 인증된 사용자
     * @return 대시보드 요약 정보
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getHomeSummary(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        try {
            Guardians guardian = currentUser.getGuardians();
            List<Seniors> seniors = seniorRepository.findByGuardian(guardian);
            
            // 추천 병원 정보
            String firstSeniorAddress = seniors.isEmpty() ? "" : seniors.get(0).getAddress();
            HospitalDetailItem recommendedHospital = hospitalLocationService.getRecommendedHospital(firstSeniorAddress);
            
            // 요약 정보 구성
            Map<String, Object> summary = Map.of(
                "totalSeniors", seniors.size(),
                "activeAlerts", calculateActiveAlerts(seniors),
                "recommendedHospital", recommendedHospital,
                "guardianName", guardian.getGuardianName()
            );
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            log.error("홈 요약 정보 조회 중 오류 발생", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * 활성 알림 수 계산 (임시 로직)
     */
    private int calculateActiveAlerts(List<Seniors> seniors) {
        // 실제로는 Daily Activities나 Vital Signs 기반 계산
        return Math.max(0, seniors.size() - 2); // 임시: 시니어 수에 따른 계산
    }
}
