package com.example.backend.dto;

import com.example.backend.DB.Guardians;
import com.example.backend.DB.Seniors;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
<<<<<<< HEAD
    // 그럼 요기서 기존 User어쩌구를 Senior로 바꾼뒤(0) Guardian어쩌구들 추가. 이런식?
=======
    // Senior dtos
>>>>>>> e685af81ca3c0b5e5441c16c8f342b586eb3dd50
    public record SeniorCreateRequestDto(
            Long id,
            Integer guardianId,
            String senior_name,
            LocalDate birth_date,
            char gender,
            String address,
            String emergency_contact,
            String chronic_diseases,
            String medications,
            String notes
    ){}
    public record SeniorUpdateRequestDto(Boolean completed) {}

<<<<<<< HEAD
    public record SeniorResponseDto(Long id, LocalDate birthdate, String name , char gender, String address,
                                    String emergency_contact, String illness, String medication,
                                    String notes, LocalDateTime created_at){
        public SeniorResponseDto(Senior entity) {
=======
    public record SeniorResponseDto(Long id, Integer guardianId , String senior_name, LocalDate birth_date, char gender, String address,
                                    String emergency_contact, String chronic_diseases, String medications,
                                    String notes, LocalDateTime created_at){
        public SeniorResponseDto(Seniors entity) {
>>>>>>> e685af81ca3c0b5e5441c16c8f342b586eb3dd50
            this(
                    entity.getId(),
                    entity.getGuardianId(),
                    entity.getSenior_name(),
                    entity.getBirth_date(),
                    entity.getGender(),
                    entity.getAddress(),
                    entity.getEmergency_contact(),
                    entity.getChronic_diseases(),
                    entity.getMedications(),
                    entity.getNotes(),
                    entity.getCreated_at()
            );
        }
    }
    // Guardian dtos
    public record GuardianCreateRequestDto(
            Long id,
            String loginId,
            String guardianName,
            String phone,
            String email,
            Boolean isActive,
            String relationship
    ){}
    public record GuardianUpdateRequestDto(Boolean completed) {}

    public record GuardianResponseDto(Long id,String loginId, String guardianName,String phone,
                                      String email, Boolean isActive, String relationship,
                                      LocalDateTime created_at, LocalDateTime update_at){
        public GuardianResponseDto(Guardians entity) {
            this(
                    entity.getId(),
                    entity.getLoginId(),
                    entity.getGuardianName(),
                    entity.getPhone(),
                    entity.getEmail(),
                    entity.getIsActive(),
                    entity.getRelationship(),
                    entity.getCreated_at(),
                    entity.getUpdate_at()
            );
        }
    }
}
