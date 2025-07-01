package com.example.backend.dto.login;

import com.example.backend.dto.SeniorDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 로그인 성공 시 반환되는 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDto {

    private String accessToken;     // JWT 토큰
    private String tokenType;       // 토큰 타입 (Bearer)
    private String loginId;         // 사용자 로그인 ID
    private String guardianName;    // 사용자 이름
    private String role;            // 사용자 역할 (ROLE_GUARDIAN, ROLE_ADMIN)
    private List<SeniorDto.SeniorResponseDto> senior;       // 사용자와 연관되어있는 노인
}