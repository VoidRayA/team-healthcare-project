package com.example.backend.dto;

import com.example.backend.DB.Senior;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
    public record UserCreateRequestDto(
            Long id,
            String name,
            LocalDate birthdate,
            char gender,
            String address,
            String emergency_contact,
            String illness,
            String medication,
            String notes
    ){}
    public record UserUpdateRequestDto(Boolean completed) {}

    public record UserResponseDto(Long id, LocalDate birthdate, String name , char gender, String address,
                                  String emergency_contact, String illness, String medication,
                                  String notes, LocalDateTime created_at){
        public UserResponseDto(Senior entity) {
            this(
                    entity.getId(),
                    entity.getBirthdate(),
                    entity.getName(),
                    entity.getGender(),
                    entity.getAddress(),
                    entity.getEmergency_contact(),
                    entity.getIllness(),
                    entity.getMedication(),
                    entity.getNotes(),
                    entity.getCreated_at()
            );
        }
    }
}
