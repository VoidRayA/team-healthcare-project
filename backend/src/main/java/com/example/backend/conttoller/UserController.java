package com.example.backend.conttoller;

import com.example.backend.dto.UserDtos;
import com.example.backend.service.UserService;
import org.springframework.security.oauth2.jwt.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/senior")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    // senior 조회
    @GetMapping
    public ResponseEntity<List<UserDtos.SeniorResponseDto>> getMySenior(
            @AuthenticationPrincipal Jwt principal){
        return ResponseEntity.ok(userService.findMySenior(principal.getClaimAsString("email"))); // 이부분 해석 필요
    }
    // senior 추가

//    @PostMapping
//    public ResponseEntity<UserDtos.UserResponseDto> createSenior(
//            @RequestBody UserDtos.UserCreateRequestDto requestDto,
//            @AuthenticationPrincipal Jwt principal) {
//        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(
//                requestDto,
//                principal.getClaimAsString("email")
//
//        ));
//    }
    @PostMapping
    public ResponseEntity<UserDtos.SeniorResponseDto> createSenior(
            @RequestBody UserDtos.SeniorCreateRequestDto requestDto,
            @AuthenticationPrincipal Jwt principal) {
        String email = principal.getClaimAsString("email");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(requestDto, email));
    }
    // senior 약 복용 완료 / 미완료 토글
    @PatchMapping("/{id}")
    public ResponseEntity<UserDtos.SeniorResponseDto > toggleSenior(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal){
        return ResponseEntity.ok(userService.toggleSenior(id, principal.getClaimAsString("email")));
    }
    // senior 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSenior(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        userService.deleteSenior(id, principal.getClaimAsString("email"));
        return ResponseEntity.noContent().build();
    }

}
