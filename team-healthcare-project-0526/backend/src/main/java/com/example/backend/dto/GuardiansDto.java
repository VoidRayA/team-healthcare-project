package com.example.backend.dto;

import com.example.backend.DB.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public class GuardiansDto {

    /*
         Guardian 생성 요청 DTO
     */
    public record GuardianCreateRequestDto(
            @NotBlank(message = "로그인 ID는 필수입니다")
            String loginId,
            @NotBlank(message = "비밀번호는 필수입니다")
            String loginPw,
            @NotBlank(message = "보호자 이름은 필수입니다")
            String guardianName,
            String phone,
            String email,
            String relationship
    ){}

    /*
          Guardian 조회 요청 DTO
      */
    public record GuardianSearchDto(
            String loginId,
            String guardianName,
            String phone,
            String email,
            String relationship,
            Role role,
            Boolean isActive
    ){}
    /*
        Guardian 업데이트 요청 DTO
    */
    public record GuardianUpdateDto(
            String guardianName,
            String phone,
            String email,
            String relationship,
            Role role,
            Boolean isActive
    ){}
    /*
        Guardian 삭제 요청 DTO
     */
    public record GuardianDeleteDto(
            @NotBlank(message = "삭제할 Guardian ID는 필수입니다")
            Integer id
    ){}

}
