package com.example.backend.dto.seviceDto;

import com.example.backend.DB.VitalSigns;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;


/*
    생체 정보 Dto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalSignsDto {
    private Integer id;
    private LocalDateTime measurementTime;  // 측정시간
    private Integer bloodPressureHigh;          // 수축기 혈압
    private Integer bloodPressureLow;         // 이완기 혈압
    private Integer heartRate;                 // 심박수
    private Integer bloodSugar;                // 혈당
    private BigDecimal bodyTemperature;     // 체온
    private boolean isNormal;               // 정상 범위 여부
    private String notes;                   // 특이사항
    private LocalDateTime createdAt;        // 기록 시간

    // 생성 요청을 위한 Dto
    public record VitalCreateDto(
            LocalDateTime measurementTime,  // 측정시간
            Integer bloodPressureHigh,          // 수축기 혈압
            Integer bloodPressureLow,          // 이완기 혈압
            Integer heartRate,                  // 심박수
            Integer bloodSugar,                 // 혈당
            BigDecimal bodyTemperature,     // 체온
            String notes                    // 특이사항
    ){}
    // 조회 요청을 위한 Dto
    public record VitalSearchDto(
            Integer id,
            LocalDateTime measurementTime,
            Integer bloodPressureHigh,
            Integer bloodPressureLow,
            Integer heartRate,
            Integer bloodSugar,
            BigDecimal bodyTemperature,
            boolean isNormal,
            String notes
    ){
        public static VitalSearchDto from(VitalSigns entity){
            return new VitalSearchDto(
                    entity.getId(),
                    entity.getMeasurementTime(),
                    entity.getBloodPressureHigh(),
                    entity.getBloodPressureLow(),
                    entity.getHeartRate(),
                    entity.getBloodSugar(),
                    entity.getBodyTemperature(),
                    entity.isNormal(),
                    entity.getNotes()
            );
        }
    }
    // 삭제 요청을 위한 Dto
    public record VitalDeleteDto(
            Integer id
    ){}
    // 수정 요청을 위한 Dto
    public record VitalUpdateDto(
            Integer id,
            LocalDateTime measurementTime,
            Integer bloodPressureHigh,
            Integer bloodPressureLow,
            Integer heartRate,
            Integer bloodSugar,
            BigDecimal bodyTemperature,
            String notes
    ){}


}
