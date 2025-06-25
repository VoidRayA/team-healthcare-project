package com.example.backend.controller;

import java.util.Collections;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.UserDtos;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // senior 조회
    @GetMapping("/senior")
    public ResponseEntity<List<UserDtos.SeniorResponseDto>> getMySenior(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        try {
            String userName = userDetails.getSeniors().getSeniorName();
            List<UserDtos.SeniorResponseDto> result = userService.findMySenior(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    // guardian 조회
    @GetMapping("/guardian")
    public ResponseEntity<List<UserDtos.GuardianResponseDto>> getMyGuardian(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ){
        try {
            String userName = userDetails.getGuardians().getGuardianName();
            List<UserDtos.GuardianResponseDto> result = userService.findMyGuardian(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    // senior 추가
    @PostMapping("/senior")
    public ResponseEntity<UserDtos.SeniorResponseDto> createSenior(
            @RequestBody UserDtos.SeniorCreateRequestDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer id = userDetails.getSeniors().getId();
        String name = userDetails.getUsername();
        return ResponseEntity.ok(userService.createSenior(dto, id, name));
    }

    // guardian 추가
    @PostMapping("/guardian")
    public ResponseEntity<UserDtos.GuardianResponseDto> createGuardian(
            @RequestBody UserDtos.GuardianCreateRequestDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        Integer id = userDetails.getGuardians().getId();
        String name = userDetails.getUsername();
        return ResponseEntity.ok(userService.createGuardian(dto, id, name));
    }

    // senior 약 복용 완료 / 미완료 토글
    @PatchMapping("/senior/{id}")
    public ResponseEntity<UserDtos.SeniorResponseDto> toggleSenior(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails){
        return ResponseEntity.ok(userService.toggleSenior(id, userDetails.getSeniors().getMedications()));
    }

    // senior 삭제
    @DeleteMapping("/senior/{id}")
    public ResponseEntity<Void> deleteSenior(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteSenior(id, userDetails.getSeniors().getSeniorName());
        return ResponseEntity.noContent().build();
    }

    // guardian 삭제
    @DeleteMapping("/guardian/{id}")
    public ResponseEntity<Void> deleteGuardian(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deleteGuardian(id, userDetails.getGuardians().getEmail());
        return ResponseEntity.noContent().build();
    }
}