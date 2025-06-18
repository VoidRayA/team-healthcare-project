package com.example.test.dto;

import com.example.test.domain.TestSenior;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TestDtos {
    public record TestCreateRequestDto(long id){}
    public record TestUpdateRequestDto(Boolean completed) {}

    public record TestResponseDto(Long id, LocalDate 생년월일, char gender, String address,
                                  String emergency_contact, String 지병, String 복용중인약물,
                                  String notes, LocalDateTime created_at){
        public TestResponseDto(TestSenior entity) {
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
