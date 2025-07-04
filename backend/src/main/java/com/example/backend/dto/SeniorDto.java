package com.example.backend.dto;

import com.example.backend.DB.DailyActivities;
import com.example.backend.DB.Seniors;
import com.example.backend.dto.seviceDto.VitalSignsDto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Senior 관련 DTO 클래스
 */
@Builder
public class SeniorDto {

    /**
     * Senior 생성 요청 DTO
     */
    @Builder
    public record SeniorCreateRequestDto(
            String seniorName,
            LocalDate birthDate,
            Character gender,           // M/F
            String address,
            String emergencyContact,
            String chronicDiseases,     // 지병
            String medications,         // 복용 약물
            String notes,              // 특이사항
            String phone               // 노인 본인 연락처
    ) {}

    /**
     * Senior 수정 요청 DTO
     */
    @Builder
    public record SeniorUpdateRequestDto(
            String seniorName,
            Character gender,
            String address,
            String emergencyContact,
            String chronicDiseases,
            String medications,
            String notes,
            String phone,
            Boolean isActive           // 활성 상태 변경
    ) {}

    /**
     * Senior 응답 DTO
     */
    @Builder
    public record SeniorResponseDto(
            Integer id,
            Integer guardianId,        // Long -> Integer로 수정 (Entity와 일치)
            String guardianName,       // Guardian 이름 (편의상)
            String seniorName,
            LocalDate birthDate,
            Character gender,
            String address,
            String emergencyContact,
            String chronicDiseases,
            String medications,
            String notes,
            String phone,
            String dailyActivities,
            Boolean isActive,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<ActivityResponseDto> activities
    ) {
        /**
         * Seniors Entity를 SeniorResponseDto로 변환
         */
        public static SeniorResponseDto from(Seniors entity) {
            return SeniorResponseDto.builder()
                    .id(entity.getId())
                    .guardianId(entity.getGuardian().getId().intValue())  // Long을 Integer로 변환
                    .guardianName(entity.getGuardian().getGuardianName())
                    .seniorName(entity.getSeniorName())
                    .birthDate(entity.getBirthDate())
                    .gender(entity.getGender())
                    .address(entity.getAddress())
                    .emergencyContact(entity.getEmergencyContact())
                    .chronicDiseases(entity.getChronicDiseases())
                    .medications(entity.getMedications())
                    .notes(entity.getNotes())
                    .phone(entity.getPhone())
                    .dailyActivities(entity.getDailyActivities())
                    .isActive(entity.getIsActive())
                    .createdAt(entity.getCreatedAt())
                    .updatedAt(entity.getUpdatedAt())
                    .activities(entity.getActivities() != null ?
                            entity.getActivities().stream()
                                    .map(ActivityResponseDto::from)
                                    .collect(Collectors.toList()) : null)
                    .build();
        }
    }

    /**
     * Activity 응답 DTO
     */
    @Builder
    public record ActivityResponseDto(
            Integer id,
            Integer seniorId,

            @JsonFormat(pattern = "yyyy-MM-dd")
            LocalDate activityDate,

            Integer mealCount,
            Byte medicationTaken,
            Byte outdoorActivity,
            String sleepQuality,
            String dailyNotes,

            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime createdAt
    ) {
        /**
         * DailyActivities Entity를 ActivityResponseDto로 변환
         */
        public static ActivityResponseDto from(DailyActivities entity) {
            return ActivityResponseDto.builder()
                    .id(entity.getId())
                    .seniorId(entity.getSenior().getId())
                    .activityDate(entity.getActivityDate())
                    .mealCount(entity.getMealCount())
                    .medicationTaken(entity.getMedicationTaken())
                    .outdoorActivity(entity.getOutdoorActivity())
                    .sleepQuality(entity.getSleepQuality())
                    .dailyNotes(entity.getDailyNotes())
                    .createdAt(entity.getCreatedAt())
                    .build();
        }
    }

    /**
     * API 응답 Wrapper (JSON 구조 맞추기 위함)
     */
    @Builder
    public record SeniorWithActivitiesResponse(
            SeniorResponseDto senior
    ) {
        public static SeniorWithActivitiesResponse from(Seniors entity) {
            return SeniorWithActivitiesResponse.builder()
                    .senior(SeniorResponseDto.from(entity))
                    .build();
        }
    }


    /**
     * Senior 간단 정보 DTO (목록 조회용)
     */
    @Builder
    public record SeniorSimpleDto(
            Integer id,
            String seniorName,
            LocalDate birthDate,
            Character gender,
            String phone,
            Boolean isActive
    ) {
        public static SeniorSimpleDto from(Seniors entity) {
            return SeniorSimpleDto.builder()
                    .id(entity.getId())
                    .seniorName(entity.getSeniorName())
                    .birthDate(entity.getBirthDate())
                    .gender(entity.getGender())
                    .phone(entity.getPhone())
                    .isActive(entity.getIsActive())
                    .build();
        }
    }

    // 활동기록 조회용 seniorDto
    // 1인
    @Builder
    public record SeniorDailyDto(
            Integer id,
            String seniorName,
            List<ActivityResponseDto> dailyActivities
    ){
        public static SeniorDailyDto from(Seniors entity) {
            return SeniorDailyDto.builder()
                    .id(entity.getId())
                    .seniorName(entity.getSeniorName())
                    .dailyActivities(entity.getActivities() != null ?
                            entity.getActivities().stream()
                                    .map(ActivityResponseDto::from)
                                    .collect(Collectors.toList()) : null)
                    .build();
        }
    }
    // 여러명
    @Builder
    public record SeniorDailyListDto(
            List<SeniorDailyDto> seniors
    ){
        public static SeniorDailyListDto from(List<Seniors> entities) {
            return SeniorDailyListDto.builder()
                    .seniors(entities.stream()
                            .map(SeniorDailyDto::from)
                            .toList())
                    .build();
        }
    }

    // 활동기록 수정용 DTO
    public record SeniorUpdateDailyDto(
            Integer id,
            Integer activitiesId,           // 고유 ID
            Seniors senior,                 // senior 참조
            LocalDate activityDate,         // 활동 날짜
            int mealCount,                  // 식사 횟수
            Byte medicationTaken,           // 약 복용 여부
            Byte outdoorActivity,           // 외출 여부
            String sleepQuality,            // 수면상태
            String dailyNotes,              // 일일 특이사항
            LocalDateTime updatedAt
    ){
        public static SeniorUpdateDailyDto from(DailyActivities entity) {
            return new SeniorUpdateDailyDto(
                    entity.getId(),
                    entity.getId(), // activitiesId
                    entity.getSenior(),
                    entity.getActivityDate(),
                    entity.getMealCount(),
                    entity.getMedicationTaken(),
                    entity.getOutdoorActivity(),
                    entity.getSleepQuality(),
                    entity.getDailyNotes(),
                    entity.getUpdatedAt()
            );
        }
    }
    // 생체 기록 관련 Dto
    @Builder
    public record SeniorVitalDto(
            Integer id,
            String seniorName,
            List<VitalSignsDto.VitalSearchDto> vitalSigns
    ) {}

}