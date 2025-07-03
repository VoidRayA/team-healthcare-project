package com.example.backend.controller;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.service.SeniorService;
import com.example.backend.service.daily.DailyActivitiesService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/seniors/{id}/dailyActivities")
@RequiredArgsConstructor
public class DailyController {
    private final DailyActivitiesService dailyActivitiesService;
    private final SeniorRepository seniorRepository;

    // =================================================================
    // 홈 화면용 최근 활동 현황 API 추가 (2025.07.02 신규 추가)
    // 목적: 프론트엔드 홈 화면의 '최근 활동 현황' 섹션에 데이터 제공
    // 경로: /api/seniors/0/dailyActivities/recent-activities (주의: Senior ID는 사용안함)
    // 방식: Guardian이 관리하는 모든 Senior의 최근 활동을 취합하여 반환
    // =================================================================
    @GetMapping("/recent-activities")
    public ResponseEntity<?> getRecentActivities(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id, // 경로 상 필요하지만 실제로는 사용하지 않음 (0 전달)
            @RequestParam(defaultValue = "5") int limit // 반환할 최대 활동 개수
    ) {
        try {
            // 현재 로그인한 Guardian 정보 얻기
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
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
    // =================================================================

    // 활동 기록 조회
    @GetMapping("/{activityId}")
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
                System.out.println("Guardian 정보가 없습니다.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
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
    @GetMapping
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
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
    @PostMapping
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
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
    @DeleteMapping("/{activityId}")
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
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
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
    @PutMapping("/{activityId}")
    public ResponseEntity<SeniorDto.SeniorUpdateDailyDto> updateDailyActivity(
            @PathVariable Integer seniorId,
            @PathVariable Integer activityId,
            @RequestBody SeniorDto.SeniorUpdateDailyDto updateDto){
        SeniorDto.SeniorUpdateDailyDto result = dailyActivitiesService.updateDaily(seniorId, activityId, updateDto);
        return ResponseEntity.ok(result);
    }
}
