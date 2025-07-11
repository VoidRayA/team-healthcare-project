package com.example.backend.dto.seviceDto;

import com.example.backend.DB.Alerts;
import com.example.backend.DB.VitalSigns;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

/*
    알림 전송을 위한 DTO 클래스
    타입을 emergency/warning/info로 나눠서
*/
public class AlertsDto {

    // 알림 생성 DTO
    public record AlertsCreateDto(
            String alertType,
            String title,
            String description,
            Integer seniorId,
            Integer relatedVitalId
    ) {}

    // 알림 확인 용 DTO
    public record AlertsConfirmationDto(
            Integer id,
            String alertType,
            String title,
            String description,
            boolean isConfirmed,
            List<VitalSigns> vitalSigns,
            LocalDateTime createdAt
    ){}

    // 알림 응답 DTO - 특정 생체신호만 조회
    @Builder
    public record AlertsSearchDto(
            Integer id,
            String alertType,
            String title,
            String description,
            VitalSigns vitalSigns,  // 알림과 연관된 특정 생체신호만
            LocalDateTime createdAt,
            boolean isConfirmed,
            String confirmedByName,       // 확인한 보호자 이름
            LocalDateTime confirmedAt
    ){
        public static AlertsSearchDto from(Alerts entity){
            return new AlertsSearchDto(
                    entity.getId(),
                    entity.getAlertType(),
                    entity.getTitle(),
                    entity.getDescription(),
                    // 알림과 연관된 특정 생체신호만 반환
                    entity.getVitalSigns(),
                    entity.getCreatedAt(),
                    entity.isConfirmed(),
                    entity.getConfirmedBy() != null ?
                            entity.getConfirmedBy().getGuardianName() : null,
                    entity.getConfirmedAt()
            );
        }
    }

    // 페이징된 알림 조회 전용 DTO
    public record AlertsPageDto(
            List<AlertsSearchDto> alerts,
            int currentPage,
            int totalPages,
            long totalElements,
            boolean hasNext,
            boolean hasPrevious
    ) {
        public static AlertsPageDto from(Page<Alerts> alertsPage) {
            return new AlertsPageDto(
                    alertsPage.getContent().stream()
                            .map(AlertsSearchDto::from)
                            .toList(),
                    alertsPage.getNumber(),
                    alertsPage.getTotalPages(),
                    alertsPage.getTotalElements(),
                    alertsPage.hasNext(),
                    alertsPage.hasPrevious()
            );
        }
    }

    // 만약 여러 생체신호가 필요한 경우를 위한 대안 DTO
    @Builder
    public record AlertsSearchDtoWithMultipleVitalSigns(
            Integer id,
            String alertType,
            String title,
            String description,
            List<VitalSigns> vitalSigns,  // 여러 생체신호 지원
            LocalDateTime createdAt,
            boolean isConfirmed,
            String confirmedByName,
            LocalDateTime confirmedAt
    ){
        public static AlertsSearchDtoWithMultipleVitalSigns from(Alerts entity){
            return new AlertsSearchDtoWithMultipleVitalSigns(
                    entity.getId(),
                    entity.getAlertType(),
                    entity.getTitle(),
                    entity.getDescription(),
                    // 알림과 연관된 생체신호만 (단일 생체신호를 리스트로 변환)
                    entity.getVitalSigns() != null ?
                            List.of(entity.getVitalSigns()) : List.of(),
                    entity.getCreatedAt(),
                    entity.isConfirmed(),
                    entity.getConfirmedBy() != null ?
                            entity.getConfirmedBy().getGuardianName() : null,
                    entity.getConfirmedAt()
            );
        }
    }

}
