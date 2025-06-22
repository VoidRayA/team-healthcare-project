package com.example.backend.dto;

import com.example.backend.DB.Senior;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDtos {
    // 그럼 요기서 기존 User어쩌구를 Senior로 바꾼뒤(0) Guardian어쩌구들 추가. 이런식?
    public record SeniorCreateRequestDto(
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
    public record SeniorUpdateRequestDto(Boolean completed) {}

    public record SeniorResponseDto(Long id, LocalDate birthdate, String name , char gender, String address,
                                    String emergency_contact, String illness, String medication,
                                    String notes, LocalDateTime created_at){
        public SeniorResponseDto(Senior entity) {
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
