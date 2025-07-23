package com.example.backend.controller;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.DB.UserSetting;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.service.daily.DailyActivitiesService;
import com.example.backend.service.UserSettingService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
public class DailyController {
    private final DailyActivitiesService dailyActivitiesService;
    private final SeniorRepository seniorRepository;
    private final UserSettingService userSettingService;

    // =================================================================
    // UserSetting 드롭다운 API들 (2025.07.08 신규 추가)
    // =================================================================

    /**
     * 드롭다운 항목 조회
     * 새로운 DB 구조에 맞게 수정
     */
    @GetMapping("/api/user-settings/dropdown-items")
    public ResponseEntity<List<String>> getDropdownItems(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "1") Long guardianId) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            // 새로운 서비스 메서드 호출 - String 리스트 반환
            List<String> dropdownItems = userSettingService.getDropdownItems(guardian.getId());
            
            System.out.println("=== 드롭다운 API 디버깅 ===");
            System.out.println("Guardian ID: " + guardian.getId());
            System.out.println("드롭다운 항목 개수: " + dropdownItems.size());
            System.out.println("드롭다운 항목들: " + dropdownItems);
            
            return ResponseEntity.ok(dropdownItems);
        } catch (Exception e) {
            System.err.println("드롭다운 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 드롭다운 항목 추가 API
     * 사용자가 새로운 항목을 추가할 때 사용
     */
    @PostMapping("/api/user-settings/dropdown-item")
    public ResponseEntity<Map<String, Object>> addDropdownItem(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, String> requestData) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "사용자 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            String itemValue = requestData.get("itemValue");
            String category = requestData.getOrDefault("category", "일정관리");
            
            System.out.println("=== 드롭다운 항목 추가 API 디버깅 ===");
            System.out.println("Guardian ID: " + guardian.getId());
            System.out.println("추가할 항목: " + itemValue);
            System.out.println("카테고리: " + category);
            
            // 중복 체크
            Optional<UserSetting> existing = userSettingService.findByValueAndGuardianId(itemValue, guardian.getId());
            if (existing.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "이미 존재하는 항목입니다.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            
            // 새 항목 저장
            UserSetting newItem = userSettingService.saveOrUpdateDropdownItem(guardian.getId(), category, itemValue);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "항목이 추가되었습니다.");
            response.put("item", newItem.getValues());
            response.put("id", newItem.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("항목 추가 오류: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 일일 활동 저장
     */
    @PostMapping("/api/daily-activities/save")
    public ResponseEntity<Map<String, Object>> saveDailyActivities(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, Object> requestData) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> selectedItems = (Map<String, String>) requestData.get("selectedItems");
            String date = (String) requestData.get("date");
            
            System.out.println("=== 일일 활동 저장 API 디버깅 ===");
            System.out.println("선택된 항목들: " + selectedItems);
            System.out.println("날짜: " + date);
            
            // TODO: 실제 저장 로직 구현
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "저장되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("저장 오류: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * 드롭다운 항목 삭제 API
     * 사용자가 기존 항목을 삭제할 때 사용
     */
    @DeleteMapping("/api/user-settings/dropdown-item/{id}")
    public ResponseEntity<Map<String, Object>> deleteDropdownItem(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long id) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "사용자 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            System.out.println("=== 드롭다운 항목 삭제 API 디버깅 ===");
            System.out.println("Guardian ID: " + guardian.getId());
            System.out.println("삭제할 항목 ID: " + id);
            
            // 삭제 수행
            boolean deleted = userSettingService.deleteDropdownItem(id);
            
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("success", true);
                response.put("message", "항목이 삭제되었습니다.");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "삭제할 항목을 찾을 수 없습니다.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
        } catch (Exception e) {
            System.err.println("항목 삭제 오류: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다.");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * 드롭다운 항목 상세 조회 API (ID 포함)
     * 프론트엔드에서 삭제를 위해 ID 정보가 필요할 때 사용
     */
    @GetMapping("/api/user-settings/dropdown-items-with-id")
    public ResponseEntity<List<Map<String, Object>>> getDropdownItemsWithId(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "1") Long guardianId) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            // ID와 함께 항목 조회
            List<Map<String, Object>> dropdownItems = userSettingService.getDropdownItemsWithId(guardian.getId());
            
            System.out.println("=== ID 포함 드롭다운 API 디버깅 ===");
            System.out.println("Guardian ID: " + guardian.getId());
            System.out.println("드롭다운 항목 개수: " + dropdownItems.size());
            
            return ResponseEntity.ok(dropdownItems);
        } catch (Exception e) {
            System.err.println("ID 포함 드롭다운 조회 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // =================================================================
    // 기존 DailyActivities API들
    // =================================================================
    
    /**
     * 홈 화면용 최근 활동 현황 API
     */
    @GetMapping("/api/seniors/{id}/dailyActivities/recent-activities")
    public ResponseEntity<?> getRecentActivities(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id, // 경로 상 필요하지만 실제로는 사용하지 않음 (0 전달)
            @RequestParam(defaultValue = "5") int limit // 반환할 최대 활동 개수
    ) {
        try {
            // 현재 로그인한 Guardian 정보 얻기
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            // DailyActivitiesService를 통해 최근 활동 현황 조회
            // 반환 형태: List<Map<String, Object>> - 각 Map에는 time, user, activity, status 포함
            List<Map<String, Object>> recentActivities = dailyActivitiesService.getRecentActivitiesForHome(guardian, limit);
            return ResponseEntity.ok(recentActivities);

        } catch (Exception e) {
            System.err.println("최근 활동 현황 조회 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("최근 활동 현황 조회 중 오류가 발생했습니다.");
        }
    }

    // 활동 기록 조회
    @GetMapping("/api/seniors/{id}/dailyActivities/{activityId}")
    public ResponseEntity<?> getDaily(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable Integer activityId,   // 특정 활동 기록 ID
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                System.out.println("사용자 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            SeniorDto.SeniorDailyDto activitiesDto = dailyActivitiesService.getDaily(id, activityId, guardian);
            return ResponseEntity.ok(activitiesDto);

        }catch (Exception e) {
            System.err.println("활동 기록 조회 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("활동 기록 조회 중 오류가 발생했습니다.");
        }
    }
    
    // 전체 활동 기록 조회
    @GetMapping("/api/seniors/{id}/dailyActivities")
    public ResponseEntity<?> getDailyList(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id, // seniors의 id
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                System.out.println("Guardian 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            // =================================================================
            // 디버깅 로그 추가
            // =================================================================
            System.out.println("=== GET Daily List 디버깅 ===");
            System.out.println("요청된 Senior ID: " + id);
            System.out.println("현재 Guardian ID: " + guardian.getId());
            System.out.println("Guardian 이름: " + guardian.getGuardianName());
            
            // Senior 소유권 직접 확인
            Optional<Seniors> seniorCheck = seniorRepository.findByIdAndGuardianId(id, guardian.getId());
            System.out.println("Senior 소유권 확인 결과: " + (seniorCheck.isPresent() ? "소유함" : "소유 안함"));
            if (seniorCheck.isEmpty()) {
                System.out.println("권한 없음! 403 반환");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("해당 Senior에 대한 접근 권한이 없습니다.");
            }
            // =================================================================

            // 전체 활동 기록 목록 조회
            SeniorDto.SeniorDailyListDto dailyListDto = dailyActivitiesService.getListDaily(id, guardian);
            return ResponseEntity.ok(dailyListDto);

        } catch (Exception e) {
            System.err.println("활동 기록 목록 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("활동 기록 목록 조회 중 오류가 발생했습니다.");
        }
    }

    // 활동 기록 생성
    @PostMapping("/api/seniors/{id}/dailyActivities")
    public ResponseEntity<?> postDaily(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @PathVariable("id") Integer seniorId,
            @RequestBody DailyActivitiesDto dto
    ){
        System.out.println("\n\n=== POST DAILY 메서드 시작 ===");
        System.out.println("요청 URL: /api/seniors/" + seniorId + "/dailyActivities");
        
        // 디버깅용 날짜 출력
        LocalDate today = LocalDate.now();
        System.out.println("오늘 날짜: " + today);
        
        // =================================================================
        // 새로 추가된 부분: 애플리케이션 레벨에서 중복 체크
        // =================================================================
        // 기존 코드는 DB 제약조건에만 의존해서 AUTO_INCREMENT가 낭비되었음
        // 새로운 방식: DB에 INSERT 하기 전에 미리 중복 체크하여 차단
        try {
            // Guardian 인증 체크 (기존 코드와 동일)
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }
            
            // 활동 날짜 결정: DTO에 날짜가 없으면 오늘 날짜 사용
            LocalDate activityDate = dto.getActivityDate() != null ? dto.getActivityDate() : today;
            
            // ★ 핵심 추가 기능: 중복 기록 사전 체크
            // 이 부분이 AUTO_INCREMENT 낭비를 방지하는 핵심 로직
            boolean isDuplicate = dailyActivitiesService.isDuplicateRecord(seniorId, activityDate, guardian);

            if (isDuplicate) {
                // 중복이 발견되면 DB에 INSERT하지 않고 즉시 409 오류 반환
                // 이로 인해 AUTO_INCREMENT 값이 소모되지 않음
                System.out.println("중복 감지! Senior " + seniorId + ", Date: " + activityDate);
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("해당 날짜(" + activityDate + ")의 활동 기록이 이미 존재합니다.");
            }
            
            System.out.println("중복 없음 - 진행");
            
            // 중복이 없으면 기존 코드와 동일하게 DB에 저장
            SeniorDto.SeniorDailyDto dailyDto = dailyActivitiesService.createDaily(seniorId, dto, guardian);
            return ResponseEntity.ok(dailyDto);
            
        } catch (Exception e){
            // 예외 처리 (기존 코드와 동일)
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
        // =================================================================
        // 중복 체크 추가 부분 끝
        // =================================================================
    }

    // 활동 기록 삭제
    @DeleteMapping("/api/seniors/{id}/dailyActivities/{activityId}")
    public ResponseEntity<?> deleteDaily(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable Integer activityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                System.out.println("Guardian 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }
            // 특정 senior 정보 조회
            Seniors senior = seniorRepository.findByIdAndGuardianId(id, guardian.getId())
                    .orElseThrow(() -> new EntityNotFoundException("해당 Senior를 찾을 수 없습니다."));

            // 특정 senior의 dailyActivities를 가져옴
            List<DailyActivities> activities = Optional.ofNullable(senior.getActivities())
                    .orElse(new ArrayList<>());

            DailyActivities activityToDelete = activities.stream()
                    .filter(a -> a.getId().equals(activityId))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("해당 활동기록을 찾을 수 없습니다."));

            dailyActivitiesService.deleteDaily(id, activityId, guardian);
            return ResponseEntity.ok("활동 기록이 성공적으로 삭제되었습니다");

        }catch (Exception e) {
            System.err.println("활동 기록 삭제 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("활동 기록 삭제 중 오류가 발생했습니다.");
        }
    }
    
    // 활동기록 수정
    @PutMapping("/api/seniors/{id}/dailyActivities/{activityId}")
    public ResponseEntity<SeniorDto.SeniorUpdateDailyDto> updateDailyActivity(
            @PathVariable Integer seniorId,
            @PathVariable Integer activityId,
            @RequestBody SeniorDto.SeniorUpdateDailyDto updateDto){
        SeniorDto.SeniorUpdateDailyDto result = dailyActivitiesService.updateDaily(seniorId, activityId, updateDto);
        return ResponseEntity.ok(result);
    }
}