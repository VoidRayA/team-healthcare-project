package com.example.backend.dto;

import com.example.backend.DB.Guardians;
//import com.example.backend.DB.Seniors;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
    // Senior dtos
    public record SeniorCreateRequestDto(
            Integer id,
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
//    public record SeniorUpdateRequestDto(Boolean completed) {}
//
//    public record SeniorResponseDto(Integer id, Integer guardianId , String senior_name, LocalDate birth_date, char gender, String address,
//                                    String emergency_contact, String chronic_diseases, String medications,
//                                    String notes, LocalDateTime created_at){
//        public SeniorResponseDto(Seniors entity) {
//            this(
//                    entity.getId(),
//                    entity.getGuardianId(),
//                    entity.getSeniorName(),
//                    entity.getBirth_date(),
//                    entity.getGender(),
//                    entity.getAddress(),
//                    entity.getEmergency_contact(),
//                    entity.getChronic_diseases(),
//                    entity.getMedications(),
//                    entity.getNotes(),
//                    entity.getCreated_at()
//            );
//        }
//    }
    // Guardian dtos
    public record GuardianCreateRequestDto(
            Integer id,
            String loginId,
            String guardianName,
            String phone,
            String email,
            Boolean isActive,
            String relationship
    ){}
    public record GuardianUpdateRequestDto(Boolean completed) {}

    public record GuardianResponseDto(Integer id,String loginId, String guardianName,String phone,
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
                    entity.getUpdated_at()
            );
        }
    }
}