package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.VitalSigns;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.VitalSignsDto;
import com.example.backend.repository.VitalSignRepository;
import com.example.backend.service.vital.VitalSignService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seniors/{id}/vitalSign")
@RequiredArgsConstructor
public class VitalController {

    private final VitalSignService vitalSignService;
    private final VitalSignRepository vitalSignRepository;

    // 전체 생체 기록 조회
    @GetMapping
    public ResponseEntity<?> getVitalSignList(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }

            SeniorDto.SeniorVitalDto seniorVitalDto = vitalSignService.searchVital(id, guardian);
            return ResponseEntity.ok(seniorVitalDto);
        }catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("접근 권한이 없습니다.");
        } catch (Exception e){
            System.err.println("생체 기록 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 조회 중 오류가 발생했습니다.");
        }
    }
    // 특정 날짜 생체 기록 조회
    @GetMapping("/date/{date}")
    public ResponseEntity<?> getVitalSignsByDate(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }

            List<VitalSigns> vitalSignsList = vitalSignRepository.findBySeniorIdAndMeasurementDate(id, date);

            if (vitalSignsList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 날짜의 생체기록이 없습니다.");
            }

            List<VitalSignsDto.VitalSearchDto> result = vitalSignsList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 조회 중 오류가 발생했습니다.");
        }
    }
    // 특정 날짜 범위 조회
    @GetMapping("/date/range")
    public ResponseEntity<?> getVitalSignsByDateRange(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate start,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }

            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59);

            List<VitalSigns> vitalSignsList = vitalSignRepository.findBySeniorIdAndMeasurementTimeBetween(
                    id, startDateTime, endDateTime);

            if (vitalSignsList.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("해당 기간의 생체기록이 없습니다.");
            }

            List<VitalSignsDto.VitalSearchDto> result = vitalSignsList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 조회 중 오류가 발생했습니다.");
        }
    }
    // 특정 날짜의 특정 생체 기록 조회
    @GetMapping("/date/{date}/{vitalId}")
    public ResponseEntity<?> getVitalSignByDateAndId(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date,
            @PathVariable Long vitalId
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }

            VitalSigns vitalSigns = vitalSignRepository.findBySeniorIdAndDateAndId(id, date, vitalId)
                    .orElseThrow(() -> new EntityNotFoundException("해당 날짜의 VitalSign을 찾을 수 없습니다."));

            VitalSignsDto.VitalSearchDto result = convertToDto(vitalSigns);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 조회 중 오류가 발생했습니다.");
        }
    }
    // 생체 기록 생성
    @PostMapping
    public ResponseEntity<?> postVital(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable("id") Integer seniorId,
            @RequestBody VitalSignsDto.VitalCreateDto dto
            ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }
            SeniorDto.SeniorVitalDto seniorVitalDto = vitalSignService.createVital(seniorId, dto, guardian);
            return ResponseEntity.status(HttpStatus.CREATED).body(seniorVitalDto);
        }catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("접근 권한이 없습니다.");
        } catch (Exception e){
            System.err.println("오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("오류가 발생했습니다.");
        }
    }
    // 생체 기록 삭제
    @DeleteMapping("/{vitalId}")
    public ResponseEntity<?> deleteVital(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable Long vitalId
    ){
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("guardian 정보가 없습니다.");
            }

            SeniorDto.SeniorVitalDto seniorVitalDto = vitalSignService.deleteVital(id, vitalId, guardian);
            return ResponseEntity.ok(seniorVitalDto);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("접근 권한이 없습니다.");
        } catch (Exception e) {
            System.err.println("생체 기록 삭제 중 오류 발생: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 삭제 중 오류가 발생했습니다.");
        }
    }
    // 생체 기록 수정
    @PutMapping("/{vitalId}")
    public ResponseEntity<?> updateVital(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Integer id,
            @PathVariable Long vitalId,
            @RequestBody VitalSignsDto.VitalUpdateDto updateDto
    ) {
        try {
            Guardians guardian = currentUser.getGuardians();
            if (guardian == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("인증 정보가 없습니다.");
            }

            SeniorDto.SeniorVitalDto seniorVitalDto = vitalSignService.updateVital(id, vitalId, updateDto,  guardian);
            return ResponseEntity.ok(seniorVitalDto);

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("접근 권한이 없습니다.");
        } catch (Exception e) {
            System.err.println("생체 기록 수정 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("생체 기록 수정 중 오류가 발생했습니다.");
        }
    }

    // 날짜 조회 도우미 메서드
    private VitalSignsDto.VitalSearchDto convertToDto(VitalSigns vitalSigns) {
        return VitalSignsDto.VitalSearchDto.builder()
                .id(vitalSigns.getId())
                .measurementTime(vitalSigns.getMeasurementTime())
                .bloodPressureHigh(vitalSigns.getBloodPressureHigh())
                .bloodPressureLow(vitalSigns.getBloodPressureLow())
                .heartRate(vitalSigns.getHeartRate())
                .bloodSugar(vitalSigns.getBloodSugar())
                .bodyTemperature(vitalSigns.getBodyTemperature())
                .isNormal(vitalSigns.isNormal())
                .notes(vitalSigns.getNotes())
                .build();
    }

}
