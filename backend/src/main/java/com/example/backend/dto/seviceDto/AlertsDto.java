package com.example.backend.dto.seviceDto;

import com.example.backend.DB.Alerts;
import com.example.backend.DB.VitalSigns;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/*
    알림 전송을 위한 DTO 클래스
    타입을 emergency/warning/info로 나눠서
*/
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    // 알림 응답  DTO
    public record AlertsSearchDto(
            Integer id,
            String alertType,
            String title,
            String description,
            List<VitalSigns> vitalSigns,
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
                    // 해당 시니어의 모든 생체신호를 가져옴
                    getSeniorVitalSigns(entity),
                    entity.getCreatedAt(),
                    entity.isConfirmed(),
                    entity.getConfirmedBy() != null ?
                            entity.getConfirmedBy().getGuardianName() : null,
                    entity.getConfirmedAt()
            );
        }


        // 해당 시니어의 모든 생체신호 리스트를 안전하게 가져옴
        private static List<VitalSigns> getSeniorVitalSigns(Alerts entity) {
            if (entity.getSeniors() == null) {
                return List.of();
            }

            // 시니어의 모든 생체신호를 반환
            List<VitalSigns> seniorVitalSigns = entity.getSeniors().getVitalSigns();
            return seniorVitalSigns != null ? seniorVitalSigns : List.of();
        }
    }
}
