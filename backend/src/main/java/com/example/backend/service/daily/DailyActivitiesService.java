package com.example.backend.service.daily;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/*
 * 활동기록 관련 서비스
 * */
@Service
@RequiredArgsConstructor
public class DailyActivitiesService {

    private final SeniorRepository seniorRepository;

    // =================================================================
    // 새로 추가된 메서드: 중복 기록 체크
    // =================================================================
    // 목적: DB 제약조건 위반으로 인한 AUTO_INCREMENT 낭비 방지
    // 방식: INSERT 전에 미리 중복 체크하여 사전 차단
    // =================================================================
    public boolean isDuplicateRecord(Integer seniorId, LocalDate activityDate, Guardians guardian) {
        System.out.println("=== 중복 체크 시작 ===");
        System.out.println("Senior ID: " + seniorId);
        System.out.println("Activity Date: " + activityDate);
        System.out.println("Guardian ID: " + guardian.getId());
        
        try {
            // 1단계: 해당 Senior가 존재하고 Guardian이 소유하는지 확인 (권한 체크 추가)
            Optional<Seniors> seniorOpt = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId());
            if (seniorOpt.isEmpty()) {
                System.out.println("Senior가 없거나 권한이 없음 - 403 오류 발생 예상");
                throw new EntityNotFoundException("해당 Senior를 찾을 수 없거나 접근 권한이 없습니다.");
            }
            
            Seniors senior = seniorOpt.get();
            System.out.println("Senior 찾음: " + senior.getSeniorName() + " (소유자: " + senior.getGuardian().getGuardianName() + ")");
            
            // 2단계: 해당 Senior의 기존 활동 기록들을 체크
            if (senior.getActivities() != null) {
                // 각 활동 기록의 날짜를 비교
                for (DailyActivities activity : senior.getActivities()) {
                    if (activity.getActivityDate().equals(activityDate)) {
                        // 동일 날짜의 기록이 이미 존재함 = 중복
                        System.out.println("중복 발견! 날짜: " + activity.getActivityDate());
                        return true;
                    }
                }
            }
            
            // 모든 검사를 통과했으면 중복 아님
            System.out.println("중복 없음");
            return false;
            
        } catch (EntityNotFoundException e) {
            // 권한 오류를 상위로 전파
            throw e;
        } catch (Exception e) {
            // 예외 발생 시 로그 출력 및 안전하게 비중복으로 처리
            System.err.println("중복 체크 중 오류: " + e.getMessage());
            e.printStackTrace();
            return false; // 오류 시 안전하게 비중복으로 처리
        }
    }
    // =================================================================
    // 새로 추가된 메서드 끝
    // =================================================================

    // =================================================================
    // 홈 화면용 최근 활동 현황 조회 메서드
    // 목적: 홈 화면의 '최근 활동 현황' 섹션에 표시할 데이터 제공
    // 방식: Guardian이 관리하는 모든 Senior의 가장 최근 활동만 수집
    // 반환: Map 형태로 time, user, activity, status 제공
    // =================================================================
    public List<Map<String, Object>> getRecentActivitiesForHome(Guardians guardian, int limit) {
        System.out.println("=== 홈 화면용 최근 활동 현황 조회 ===");
        System.out.println("Guardian ID: " + guardian.getId());
        System.out.println("Limit: " + limit);
        
        try {
            // Guardian이 관리하는 모든 Senior 조회
            List<Seniors> seniors = seniorRepository.findByGuardian(guardian);
            System.out.println("Guardian이 관리하는 Senior 수: " + seniors.size());
            
            List<Map<String, Object>> recentActivities = new ArrayList<>();
            
            // 각 Senior의 최근 활동 기록들을 수집
            for (Seniors senior : seniors) {
                if (senior.getActivities() != null && !senior.getActivities().isEmpty()) {
                    // 가장 최근 활동 1개만 가져오기 (생성일 기준 내림차순 정렬)
                    DailyActivities latestActivity = senior.getActivities().stream()
                            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                            .findFirst()
                            .orElse(null);
                    
                    if (latestActivity != null) {
                        // 시간 형식: HH:mm (예: 14:30)
                        String time = latestActivity.getCreatedAt().toLocalTime().toString().substring(0, 5);
                        // 활동 내용 설명 생성 (예: "식사 3회 약 복용 완료 외출 활동")
                        String activity = generateActivityDescription(latestActivity);
                        // 활동 상태 판단 (success/warning/error)
                        String status = determineActivityStatus(latestActivity);
                        
                        // 프론트엔드에서 사용할 형태로 Map 구성
                        Map<String, Object> activityMap = new HashMap<>();
                        activityMap.put("time", time);                    // 시간
                        activityMap.put("user", senior.getSeniorName());    // 사용자 이름
                        activityMap.put("activity", activity);            // 활동 내용
                        activityMap.put("status", status);                // 상태
                        
                        recentActivities.add(activityMap);
                    }
                }
            }
            
            // 시간순으로 정렬 후 limit 수만큼 반환 (최신순)
            return recentActivities.stream()
                    .sorted((a, b) -> ((String) b.get("time")).compareTo((String) a.get("time")))
                    .limit(limit)
                    .collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("최근 활동 현황 조회 중 오류: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>(); // 오류 시 빈 리스트 반환
        }
    }
    
    /**
     * 활동 내용 설명 생성 메서드
     * 목적: DailyActivities 데이터를 사용자가 읽기 쉬운 문장으로 변환
     * 예시: "식사 3회 약 복용 완료 외출 활동"
     * 주의: 엔티티 필드 타입에 맞춰 처리 (int, Byte 등)
     */
    private String generateActivityDescription(DailyActivities activity) {
        StringBuilder desc = new StringBuilder();
        
        // mealCount는 primitive int이므로 null 체크 불필요
        if (activity.getMealCount() > 0) {
            desc.append("식사 ").append(activity.getMealCount()).append("회 ");
        }
        
        // medicationTaken은 Byte 타입 (0=false, 1=true)
        if (activity.getMedicationTaken() != null) {
            if (activity.getMedicationTaken() == 1) {
                desc.append("약 복용 완료 ");
            } else {
                desc.append("약 복용 미완료 ");
            }
        }
        
        // outdoorActivity는 Byte 타입 (0=false, 1=true)
        if (activity.getOutdoorActivity() != null && activity.getOutdoorActivity() == 1) {
            desc.append("외출 활동 ");
        }
        
        if (desc.length() == 0) {
            desc.append("일일 활동 기록 완료");
        }
        
        return desc.toString().trim();
    }
    
    /**
     * 활동 상태 판단 메서드
     * 목적: 활동 내용을 분석하여 상태를 결정
     * 반환값:
     *   - "success": 정상 상태 (식사 2회 이상, 약 복용, 수면 양호)
     *   - "warning": 주의 상태 (식사 부족, 약 미복용)
     *   - "error": 긴급 상태 (수면 매우 나쁨, 불면)
     * 주의: Byte 타입 필드는 1=true, 0=false로 처리
     */
    private String determineActivityStatus(DailyActivities activity) {
        // 기본적으로 정상
        boolean isGood = true;
        
        // 식사 횟수 부족 (primitive int이므로 null 체크 불필요)
        if (activity.getMealCount() < 2) {
            isGood = false;
        }
        
        // 약 복용 안 함 (Byte 타입)
        if (activity.getMedicationTaken() != null && activity.getMedicationTaken() == 0) {
            isGood = false;
        }
        
        // 수면 상태 나쁨
        if (activity.getSleepQuality() != null && 
            (activity.getSleepQuality().contains("나쁨") || activity.getSleepQuality().contains("불면"))) {
            return "error"; // 긴급
        }
        
        return isGood ? "success" : "warning";
    }

    // 활동기록 생성 서비스
    public SeniorDto.SeniorDailyDto createDaily(Integer seniorId, DailyActivitiesDto dto, Guardians guardian) {
        // 기존 Senior 조회
        Seniors senior = seniorRepository.findById(seniorId)
                .orElseThrow(() -> new EntityNotFoundException("Senior not found"));

        // 활동 기록 생성
        DailyActivities dailyActivities = DailyActivities.builder()
                .senior(senior)
                .activityDate(dto.getActivityDate() != null ? dto.getActivityDate() : LocalDate.now())
                .mealCount(dto.getMealCount())
                .medicationTaken(dto.getMedicationTaken())
                .outdoorActivity(dto.getOutdoorActivity())
                .sleepQuality(dto.getSleepQuality())
                .dailyNotes(dto.getDailyNotes())
                .createdAt(LocalDateTime.now())
                .build();

        // Senior에 활동 기록 추가 (양방향 연관관계 설정)
        senior.addDailyActivity(dailyActivities);

        // 저장
        seniorRepository.save(senior);

        // Entity를 DTO로 변환하여 반환
        return convertToSeniorDailyDto(senior);
    }

    // 활동 기록 senior 전부와 특정 senior 조회 서비스
    // guardian이 관리하는 모든 senior 조회
    public SeniorDto.SeniorDailyListDto getListDaily(Integer seniorId, Guardians guardian) {
        List<Seniors> seniors = seniorRepository.findByGuardian(guardian);

        List<SeniorDto.SeniorDailyDto> seniorDtos = seniors.stream()
                .map(this::convertToSeniorDailyDto)
                .collect(Collectors.toList());

        return new SeniorDto.SeniorDailyListDto(seniorDtos);
    }

    // guardian이 관리하는 특정 senior 조회
    public SeniorDto.SeniorDailyDto getDaily(Integer seniorId, Integer activityId, Guardians guardian) {
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        return convertToSeniorDailyDto(senior);
    }

    // 활동 기록 삭제
    public SeniorDto.SeniorDailyDto deleteDaily(Integer seniorId, Integer activityId, Guardians guardian) {
        // 특정 senior 정보 조회
        Seniors senior = seniorRepository.findByIdAndGuardianId(seniorId, guardian.getId())
                .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

        // 특정 senior의 dailyActivities를 가져옴
        List<DailyActivities> activities = Optional.ofNullable(senior.getActivities())
                .orElse(new ArrayList<>());

        // 삭제할 활동 찾기
        DailyActivities activityToDelete = activities.stream()
                .filter(a -> a.getId().equals(activityId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("해당 활동을 찾을 수 없습니다."));

        // senior에서 activities 삭제
        senior.getActivities().remove(activityToDelete);
        activityToDelete.setSenior(null); // 양방향성 연관관계 해제

        // senior 저장
        seniorRepository.save(senior);

        // Entity를 DTO로 변환하여 반환
        return convertToSeniorDailyDto(senior);
    }

    /**
     * Seniors Entity를 SeniorDailyDto로 변환하는 헬퍼 메서드
     * 순환 참조를 방지하기 위해 Entity를 DTO로 변환
     */
    private SeniorDto.SeniorDailyDto convertToSeniorDailyDto(Seniors senior) {
        // 활동 기록들을 DTO로 변환
        List<SeniorDto.ActivityResponseDto> activitiesDto = Optional.ofNullable(senior.getActivities())
                .orElse(new ArrayList<>())
                .stream()
                .sorted(Comparator.comparing(DailyActivities::getCreatedAt).reversed()) // 생성일 기준 내림차순 정렬
                .map(activity -> SeniorDto.ActivityResponseDto.builder()
                        .id(activity.getId())
                        .seniorId(activity.getSenior().getId())
                        .activityDate(activity.getActivityDate())
                        .mealCount(activity.getMealCount())
                        .medicationTaken(activity.getMedicationTaken())
                        .outdoorActivity(activity.getOutdoorActivity())
                        .sleepQuality(activity.getSleepQuality())
                        .dailyNotes(activity.getDailyNotes())
                        .createdAt(activity.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return SeniorDto.SeniorDailyDto.builder()
                .id(senior.getId())
                .seniorName(senior.getSeniorName())
                .dailyActivities(activitiesDto) // Entity 대신 DTO 사용
                .build();
    }
}