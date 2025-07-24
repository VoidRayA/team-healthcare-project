package com.example.backend.dto.seviceDto;

import com.example.backend.DB.MonitoringSettings;
import lombok.Builder;

public class MonitoringSettingsDto {
    
    @Builder
    public record MonitoringSettingsResponseDto(
            Long id,
            // 혈압 (수축기)
            Integer bloodPressureAttentionMax,
            Integer bloodPressureAttentionMin,
            Integer bloodPressureCautionMax,
            Integer bloodPressureCautionMin,
            // 혈압 (이완기)
            Integer diastolicAttentionMax,
            Integer diastolicAttentionMin,
            Integer diastolicCautionMax,
            Integer diastolicCautionMin,
            // 심박수
            Integer heartRateAttentionMax,
            Integer heartRateAttentionMin,
            Integer heartRateCautionMax,
            Integer heartRateCautionMin,
            // 체온
            Double bodyTemperatureAttentionMax,
            Double bodyTemperatureAttentionMin,
            Double bodyTemperatureCautionMax,
            Double bodyTemperatureCautionMin,
            // 혈당
            Integer bloodSugarAttentionMax,
            Integer bloodSugarAttentionMin,
            Integer bloodSugarCautionMax,
            Integer bloodSugarCautionMin
    ) {
        public static MonitoringSettingsResponseDto from(MonitoringSettings settings) {
            return MonitoringSettingsResponseDto.builder()
                    .id(settings.getId())
                    .bloodPressureAttentionMax(settings.getBloodPressureAttentionMax())
                    .bloodPressureAttentionMin(settings.getBloodPressureAttentionMin())
                    .bloodPressureCautionMax(settings.getBloodPressureCautionMax())
                    .bloodPressureCautionMin(settings.getBloodPressureCautionMin())
                    .diastolicAttentionMax(settings.getDiastolicAttentionMax())
                    .diastolicAttentionMin(settings.getDiastolicAttentionMin())
                    .diastolicCautionMax(settings.getDiastolicCautionMax())
                    .diastolicCautionMin(settings.getDiastolicCautionMin())
                    .heartRateAttentionMax(settings.getHeartRateAttentionMax())
                    .heartRateAttentionMin(settings.getHeartRateAttentionMin())
                    .heartRateCautionMax(settings.getHeartRateCautionMax())
                    .heartRateCautionMin(settings.getHeartRateCautionMin())
                    .bodyTemperatureAttentionMax(settings.getBodyTemperatureAttentionMax())
                    .bodyTemperatureAttentionMin(settings.getBodyTemperatureAttentionMin())
                    .bodyTemperatureCautionMax(settings.getBodyTemperatureCautionMax())
                    .bodyTemperatureCautionMin(settings.getBodyTemperatureCautionMin())
                    .bloodSugarAttentionMax(settings.getBloodSugarAttentionMax())
                    .bloodSugarAttentionMin(settings.getBloodSugarAttentionMin())
                    .bloodSugarCautionMax(settings.getBloodSugarCautionMax())
                    .bloodSugarCautionMin(settings.getBloodSugarCautionMin())
                    .build();
        }
    }
    
    public record MonitoringSettingsCreateDto(
            // 혈압 (수축기)
            Integer bloodPressureAttentionMax,
            Integer bloodPressureAttentionMin,
            Integer bloodPressureCautionMax,
            Integer bloodPressureCautionMin,
            // 혈압 (이완기)
            Integer diastolicAttentionMax,
            Integer diastolicAttentionMin,
            Integer diastolicCautionMax,
            Integer diastolicCautionMin,
            // 심박수
            Integer heartRateAttentionMax,
            Integer heartRateAttentionMin,
            Integer heartRateCautionMax,
            Integer heartRateCautionMin,
            // 체온
            Double bodyTemperatureAttentionMax,
            Double bodyTemperatureAttentionMin,
            Double bodyTemperatureCautionMax,
            Double bodyTemperatureCautionMin,
            // 혈당
            Integer bloodSugarAttentionMax,
            Integer bloodSugarAttentionMin,
            Integer bloodSugarCautionMax,
            Integer bloodSugarCautionMin
    ) {}
    
    public record MonitoringSettingsUpdateDto(
            // 혈압 (수축기)
            Integer bloodPressureAttentionMax,
            Integer bloodPressureAttentionMin,
            Integer bloodPressureCautionMax,
            Integer bloodPressureCautionMin,
            // 혈압 (이완기)
            Integer diastolicAttentionMax,
            Integer diastolicAttentionMin,
            Integer diastolicCautionMax,
            Integer diastolicCautionMin,
            // 심박수
            Integer heartRateAttentionMax,
            Integer heartRateAttentionMin,
            Integer heartRateCautionMax,
            Integer heartRateCautionMin,
            // 체온
            Double bodyTemperatureAttentionMax,
            Double bodyTemperatureAttentionMin,
            Double bodyTemperatureCautionMax,
            Double bodyTemperatureCautionMin,
            // 혈당
            Integer bloodSugarAttentionMax,
            Integer bloodSugarAttentionMin,
            Integer bloodSugarCautionMax,
            Integer bloodSugarCautionMin
    ) {}
}