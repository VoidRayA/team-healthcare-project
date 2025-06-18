package com.example.backend.domain.dto;

import com.example.backend.domain.DB.Senior;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
    public record UserCreateRequestDto(Long id){}
    public record UserUpdateRequestDto(Boolean completed) {}

    public record UserResponseDto(Long id, LocalDate 생년월일, char gender, String address,
                                  String emergency_contact, String 지병, String 복용중인약물,
                                  String notes, LocalDateTime created_at){
        public UserResponseDto(Senior entity) {
            this(
                    entity.getId(),
                    entity.get생년월일(),
                    entity.getGender(),
                    entity.getAddress(),
                    entity.getEmergency_contact(),
                    entity.get지병(),
                    entity.get복용중인약물(),
                    entity.getNotes(),
                    entity.getCreated_at()
            );
        }
    }
}
