package com.example.backend.dto.login;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 회원가입 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDto {

    private String loginId;         // 로그인 ID
    private String loginPw;         // 로그인 비밀번호
    private String guardianName;    // 보호자 이름
    private String phone;           // 전화번호
    private String email;           // 이메일
    private String relationship;    // 관계 (아버지, 어머니 등)
}