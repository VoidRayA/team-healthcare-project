package com.example.backend.controller;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.repository.SeniorRepository;
import com.example.backend.service.daily.DailyActivitiesService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api/seniors/{id}/dailyActivities")
@RequiredArgsConstructor
public class DailyController {
    private final DailyActivitiesService dailyActivitiesService;
    private SeniorRepository seniorRepository;

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
            try {
                    Guardians guardian = currentUser.getGuardians();
                    if (guardian == null) {
                        System.out.println("Guardian 정보가 없습니다.");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
                    }
                    if (seniorId == null) {
                        System.out.println("Senior 정보가 없습니다");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("senior의 정보가 없습니다.");
                    }

                    System.out.println("요청한 Senior ID: " + seniorId);

                    // Guardian 정보 전달
                    SeniorDto.SeniorDailyDto dailyDto = dailyActivitiesService.createDaily(seniorId, dto, guardian);
                    return ResponseEntity.ok(dailyDto);

            }catch (Exception e){
                System.err.println("활동 기록 생성 중 오류 발생: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("활동 기록 생성 중 오류가 발생했습니다.");
            }
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
}
