package com.example.backend.service.vital;

import com.example.backend.repository.SeniorRepository;
import com.example.backend.repository.VitalSignArchiveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class VitalSignArchiveService {
    
    private final VitalSignArchiveRepository archiveRepository;
    private final SeniorRepository seniorRepository;
    
    /**
     * Guardian이 특정 Senior에 대한 접근 권한이 있는지 확인
     */
    public boolean hasAccessToSenior(Integer guardianId, Integer seniorId) {
        return seniorRepository.findByIdAndGuardianId(seniorId, guardianId).isPresent();
    }
    
    /**
     * 특정 연도의 통계 정보 생성
     */
    public Map<String, Object> getYearStatistics(int year, Integer seniorId, Integer guardianId) {
        // 권한 확인
        if (seniorId != null && !hasAccessToSenior(guardianId, seniorId)) {
            throw new SecurityException("해당 Senior에 대한 접근 권한이 없습니다.");
        }
        
        Map<String, Object> stats = new HashMap<>();
        
        // 기본 통계
        int totalRecords = archiveRepository.getRecordCountByYear(year);
        stats.put("totalRecords", totalRecords);
        stats.put("year", year);
        
        // 추가 통계 정보 (필요시 구현)
        // - 월별 측정 횟수
        // - 평균 수치들
        // - 이상 수치 비율 등
        
        return stats;
    }
    
    /**
     * 아카이브 시스템 전체 상태 정보
     */
    public Map<String, Object> getArchiveStatus() {
        Map<String, Object> status = new HashMap<>();
        
        List<VitalSignArchiveRepository.YearInfo> yearInfos = archiveRepository.getYearInfoList();
        status.put("availableYears", yearInfos);
        status.put("totalYears", yearInfos.size());
        status.put("currentYear", LocalDateTime.now().getYear());
        
        return status;
    }
    
    /**
     * 수동 아카이브 실행
     */
    public String manualArchive(int year) {
        int currentYear = LocalDateTime.now().getYear();
        if (year >= currentYear) {
            throw new IllegalArgumentException("현재 연도 이후는 아카이브할 수 없습니다.");
        }
        
        try {
            int migratedCount = archiveRepository.migrateDataToArchive(year);
            return String.format("Successfully migrated %d records for year %d", migratedCount, year);
        } catch (Exception e) {
            throw new RuntimeException("Archive failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * 매년 1월 1일 자동 실행: 전년도 데이터 아카이브
     */
    @Scheduled(cron = "0 0 0 1 1 *") // 매년 1월 1일 00:00:00
    public void scheduleYearlyArchive() {
        int previousYear = LocalDateTime.now().getYear() - 1;
        
        try {
            int migratedCount = archiveRepository.migrateDataToArchive(previousYear);
            System.out.println("Successfully migrated " + migratedCount + 
                             " records for year " + previousYear);
        } catch (Exception e) {
            System.err.println("Failed to migrate data for year " + previousYear + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
