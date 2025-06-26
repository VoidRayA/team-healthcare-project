package com.example.backend.dto.login;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Guardian 정보 전송을 위한 DTO
 * 비밀번호와 같은 민감한 정보는 제외
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardianDto {

    private Long id;
    private String loginId;
    private String guardianName;
    private String phone;
    private String email;
    private String relationship;
    private String role;            // Role의 key 값 (ROLE_GUARDIAN, ROLE_ADMIN)
    private Boolean isActive;
    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;
}