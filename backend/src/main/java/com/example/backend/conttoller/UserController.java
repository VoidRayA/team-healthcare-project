package com.example.backend.conttoller;

import java.util.Collections;

import com.example.backend.config.CustomUserDetails;
import com.example.backend.dto.UserDtos;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
//    private final CustomUserDetails userDetails;

    // senior 조회
    @GetMapping("/senior")
    public ResponseEntity<List<UserDtos.SeniorResponseDto>> getMySenior(){
//        String userName = "김춘자";
//        return ResponseEntity.ok(userService.findMySenior(userName));
        try {
            String userName = "김춘자";
            List<UserDtos.SeniorResponseDto> result = userService.findMySenior(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }
    // guardian 조회
    @GetMapping("/guardian")
    public ResponseEntity<List<UserDtos.GuardianResponseDto>> getMyGuardian(){
        try {
            String userName = "김가을";
            List<UserDtos.GuardianResponseDto> result = userService.findMyGuardian(userName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }
    // senior 추가
//    @PostMapping("/senior")
//    public ResponseEntity<UserDtos.SeniorResponseDto> createSenior(
//            @RequestBody UserDtos.SeniorCreateRequestDto dto,
//            @AuthenticationPrincipal UserDetails userDetails) {
//        Integer id = userDetails.getUserId();
//        String name = userDetails.getUsername();
//        return ResponseEntity.ok(userService.createSenior(dto, id, name));
//    }
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
//    @PatchMapping("/{id}")
//    public ResponseEntity<UserDtos.SeniorResponseDto> toggleSenior(
//            @PathVariable Long id,
//            @AuthenticationPrincipal Jwt principal){
//        return ResponseEntity.ok(userService.toggleSenior(id, principal.getClaimAsString("email")));
//    }
    // senior 삭제
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteSenior(
//            @PathVariable Long id,
//            @AuthenticationPrincipal Jwt principal) {
//        userService.deleteSenior(id, principal.getClaimAsString("email"));
//        return ResponseEntity.noContent().build();
//    }
}
