package com.example.backend.conttoller;

import com.example.backend.dto.UserDtos;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // 모든 보호자 조회
    @GetMapping("/guardians")
    public ResponseEntity<List<UserDtos.GuardianResponseDto>> getAllGuardians(){
        List<UserDtos.GuardianResponseDto> result = userService.findAllGuardians();
        return ResponseEntity.ok(result);
    }

    // 특정 보호자 조회 (loginId로)
    @GetMapping("/guardians/{loginId}")
    public ResponseEntity<UserDtos.GuardianResponseDto> getGuardianByLoginId(@PathVariable String loginId) {
        return userService.findByLoginId(loginId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 보호자 존재 여부 확인 (POSTMAN 테스트용)
    @GetMapping("/guardians/exists/{loginId}")
    public ResponseEntity<Boolean> checkGuardianExists(@PathVariable String loginId) {
        boolean exists = userService.existsByLoginId(loginId);
        return ResponseEntity.ok(exists);
    }

    // 보호자 생성
    @PostMapping("/guardians")
    public ResponseEntity<UserDtos.GuardianResponseDto> createGuardian(
            @RequestBody UserDtos.GuardianCreateRequestDto dto) {
        UserDtos.GuardianResponseDto result = userService.createGuardian(dto);
        return ResponseEntity.ok(result);
    }

    // 보호자 삭제
    @DeleteMapping("/guardians/{id}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable Integer id) {
        userService.deleteGuardian(id);
        return ResponseEntity.ok().build();
    }
}