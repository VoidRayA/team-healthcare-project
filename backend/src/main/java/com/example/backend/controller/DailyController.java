package com.example.backend.controller;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.DailyActivitiesDto;
import com.example.backend.service.daily.DailyActivitiesService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/*
    활동 기록 관련 컨트롤러 인데 활동 기록을 senior에 집어 넣어놔서? seniorController로 할수있지 않을까?
    이 컨트롤러가 필요한가?
    근데 홈 화면에서 활동 기록 페이지를 만든다고 가정을 하면 controller를 만들어서 바로 갈수있게 만드는 편이 괜춘한거 같은데
*/
@RestController
@RequestMapping("/api/seniors/dailyActivities")
@RequiredArgsConstructor
public class DailyController {
    private final DailyActivitiesService dailyActivitiesService;

    // 활동 기록 조회
    @GetMapping
    public ResponseEntity<Page<DailyActivitiesDto>> getDaily(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(required = false) Long seniorId // 특정 Senior 지정 (선택사항)
    ) {
        Page<DailyActivitiesDto> dailyActivitiesPage = null;
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                System.out.println("Guardian 정보가 없습니다.");
                return ResponseEntity.badRequest().build();
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sort));

            // 서비스에서 처리하도록 위임

//            if (seniorId != null) {
//                // 특정 Senior의 활동만 조회
//                dailyActivitiesPage = dailyActivitiesService.getDailyActivitiesBySenior(
//                        guardian, seniorId, pageable);
//            } else {
//                // Guardian이 관리하는 모든 Senior들의 활동 조회
//                dailyActivitiesPage = dailyActivitiesService.getAllDailyActivitiesByGuardian(
//                        guardian, pageable);
//            }
//
//            System.out.println("Guardian " + guardian.getLoginId() + "의 DailyActivities 조회 완료 - " +
//                    "총 " + dailyActivitiesPage.getTotalElements() + "개");
//
//            return ResponseEntity.ok(dailyActivitiesPage);

        } catch (IllegalArgumentException e) {
            System.err.println("잘못된 파라미터: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("DailyActivities 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok(dailyActivitiesPage);
    }
    // 활동 기록 생성

    // 활동 기록 삭제

}
