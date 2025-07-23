package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.seviceDto.AlertsDto;
import com.example.backend.service.daily.AlertsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guardian/alert")
@RequiredArgsConstructor
public class AlertsController {

    private final AlertsService alertsService;

    // 알림 생성
    @PostMapping
    public ResponseEntity<?> postAlert(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody AlertsDto.AlertsCreateDto dto
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }
            AlertsDto.AlertsCreateDto createDto = alertsService.createDto(
                    dto.relatedVitalId(),
                    dto.title(),
                    dto.description(),
                    currentUser
            );

            if (createDto == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("정상 범위의 생체신호입니다. 알림이 생성되지 않았습니다.");
            }

            return ResponseEntity.ok(createDto);
        }catch (Exception e){
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }
    // 가디언의 모든 알림 조회 (페이징)
    @GetMapping
    public ResponseEntity<?> getAllAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            AlertsDto.AlertsPageDto alertsPage = alertsService.getAllAlertsByGuardian(guardian.getId(), page, size);
            return ResponseEntity.ok(alertsPage);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }
    // 가디언의 확인 알림 조회
    @GetMapping("/confirmed")
    public ResponseEntity<?> getConfirmedAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            List<AlertsDto.AlertsSearchDto> alerts = alertsService.getAllConfirmedAlertsByGuardian(guardian);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }
    // 가디언의 미확인 알림 조회
    @GetMapping("/unconfirmed")
    public ResponseEntity<?> getUnconfirmedAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            List<AlertsDto.AlertsSearchDto> alerts = alertsService.getAllUnconfirmedAlertsByGuardian(guardian);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }
    // 특정 senior의 모든 알림 조회 (페이징)
    @GetMapping("/seniors/{seniorId}")
    public ResponseEntity<?> getAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("seniorId") Integer seniorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            AlertsDto.AlertsPageDto alertsPage = alertsService.getAlerts(seniorId, guardian.getId(), page, size);
            return ResponseEntity.ok(alertsPage);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }

    // 특정 senior의 미확인 알림 조회
    @GetMapping("/seniors/{seniorId}/unconfirmed")
    public ResponseEntity<?> getSeniorUnconfirmedAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("seniorId") Integer seniorId
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            List<AlertsDto.AlertsSearchDto> alerts = alertsService.getFalseAlerts(seniorId, guardian);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }

    // 특정 senior의 확인된 알림 조회
    @GetMapping("/seniors/{seniorId}/confirmed")
    public ResponseEntity<?> getSeniorConfirmedAlerts(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("seniorId") Integer seniorId
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            List<AlertsDto.AlertsSearchDto> alerts = alertsService.getTrueAlerts(seniorId, guardian);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }

    // 알림 삭제
    @DeleteMapping("/{alertId}")
    public ResponseEntity<?> deleteAlert(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("alertId") Integer alertId
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("사용자 정보가 없습니다.");
            }

            alertsService.deleteAlert(alertId, guardian);
            return ResponseEntity.ok("알림이 성공적으로 삭제되었습니다.");
        } catch (Exception e) {
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }

}
