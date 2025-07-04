package com.example.backend.controller;

import com.example.backend.DB.Guardians;
import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.SeniorDto;
import com.example.backend.dto.seviceDto.VitalSignsDto;
import com.example.backend.service.vital.VitalSignService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seniors/{id}/vitalSign")
@RequiredArgsConstructor
public class VitalController {

    private final VitalSignService vitalSignService;

    // 전체 생체 기록 조회
    @GetMapping
    public ResponseEntity<?> getVitalSign(
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
            @PathVariable Integer vitalId
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
            @PathVariable Integer vitalId,
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

}
