package com.example.backend.domain.dto;

import com.example.backend.domain.DB.Senior;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
    public record UserCreateRequestDto(Long id){}
    public record UserUpdateRequestDto(Boolean completed) {}

    public record UserResponseDto(Long id, LocalDate birthdate, char gender, String address,
                                  String emergency_contact, String illness, String medication,
                                  String notes, LocalDateTime created_at){
        public UserResponseDto(Senior entity) {
            this(
                    entity.getId(),
                    entity.getbirthdate(),
                    entity.getGender(),
                    entity.getAddress(),
                    entity.getEmergency_contact(),
                    entity.getillness(),
                    entity.getmedication(),
                    entity.getNotes(),
                    entity.getCreated_at()
            );
        }
    }
}
